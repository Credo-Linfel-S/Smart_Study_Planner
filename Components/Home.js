import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase, ref, set, get, remove, push } from "firebase/database";
import { LinearGradient } from "expo-linear-gradient";
export default function Home({ route }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [username, setUsername] = useState(
    route.params?.firstName || "Username"
  );
  const [savedExams, setSavedExams] = useState([]);
  const [greeting, setGreeting] = useState(""); // State for greeting message
  const navigation = useNavigation();

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

    // Load user data from AsyncStorage
    const loadExams = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const parsedUser = userData ? JSON.parse(userData) : null;
        const username = parsedUser ? parsedUser.username : "Guest";

        console.log("Username:", username);

        // Fetch exams from Firebase for the user
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
          }));
          console.log("Exams:", exams);
          setSavedExams(exams); // Update state with exams
        } else {
          console.log("No exams found for this user.");
        }
      } catch (error) {
        console.log("Error loading exams:", error);
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

  // Handle new exam passed through route.params
  useEffect(() => {
    if (route.params?.savedExam) {
      const newExam = route.params.savedExam;

      // Add the new exam to local state
      setSavedExams((prevExams) => {
        const examExists = prevExams.some(
          (exam) =>
            exam.subject === newExam.subject &&
            exam.date === newExam.date &&
            exam.time === newExam.time
        );

        if (!examExists) {
          return [...prevExams, { id: newExam.id, ...newExam }];
        }
        return prevExams; // Avoid adding duplicates
      });

      // Save to Firebase
      const saveExamToFirebase = async (newExam) => {
        try {
          const db = getDatabase();
          const examsRef = ref(db, `exams/${username}`);
          const newExamRef = push(examsRef);
          await set(newExamRef, newExam); // Save the new exam to Firebase
        } catch (error) {
          console.log("Error saving exam to Firebase:", error);
        }
      };

      saveExamToFirebase(newExam);

      // Clear route.params to prevent re-triggering
      navigation.setParams({ savedExam: null });
    }
  }, [route.params?.savedExam]);

  // Function to delete an exam from Firebase and local state
  const deleteExam = async (examId) => {
    try {
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

  // Modal toggle
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  // Handle menu selection
  const handleMenuSelection = (routeName) => {
    setIsModalVisible(false);
    navigation.navigate(routeName);
  };

  // Logout logic
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      navigation.navigate("LogInForm");
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <LinearGradient
      colors={["#56465C", "#8A667B", "#5D5979"]}
      style={styles.gradientContainer} // Apply gradient to full screen
    >
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.nameOfUser}>Welcome, {String(username)}!</Text>
      {savedExams.length > 0 ? (
        <View style={styles.examContainer}>
          <Text style={styles.examTitle}>My Study Schedule List:</Text>
          <FlatList
            data={savedExams}
            keyExtractor={(item) => `${item.subject}-${item.date}-${item.time}`}
            renderItem={({ item }) => (
              <View style={styles.examCard}>
                <Text style={styles.examText}>{item.subject}</Text>
                <Text
                  style={styles.examText}
                >{`${item.date} at ${item.time}`}</Text>
                <Text style={styles.examText}>{`Chapter: ${item.module}`}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteExam(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete schedule</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      ) : (
        <Text>No exams saved yet</Text>
      )}
      <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <Modal
        visible={isModalVisible}
        onRequestClose={toggleModal}
        animationType="slide"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add new Study Schedule</Text>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleMenuSelection("Class")}
          >
            <Text style={styles.optionText}>Study Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={toggleModal}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
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
  nameOfUser: {
    fontSize: 20,
    fontWeight: 700,
  },
  examContainer: {
    width: "85%",
    flex: 1,
    marginTop: 0,
  },
  examTitle: {
    fontWeight: 1,
    fontSize: 20,
    top: 10,
    marginBottom: 20,
  },
  examCard: {
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
  },
  logoutText: {
    color: "#FFF",
    fontSize: 18,
    textAlign: "center",
  },
});
