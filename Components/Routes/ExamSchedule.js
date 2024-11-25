import React, { useState, useEffect,useRef } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Vibration,
  View,
  FlatList,
Platform,KeyboardAvoidingView, ScrollView
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { getDatabase, ref, set, push } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, parse } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import * as MediaLibrary from "expo-media-library";
//import {  } from "react-native-web";

// Initialize audio settings for playback
Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
  interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
  interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
});

export default ExamSchedule = ({ route }) => {
  const [subject, setSubject] = useState("");
  const [module, setModule] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [room, setRoom] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [examTimeReached, setExamTimeReached] = useState(false);
  const [audioFiles, setAudioFiles] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [sound, setSound] = useState(null);

  const navigation = useNavigation();

  // Request permissions for media library and fetch audio files
  useEffect(() => {
    const getPermissionsAndFiles = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        fetchAudioFiles();
      } else {
        alert("Permission to access media library is required!");
      }
    };

    getPermissionsAndFiles();

    return () => {
      if (sound) {
        sound.unloadAsync(); // Cleanup on component unmount
      }
    };
  }, [sound]);

  const fetchAudioFiles = async () => {
    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 20,
      });
      setAudioFiles(media.assets);
    } catch (error) {
      console.error("Error fetching audio files:", error);
    }
  };

  const loadAndPlaySound = async (uri) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        // Unload any existing sound before loading a new one
      }

      const newSound = new Audio.Sound();
      await newSound.loadAsync({ uri });
      setSound(newSound); // Store the sound reference in the state
      console.log("Playing sound..."); // Log to confirm it's being played
      await newSound.playAsync();

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          stopSound(); // Ensure sound is stopped and unloaded
        }
      });
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // In your Alert for stopping sound:
  const stopSound = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (error) {
        console.error("Error stopping sound:", error);
      } finally {
        setSound(null); // Ensure the sound state is reset
      }
    }
  };

  const handleSaveExam = async () => {
    if (!subject || !module || !date || !time || !selectedAudio || !room) {
      Alert.alert(
        "Error",
        "Please fill in all required fields and select an audio file."
      );
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
       room,
        audioUri: selectedAudio,
        createdAt: new Date().toISOString(),
        username,
      });

      navigation.navigate("Home", {
        savedExam: {
          subject,
          module,
          room,
          date,
          time,
          audioUri: selectedAudio,
          username,
        },
      });

      startExamTimeCheck(date, time);
    } catch (error) {
      Alert.alert("Error", "Failed to save Exam Schedule. Please try again.");
    }
  };

  const startExamTimeCheck = (examDate, examTime) => {
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

    let interval = null;
    interval = setInterval(() => {
      const now = new Date();
      const timeRemaining = examDateTime - now;

      if (timeRemaining <= 0 && !examTimeReached) {
        setExamTimeReached(true);
        clearInterval(interval); // Stop the interval

        Vibration.vibrate([500, 1000, 500, 1000, 500, 1000]);
        loadAndPlaySound(selectedAudio);

        Alert.alert("Exam Time", `It's time for your ${subject} Exam!`, [
          {
            text: "Okay",
            onPress: async () => {
              await stopSound(); // Force-stop sound
              setSound(null); // Reset state to ensure no lingering sound instance
              console.log("Audio stopped via Alert.");
            },
          },
        ]);
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

  const renderAudioItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.audioItem,
        selectedAudio === item.uri && styles.audioItemSelected,
      ]}
      onPress={() => setSelectedAudio(item.uri)}
    >
      <Text style={styles.audioText}>{item.filename}</Text>
    </TouchableOpacity>
  );

 const renderAudioSection = () => (
   <View>
     <Text style={styles.title}>Select Audio File:</Text>
     {audioFiles.length > 0 ? (
       <FlatList
         data={audioFiles}
         keyExtractor={(item) => item.id}
         renderItem={renderAudioItem}
         style={{ maxHeight: 120 }} // Constrain height to avoid overflows
       />
     ) : (
       <Text>No audio files found on your device.</Text>
     )}
   </View>
 );


  return (

    
        <LinearGradient
          colors={["#56465C", "#8A667B", "#5D5979"]}
          style={styles.gradientContainer}
        >
          <View style={styles.container}>
            <Text style={styles.header}>Set Exam Schedule</Text>

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
              placeholder="Room"
              value={room}
              onChangeText={setRoom}
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

            {renderAudioSection()}
            <TouchableOpacity
              style={styles.Cancel}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.CancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveExam}
            >
              <Text style={styles.saveButtonText}>Save Schedule</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
     
    
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
   
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    top:10,
    height: 670,
    width: "90%",
    backgroundColor: "#5E5A79",
    borderRadius: 8,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  audioItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#C1CDC1",
    borderRadius: 5,
  },
  audioItemSelected: {
    backgroundColor: "#D3B8A6",
  },
  audioText: {
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#A66E7C",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
  },
  Cancel: {
    backgroundColor: "#2F8573",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  CancelText: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
  },
});
