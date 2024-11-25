import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase, ref, set, get, remove, push } from "firebase/database";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";

export default function Activities({ route }) {
   // const [isModalVisible, setIsModalVisible] = useState(false);
    const [username, setUsername] = useState(
      route.params?.firstName || "Username"
    );
    const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("Study Schedules"); // Track active tab
  const [savedStudies, setSavedStudies] = useState([]);
  const [savedExams, setSavedExams] = useState([]);
  const navigation = useNavigation();
 const [currentPlayingAudio, setCurrentPlayingAudio] = useState(null);
 const [currentSound, setCurrentSound] = useState(null);
  const stopAudio = async () => {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      setCurrentSound(null);
      setCurrentPlayingAudio(null);
    }
  };
  useEffect(() => {
    const loadExams = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const parsedUser = userData ? JSON.parse(userData) : null;
        const username = parsedUser ? parsedUser.username : "Guest";

        console.log("Username:", username);

        // Fetch Studies from Firebase for the user
        const db = getDatabase();
        const examsRef = ref(db, `exams/${username}`);
        const snapshot = await get(examsRef);

        if (snapshot.exists()) {
          const exams = Object.entries(snapshot.val()).map(([id, exam]) => ({
            id,
            subject: exam.subject, // Ensure subject exists
            type: exam.type, // Ensure type exists
            date: exam.date,
            time: exam.time,
            module: exam.module,
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
          console.log("Studies:", studies);
          setSavedStudies(studies); // Update state with studies
        } else {
          console.log("No studies found for this user.");
        }
      } catch (error) {
        console.log("Error loading studies:", error);
      }
    };
    loadStudies();
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

  const deleteStudy = async (studyId) => {
    try {
      const studyToDelete = savedStudies.find((study) => study.id === studyId);
      if (studyToDelete.audioUri === currentPlayingAudio) {
        await stopAudio(); // Stop playing audio if the deleted schedule is playing
      }

      const db = getDatabase();
      const studyRef = ref(db, `study/${username}/${studyId}`);
      await remove(studyRef); // Delete from Firebase

      // Remove from local state
      setSavedStudies((prevStudies) =>
        prevStudies.filter((study) => study.id !== studyId)
      );
      console.log(`Study with ID: ${studyId} has been deleted.`);
    } catch (error) {
      Alert.alert("Error", "Failed to delete study. Please try again.");
    }
  };

  const deleteExam = async (examId) => {
    try {
      const examToDelete = savedExams.find((exam) => exam.id === examId);
      if (examToDelete.audioUri === currentPlayingAudio) {
        await stopAudio(); // Stop playing audio if the deleted schedule is playing
      }

      const db = getDatabase();
      const examRef = ref(db, `exams/${username}/${examId}`);
      await remove(examRef); // Delete from Firebase

      // Remove from local state
      setSavedExams((prevExams) =>
        prevExams.filter((exam) => exam.id !== examId)
      );
      console.log(`Exam with ID: ${examId} has been deleted.`);
    } catch (error) {
      Alert.alert("Error", "Failed to delete exam. Please try again.");
    }
  };
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  // Handle menu selection
  const handleMenuSelection = (routeName) => {
    setIsModalVisible(false);
    navigation.navigate(routeName);
  };


  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#56465C", "#8A667B", "#5D5979"]}
        style={styles.gradientContainer} // Apply gradient to full screen
      >
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Ionicons name="arrow-back" size={30} color="black" top={10} />
        </TouchableOpacity>
        {/* Header */}
        <Text style={styles.headerText}>Activities</Text>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {["Study Schedules", "Exam Schedules"].map((tab, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveTab(tab)} // Update active tab on press
            >
              <Text style={activeTab === tab ? styles.activeTab : styles.tab}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === "Study Schedules" ? (
            <View>
              <View style={styles.studyContainer}>
                <FlatList
                  data={savedStudies}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.studyCard}>
                      <Text style={styles.studyText}>{item.subject}</Text>
                      <Text
                        style={styles.studyText}
                      >{`${item.date} at ${item.time}`}</Text>
                      <Text
                        style={styles.studyText}
                      >{`Chapter: ${item.module}`}</Text>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteStudy(item.id)}
                      >
                        <Text style={styles.deleteButtonText}>
                          Delete Study Schedule
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            </View>
          ) : (
            <View style={styles.examContainer}>
              <FlatList
                data={savedExams}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.examCard}>
                    <Text style={styles.examText}>{item.subject}</Text>
                    <Text
                      style={styles.examText}
                    >{`${item.date} at ${item.time}`}</Text>
                    <Text
                      style={styles.examText}
                    >{`Chapter: ${item.module}`}</Text>

                    <TouchableOpacity
                      style={styles.deleteButton2}
                      onPress={() => deleteExam(item.id)}
                    >
                      <Text style={styles.deleteButtonText2}>
                        Delete Exam Schedule
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
          <Ionicons name="menu" size={24} color="black" />
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
              onPress={() => handleMenuSelection("Home")}
            >
              <Text style={styles.optionText}>Home</Text>
              <Entypo
                name="home"
                size={24}
                color="black"
                marginTop={-25}
                left={20}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={toggleModal}>
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
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    // alignItems: "center",
    //justifyContent: "center",
    left: 3,
    height: 785,
    width: 352,
  },
  container: {
    backgroundColor: "#f6faff",
    //padding: 0,
  },
  image: {
    width: 30,
  },
  headerText: {
    top: 20,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 50,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderColor: "#ddd",
  },
  tab: {
    fontSize: 16,
    color: "gray",
    paddingVertical: 10,
  },
  activeTab: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
    borderBottomWidth: 3,
    borderBottomColor: "#000",
    paddingVertical: 10,
  },
  content: {
    marginTop: 20,
    alignItems: "center",
  },
  contentText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  studyContainer: {
    width: "85%",
    flex: 1,
    marginTop: 0,
  },
  studyTitle: {
    fontWeight: 1,
    fontSize: 20,
    top: 10,
    marginBottom: 20,
  },
  studyCard: {
    height: 160,
    width: 280,
    padding: 15,
    backgroundColor: "#2F8573",
    borderRadius: 5,
    marginBottom: 15,
  },
  studyText: {
    fontSize: 16,
  },
  examContainer: {
    width: "85%",
    flex: 1,
    marginTop: 0,
    marginLeft: 19,
  },
  examCard: {
    height: 160,
    width: 280,
    padding: 15,
    backgroundColor: "#2F8573",
    borderRadius: 5,
    marginBottom: 15,
  },
  examText: {
    fontSize: 16,
  },

  deleteButton: {
    marginTop: 10,
    backgroundColor: "#56465C",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  deleteButton2: {
    marginTop: 10,
    backgroundColor: "#56465C",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  deleteButtonText2: {
    color: "#FFF",
    fontSize: 16,
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
});
