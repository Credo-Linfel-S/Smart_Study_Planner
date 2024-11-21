import React, { useState,useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getDatabase, ref, set, push } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

const Class = ({route}) => {
  const [subject, setSubject] = useState("");
  const [resit, setResit] = useState(false);
  const [type, setType] = useState("Exam");
  const [mode, setMode] = useState("In Person");
  const [module, setModule] = useState("");
  const [seat, setSeat] = useState("");
  const [room, setRoom] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");

  const navigation = useNavigation();

  const handleSaveExam = async () => {
    if (!subject || !module || !date || !time || !duration) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    try {
      // Get user data from AsyncStorage
      const userData = await AsyncStorage.getItem("user");
      const parsedUser = userData ? JSON.parse(userData) : null;
      const username = parsedUser ? parsedUser.username : "Guest";

      // Save to Firebase Realtime Database
      const db = getDatabase();
      const userExamsRef = ref(db, `exams/${username}`); // Save exams under user-specific path

      const newExamRef = push(userExamsRef);
      await set(newExamRef, {
        subject,
        resit,
        type,
        mode,
        module,
        seat,
        room,
        date,
        time,
        duration,
        createdAt: new Date().toISOString(),
        username,
      });

      // Navigate back to Home screen with saved exam data
      navigation.navigate("Home", {
        savedExam: {
          subject,
          resit,
          type,
          mode,
          module,
          seat,
          room,
          date,
          time,
          duration,
          username,
        },
      });
    } catch (error) {
      Alert.alert("Error", "Failed to save exam. Please try again.");
    }
  };
useEffect(() => {
  if (route.params?.savedExam) {
    setSavedExams((prevExams) => {
      const updatedExams = [...prevExams, route.params.savedExam];
      console.log("Updated exams list:", updatedExams);
      return updatedExams;
    });
  }
}, [route.params?.savedExam]);

  const handleCancel = () => {
    navigation.navigate("Home");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>New Exam</Text>

      {/* Form Inputs for Exam */}
      <TextInput
        style={styles.input}
        placeholder="Subject"
        value={subject}
        onChangeText={setSubject}
      />
      <TextInput
        style={styles.input}
        placeholder="Module"
        value={module}
        onChangeText={setModule}
      />
      <TextInput
        style={styles.input}
        placeholder="Date"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Time"
        value={time}
        onChangeText={setTime}
      />
      <TextInput
        style={styles.input}
        placeholder="Duration"
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
      />

      {/* Buttons */}
      <TouchableOpacity onPress={handleCancel}>
        <Text>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSaveExam}>
        <Text>Save Exam</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f0f8ff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  section: { marginBottom: 15 },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  halfInputContainer: { width: "48%" },
  label: { marginBottom: 5, fontSize: 16 },
  buttonGroup: { flexDirection: "row", flexWrap: "wrap" },
  button: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#007bff",
    backgroundColor: "white",
    marginRight: 5,
    marginBottom: 5,
  },
  buttonSelected: { backgroundColor: "#007bff" },
  buttonText: { color: "#007bff", fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "white",
  },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between" },
  cancelButton: {
    padding: 15,
    backgroundColor: "#ff4d4d",
    borderRadius: 5,
    flex: 0.45,
  },
  saveButton: {
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 5,
    flex: 0.45,
  },
});
export default Class;
