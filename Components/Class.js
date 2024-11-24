import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Vibration,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getDatabase, ref, set, push } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, parse } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
// Importing Audio module
import { Audio } from "expo-av";

Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
  interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
  interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
});

const Class = ({ route }) => {
  const [subject, setSubject] = useState("");
  const [module, setModule] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [examTimeReached, setExamTimeReached] = useState(false);

  const navigation = useNavigation();

  const handleSaveExam = async () => {
    if (!subject || !module || !date || !time) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])-(\d{4})$/;
    if (!dateRegex.test(date)) {
      Alert.alert(
        "Invalid Date Format",
        "Please enter the date in MM-DD-YYYY format."
      );
      return;
    }

    try {
      const userData = await AsyncStorage.getItem("user");
      const parsedUser = userData ? JSON.parse(userData) : null;
      const username = parsedUser ? parsedUser.username : "Guest";

      const db = getDatabase();
      const userExamsRef = ref(db, `exams/${username}`);
      const newExamRef = push(userExamsRef);
      await set(newExamRef, {
        subject,
        module,
        date,
        time,
        duration,
        createdAt: new Date().toISOString(),
        username,
      });

      navigation.navigate("Home", {
        savedExam: { subject, module, date, time, duration, username },
      });

      startExamTimeCheck(date, time, duration);
    } catch (error) {
      Alert.alert("Error", "Failed to save Study Schedule. Please try again.");
    }
  };

  const playSound = async () => {
    const sound = new Audio.Sound();
    try {
      await sound.loadAsync(require("./assets/notification.mp3")); // Replace with your sound file path
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    } finally {
      // Unload the sound after playing
      sound.unloadAsync();
    }
  };

  const startExamTimeCheck = (examDate, examTime, examDuration) => {
    const examTime24h = convertTo24HourFormat(examTime);
    const examDateTimeString = `${examDate} ${examTime24h}`;
    const examDateTime = parse(
      examDateTimeString,
      "MM-dd-yyyy HH:mm",
      new Date()
    );

    if (isNaN(examDateTime)) {
      console.error("Failed to parse exam date/time:", examDateTimeString);
      Alert.alert("Error", "Invalid exam date or time.");
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const timeRemaining = examDateTime - now;

      if (timeRemaining <= 0 && !examTimeReached) {
        clearInterval(interval);
        setExamTimeReached(true);

        // Vibrate and play sound
        Vibration.vibrate([500, 1000, 500, 1000, 500, 1000]);
        playSound();
        Alert.alert("Exam Time", `It's time for your ${subject} study!`);
      }

      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      setCountdown(`${hours}:${minutes}:${seconds}`);
    }, 1000);
  };

  const convertTo24HourFormat = (time12h) => {
    const [time, modifier] = time12h.split(/(AM|PM)/i);
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier.toUpperCase() === "PM" && hours < 12) {
      hours += 12;
    } else if (modifier.toUpperCase() === "AM" && hours === 12) {
      hours = 0;
    }

    return `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
  };

  return (
    <LinearGradient
      colors={["#56465C", "#8A667B", "#5D5979"]}
      style={styles.gradientContainer}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Set Study Schedule</Text>

        <TextInput
          style={styles.input}
          placeholder="Subject"
          value={subject}
          onChangeText={setSubject}
        />
        <TextInput
          style={styles.input}
          placeholder="Chapter"
          value={module}
          onChangeText={setModule}
        />
        <TextInput
          style={styles.input}
          placeholder="Date (MM-DD-YYYY)"
          value={date}
          onChangeText={setDate}
        />
        <TextInput
          style={styles.input}
          placeholder="Time"
          value={time}
          onChangeText={setTime}
        />

        {countdown && !examTimeReached && (
          <Text style={styles.countdown}>Countdown: {countdown}</Text>
        )}

        <TouchableOpacity
          style={styles.Cancel}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.CancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveExam} onPress={handleSaveExam}>
          <Text style={styles.saveExamText}>Save Study Schedule</Text>
        </TouchableOpacity>

        {examTimeReached && (
          <Text style={styles.notification}>
            It's time for your {subject} study!
          </Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  saveExam: {
    marginTop: 10,
    backgroundColor: "#56465C",
    padding: 10,
    borderRadius: 5,
  },
  saveExamText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
  },
  Cancel: {
    marginTop: 10,
    backgroundColor: "#56465C",
    padding: 10,
    borderRadius: 5,
  },
  CancelText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
  },
  container: { padding: 20, backgroundColor: "#f0f8ff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "white",
    marginBottom: 10,
  },
  countdown: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    color: "green",
  },
  notification: {
    fontSize: 18,
    fontWeight: "bold",
    color: "red",
    marginTop: 20,
  },
});


export default Class;
