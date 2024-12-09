import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  FlatList,
  Animated,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase, ref, set, get, remove, push } from "firebase/database";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Home({ route }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [username, setUsername] = useState(
    route.params?.firstName || "Guest" //route.params?.username ||
  );

  const [savedStudies, setSavedStudies] = useState([]);
  const [savedExams, setSavedExams] = useState([]);
  const [greeting, setGreeting] = useState(""); // State for greeting message
  const navigation = useNavigation();
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState(null);
  const [currentSound, setCurrentSound] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [rotation, setRotation] = useState(new Animated.Value(0));
  const stopAudio = async () => {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      setCurrentSound(null);
      setCurrentPlayingAudio(null);
    }
  };
  useEffect(() => {
    console.log("First Name from route:", username);

    // Set greeting based on the time of day
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      setGreeting("Good Morning!");
    } else if (currentHour >= 12 && currentHour < 17) {
      setGreeting("Good Afternoon!");
    } else if (currentHour >= 17 && currentHour < 20) {
      setGreeting("Good Evening!");
    } else {
      setGreeting("Good Night!");
    }
    const today = new Date();
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }).format(today);
    setCurrentDate(formattedDate);

  const loadStudies = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const parsedUser = userData ? JSON.parse(userData) : null;
      const username = parsedUser ? parsedUser.username : "Guest";

      console.log("Username:", username);

      // Fetch Studies from Firebase for the user
      const db = getDatabase();
      const studiesRef = ref(db, `study/${username}`);
      const snapshot = await get(studiesRef);

      if (snapshot.exists()) {
        const studies = Object.entries(snapshot.val()).map(([id, study]) => ({
          id,
          subject: study.subject, // Ensure subject exists
          type: study.type, // Ensure type exists
          date: study.date,
          time: study.time,
          module: study.module,
          audioUri: study.audioUri,
        }));
        console.log(`Studies ${savedStudies.length} found for this user.`);
        console.log("Studies:", studies);
        setSavedStudies(studies); // Update state with studies
      } else {
        console.log(`No studies ${savedStudies.length} found for this user.`);
      }
    } catch (error) {
      console.log("Error loading studies:", error);
    }
  };

  loadStudies();


    const loadExams = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const parsedUser = userData ? JSON.parse(userData) : null;
        const username = parsedUser ? parsedUser.username : "User";
const firstName = parsedUser ? parsedUser.firstName : "User";
        console.log("Username:", firstName);

        // Fetch Studies from Firebase for the user
        const db = getDatabase();
        const examsRef = ref(db, `exam/${username}`);
        const snapshot = await get(examsRef);

        if (snapshot.exists()) {
          const exams = Object.entries(snapshot.val()).map(([id, exam]) => ({
            id,
            subject: exam.subject, // Ensure subject exists
            type: exam.type, // Ensure type exists
            date: exam.date,
            time: exam.time,
            module: exam.module,
            room: exam.room,
            audioUri: exam.audioUri,
          }));
          console.log(`Exams ${savedExams.length} found for this user.`);
          console.log("Exams:", exams);
          setSavedExams(exams); // Update state with studies
        } else {
          console.log("No exams found for this user.");
        }
      } catch (error) {
        console.log("Error loading studies:", error);
      }
    };

    loadExams();

    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUsername(parsedUser.username);
        }
      } catch (error) {
        console.log("Error loading user data from AsyncStorage:", error);
      }
    };

    loadUserData();
  }, []);

  // Modal toggle
  const toggleModal = () => {
    Animated.timing(rotation, {
      toValue: 1, // Rotate 360 degrees (1 full circle)
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      rotation.setValue(0);
      setIsModalVisible(!isModalVisible);
    });
  };
  const handleCancel = () => {
    Animated.timing(rotation, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
    setIsModalVisible(false);
  };

  const handleMenuSelection = (routeName) => {
    setIsModalVisible(false);
    navigation.navigate(routeName);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      navigation.navigate("LogInForm");
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };
  // Initialize rotation value

  // Rotate animation function

  // Interpolate rotation value to create a 360-degree effect
  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });
  return (
    <LinearGradient
      colors={["#56465C", "#8A667B", "#5D5979"]}
      style={styles.gradientContainer} // Apply gradient to full screen
    >
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.nameOfUser}>
        Welcome, {String(username)}!
      </Text>
      <Text style={styles.dateText}>{currentDate}</Text>
      {/* Study button with the count of study schedules */}

      <Text style={styles.StudyButton}>{`${savedStudies.length} Study `}</Text>

      <Text style={styles.ExamButton}>{`${savedExams.length} Exam `}</Text>

      <Image
        source={require("../Components/assets/Study.png")}
        style={styles.Image}
      />

      <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="menu" size={24} color="black" />
        </Animated.View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        onRequestClose={toggleModal}
        animationType="slide"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Menu</Text>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleMenuSelection("StudySchedule")}
          >
            <Text style={styles.optionText}>Study Schedule</Text>
            <Entypo
              name="book"
              size={24}
              color="black"
              marginTop={-25}
              left={20}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleMenuSelection("ExamSchedule")}
          >
            <Text style={styles.optionText}>Exam Schedule</Text>
            <FontAwesome
              name="sticky-note"
              size={24}
              color="black"
              marginTop={-25}
              left={20}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleMenuSelection("Activities")}
          >
            <Text style={styles.optionText}>View Activities</Text>
            <Feather
              name="activity"
              size={24}
              color="black"
              marginTop={-25}
              left={20}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
            <MaterialIcons
              name="cancel"
              size={24}
              color="black"
              marginTop={-25}
              left={20}
            />
          </TouchableOpacity>
        </View>
      </Modal>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
          <MaterialIcons
            name="logout"
            size={24}
            color="black"
            marginTop={-25}
            left={70}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: 40,
    fontWeight: 800,
    color: "#333",
  },
  StudyButton: {
    marginRight: 100,
    marginTop: 10,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 10,
    borderRadius: 5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    borderWidth: 1,
  },
  Image: {
    width: 160,
    height: 350,
  },
  ExamButton: {
    marginTop: -39,
    marginLeft: 100,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 10,
    borderRadius: 5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    borderWidth: 1,
  },
  nameOfUser: {
    fontSize: 20,
    fontWeight: 700,
  },
  addButton: {
    position: "absolute",
    bottom: 70,
    right: 20,
    backgroundColor: "#2F8573",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: 24,
    color: "#FFF",
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#93697B",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 20,
  },

  optionButton: {
    backgroundColor: "#087E8B",
    width: 250,
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  optionText: {
    color: "#FFF",
    fontSize: 18,
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#56465C",
    width: 250,
    padding: 15,
    borderRadius: 5,
  },
  cancelText: {
    color: "#FFF",
    fontSize: 18,
    textAlign: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 15,
    width: "80%",
    borderRadius: 5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    borderWidth: 1,
  },
  logoutText: {
    color: "#FFF",
    fontSize: 18,
    textAlign: "center",
  },
  dateText: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 5,
  },
});
