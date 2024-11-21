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
  import { getDatabase, ref, set, get,remove } from "firebase/database"; // Import Firebase functions

  export default function Home({ route }) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [username, setUsername] = useState("User");
    const [savedExams, setSavedExams] = useState([]); // State to store multiple exams
    const navigation = useNavigation();

    // Load user data from AsyncStorage
    useEffect(() => {
      const loadExams = async () => {
        try {
          // Get user data from AsyncStorage
          const userData = await AsyncStorage.getItem("user");
          const parsedUser = userData ? JSON.parse(userData) : null;
          const username = parsedUser ? parsedUser.username : "Guest";

          console.log("Username:", username); // Log to check if username is fetched correctly

          // Fetch exams for the logged-in user from Firebase
          const db = getDatabase();
          const examsRef = ref(db, `exams/${username}`);
          const snapshot = await get(examsRef);

          if (snapshot.exists()) {
            const exams = Object.values(snapshot.val());
            console.log("Exams:", exams); // Log the exams to see if they are fetched
            setSavedExams(exams); // Set the exams data in state
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

        // Add to local state
        setSavedExams((prevExams) => {
          const examExists = prevExams.some(
            (exam) =>
              exam.subject === newExam.subject &&
              exam.date === newExam.date &&
              exam.time === newExam.time
          );

          if (!examExists) {
            return [...prevExams, newExam];
          }
          return prevExams; // Avoid adding duplicates
        });

        // Save to Firebase
      const saveExamToFirebase = async (newExam) => {
        try {
          const db = getDatabase();
          const examsRef = ref(db, `exams/${username}`);
         // const newExamRef = child(examsRef, newExam.id); 
           const newExamRef = push(examsRef); // Generates a new unique key
           await set(newExamRef, newExam);// Ensure that each exam has a unique ID
          // Save the new exam with a unique ID
        } catch (error) {
          console.log("Error saving exam to Firebase:", error);
        }
      };
        saveExamToFirebase();

        // Clear route.params to prevent re-triggering
        navigation.setParams({ savedExam: null });
      }
    }, [route.params?.savedExam]);

    // Function to delete an exam from Firebase and local state
 const deleteExam = async (examId) => {
   try {
     // Delete from Firebase Realtime Database
     const db = getDatabase();
     const examRef = ref(db, `exams/${username}/${examId}`);
     await remove(examRef); // Remove the exam from Firebase

     // Remove from local state by filtering out the exam with the same id
     setSavedExams(
       (prevExams) => prevExams.filter((exam) => exam.id !== examId) // Only delete the item with matching id
     );
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
      <View style={styles.container}>
        <Text style={styles.greeting}>Good Afternoon!</Text>
        <Text>Welcome, {String(username)}!</Text>

        {savedExams.length > 0 ? (
          <View style={styles.examContainer}>
            <Text style={styles.examTitle}>Exams List:</Text>
            <FlatList
              data={savedExams}
              keyExtractor={(item) => item.id} // Assuming the 'id' is unique now
              renderItem={({ item }) => (
                <View style={styles.examCard}>
                  <Text
                    style={styles.examText}
                  >{`${item.subject} - ${item.type}`}</Text>
                  <Text
                    style={styles.examText}
                  >{`${item.date} at ${item.time}`}</Text>
                  <Text
                    style={styles.examText}
                  >{`Module: ${item.module}`}</Text>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteExam(item.id)} // Pass the exam id to delete
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
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
            <Text style={styles.modalTitle}>Select a Route</Text>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleMenuSelection("Class")}
            >
              <Text style={styles.optionText}>Classes</Text>
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
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F0F8FF",
    },
    greeting: {
      fontSize: 18,
      color: "#333",
    },
    examContainer: {
      width: "90%",
      flex: 1,
      marginTop: 10,
    },
    examTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
    },
    examCard: {
      padding: 15,
      backgroundColor: "#FFF",
      borderRadius: 5,
      marginBottom: 15,
    },
    examText: {
      fontSize: 16,
    },
    deleteButton: {
      marginTop: 10,
      backgroundColor: "#FF6347",
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
      bottom: 50,
      right: 20,
      backgroundColor: "#00C8FF",
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
      backgroundColor: "#FFF",
      padding: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 20,
    },
    optionButton: {
      backgroundColor: "#00C8FF",
      width: 200,
      padding: 15,
      marginBottom: 10,
      borderRadius: 5,
      alignItems: "center",
    },
    optionText: {
      color: "#FFF",
      fontSize: 18,
    },
    cancelButton: {
      backgroundColor: "gray",
      width: 200,
      padding: 15,
      marginTop: 20,
      borderRadius: 5,
      alignItems: "center",
    },
    cancelText: {
      color: "#FFF",
      fontSize: 18,
    },
    buttonContainer: {
      marginTop: 20,
    },
    logoutButton: {
      backgroundColor: "#FF6347",
      padding: 15,
      width: 200,
      borderRadius: 5,
      alignItems: "center",
    },
    logoutText: {
      color: "#FFF",
      fontSize: 18,
    },
  });
