import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Modal,
  ScrollView,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getDatabase,
  ref,
  set,
  get,
  remove,
  push,
  update,
} from "firebase/database";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
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
  const [rotation, setRotation] = useState(new Animated.Value(0));
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const stopAudio = async () => {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      setCurrentSound(null);
      setCurrentPlayingAudio(null);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        await fetchSchedules("study", setSavedStudies);
        await fetchSchedules("exam", setSavedExams);
      };

      loadData();
    }, [])
  );
  useEffect(() => {
    const loadExams = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        const parsedUser = userData ? JSON.parse(userData) : null;
        const username = parsedUser ? parsedUser.username : "Guest";

        console.log("Username:", username);

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
          console.log("Exams:", exams);
          setSavedExams(exams); // Update state with studies
        } else {
          console.log("No exams found for this user.");
        }
      } catch (error) {
        console.log("Error loading exams:", error);
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

  useEffect(() => {
    if (route.params?.updatedStudy) {
      const updatedStudy = route.params.updatedStudy;

      // Update the study in the local state
      setSavedStudies((prevStudies) =>
        prevStudies.map((study) =>
          study.id === updatedStudy.id ? updatedStudy : study
        )
      );

      // Save the updated study to Firebase
      const saveUpdatedStudy = async () => {
        try {
          const userData = await AsyncStorage.getItem("user");
          const parsedUser = JSON.parse(userData);
          const username = parsedUser?.username || "Guest";

          const db = getDatabase();
          const studyRef = ref(db, `study/${username}/${updatedStudy.id}`);
          await update(studyRef, updatedStudy);
          console.log("Study schedule updated successfully!");
        } catch (error) {
          console.error("Error saving updated study:", error);
        }
      };

      saveUpdatedStudy();
    }
  }, [route.params?.updatedStudy]);

  useEffect(() => {
    if (savedExams.length === 0) {
      console.log("No exams to display.");
    } else {
      console.log("Exams to display:", savedExams);
    }
  }, [savedExams]);
  useEffect(() => {
    if (route.params?.updatedExam) {
      const updatedExam = route.params.updatedExam;

      // Update the study in the local state
      setSavedExams((prevExams) =>
        prevExams.map((exam) =>
          exam.id === updatedExam.id ? updatedExam : exam
        )
      );
      const saveUpdatedExam = async () => {
        try {
          const userData = await AsyncStorage.getItem("user");
          const parsedUser = JSON.parse(userData);
          const username = parsedUser?.username || "Guest";

          const db = getDatabase();
          const examRef = ref(db, `exam/${username}/${updatedExam.id}`);
          await update(examRef, updatedExam);
          console.log("Exam schedule updated successfully!");

          // Fetch updated exams
          fetchSchedules("exam", setSavedExams);
        } catch (error) {
          console.error("Error saving updated exam:", error);
        }
      };

      saveUpdatedExam();
    }
  }, [route.params?.updatedExam]);

  const deleteExam = async (examId) => {
    try {
      const examToDelete = savedExams.find((exam) => exam.id === examId);
      if (examToDelete.audioUri === currentPlayingAudio) {
        await stopAudio(); // Stop playing audio if the deleted schedule is playing
      }

      const db = getDatabase();
      const examRef = ref(db, `exam/${username}/${examId}`);
      await remove(examRef); // Delete from Firebase

      // Remove from local state
      setSavedExams((prevExams) =>
        prevExams.filter((exam) => exam.id !== examId)
      );
      console.log(`Exam with ID: ${examId} has been deleted.`);
    } catch (error) {
      Alert.alert("Error", "Failed to delete study. Please try again.");
    }
  };
  const toggleModal = () => {
    Animated.timing(rotation, {
      toValue: 1, // Rotate 360 degrees (1 full circle)
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      rotation.setValue(1);
      setIsModalVisible(!isModalVisible);
    });
  };
  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  const handleCancel = () => {
    Animated.timing(rotation, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
    setIsModalVisible(false);
  };

  // Handle menu selection
  const handleMenuSelection = (routeName) => {
    setIsModalVisible(false);
    navigation.navigate(routeName);
  };

  // Utility to fetch user data
  const getUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      return userData ? JSON.parse(userData) : { username: "Guest" };
    } catch (error) {
      console.error("Error fetching user data:", error);
      return { username: "Guest" };
    }
  };

  // Utility to fetch Firebase data
  const fetchData = async (path, username, setDataCallback) => {
    try {
      const db = getDatabase();
      const dataRef = ref(db, `${path}/${username}`);
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
        const data = Object.entries(snapshot.val()).map(([id, item]) => ({
          id,
          ...item,
        }));
        setDataCallback(data);
      } else {
        console.log(`No ${path} found for this user.`);
      }
    } catch (error) {
      console.error(`Error fetching ${path}:`, error);
    }
  };

  useEffect(() => {
    const loadUserDataAndSchedules = async () => {
      const user = await getUserData();
      fetchData("study", user.username, setSavedStudies);
      fetchData("exam", user.username, setSavedExams);
      setUsername(user.username);
    };

    loadUserDataAndSchedules();
  }, []);

  const fetchSchedules = async (path, setData) => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const parsedUser = userData
        ? JSON.parse(userData)
        : { username: "Guest" };
      const db = getDatabase();
      const refPath = ref(db, `${path}/${parsedUser.username}`);
      const snapshot = await get(refPath);

      if (snapshot.exists()) {
        const data = Object.entries(snapshot.val()).map(([id, item]) => ({
          id,
          ...item,
        }));
        setData(data);
      } else {
        console.log(`No data found for ${path}.`);
      }
    } catch (error) {
      console.error(`Error fetching ${path}:`, error);
    }
  };

  useEffect(() => {
    fetchSchedules("study", setSavedStudies);
    fetchSchedules("exam", setSavedExams);
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
  console.log(`Exam Schedules ${savedExams.length} found for this user.`);
  console.log(`Study Schedules ${savedStudies.length} found for this user.`);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#56465C", "#8A667B", "#5D5979"]}
        style={styles.gradientContainer} // Apply gradient to full screen
      >
        <TouchableOpacity onPress={() => navigation.goBack("Home")}>
          <Ionicons name="arrow-back" size={30} color="black" top={10} />
        </TouchableOpacity>

        <Text style={styles.headerText}>Activities</Text>

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
                {savedStudies.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No study schedules available.
                  </Text>
                ) : (
                  <FlatList
                    data={savedStudies}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    onEndReachedThreshold={0.9}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.studyCard}>
                        <Text style={styles.studyText}>
                          {`Subject: ${item.subject}`}
                        </Text>
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
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => {
                            navigation.navigate("EditStudySchedule", {
                              study: item,
                            }); // Navigate and pass the study item
                          }}
                        >
                          <AntDesign name="edit" size={24} color="black" />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                )}
              </View>
            </View>
          ) : (
            <View style={styles.examContainer}>
              {savedExams.length === 0 ? (
                <Text style={styles.emptyText2}>
                  No exam schedules available.
                </Text>
              ) : (
                <FlatList
                  data={savedExams}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  showsVerticalScrollIndicator={false}
                  onEndReachedThreshold={0.9}
                  renderItem={({ item }) => (
                    <View style={styles.examCard}>
                      <Text
                        style={styles.examText}
                      >{`Subject: ${item.subject}`}</Text>
                      <Text
                        style={styles.examText}
                      >{`${item.date} at ${item.time}`}</Text>
                      <Text
                        style={styles.examText}
                      >{`Chapter: ${item.module}`}</Text>
                      <Text
                        style={styles.examText}
                      >{`Room: ${item.room}`}</Text>

                      <TouchableOpacity
                        style={styles.deleteButton2}
                        onPress={() => deleteExam(item.id)}
                      >
                        <Text style={styles.deleteButtonText2}>
                          Delete Exam Schedule
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                          navigation.navigate("EditExamSchedule", {
                            exam: item,
                          }); // Navigate and pass the study item
                        }}
                      >
                        <AntDesign name="edit" size={24} color="black" />
                      </TouchableOpacity>
                    </View>
                  )}
                />
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={toggleModal}
         // onPressOut={() => setIsHovered(false)}
        >
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
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
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
  },

  headerText: {
    top: 20,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 50,
  },
  image: {
    width: 30,
  },
  emptyText: {
    alignSelf: "center",
    textAlign: "center",
    left: 10,
  },
  emptyText2: {
    alignSelf: "center",
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
    marginTop: 2,
    alignItems: "center",
    height: 550,
  },
  contentText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
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
    borderColor: "rgba(255, 255, 255, 0.6)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 5,
    borderWidth: 4,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  studyText: {
    fontSize: 16,
  },

  content2: {
    marginTop: 0,
    alignItems: "center",
  },
  examContainer: {
    width: "85%",
    flex: 1,
    marginTop: 0,
    marginLeft: 19,
  },

  contentText2: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  examCard: {
    height: 165,
    width: 280,
    padding: 15,
    borderColor: "rgba(255, 255, 255, 0.6)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 5,
    borderWidth: 4,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  examText: {
    fontSize: 16,
  },

  deleteButton: {
    width: 190,
    marginTop: 10,
    backgroundColor: "#A66E7C",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  editButton: {
    left: 200,
    bottom: 53,
    width: 50,
    marginTop: 10,
    backgroundColor: "#5E5A79",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  deleteButton2: {
    width: 190,
    marginTop: 10,
    backgroundColor: "#A66E7C",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  deleteButtonText2: {
    color: "#FFF",
    fontSize: 16,
  },
  editButton2: {
    marginTop: 10,
    backgroundColor: "#56465C",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  editButtonText2: {
    color: "#FFF",
    fontSize: 16,
  },
  addButton: {
    position: "absolute",
    top: 20,
    right: 10,
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
