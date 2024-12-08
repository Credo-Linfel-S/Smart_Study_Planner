import React, { useState, useEffect,useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Vibration,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import * as MediaLibrary from "expo-media-library";
import { format, parse } from "date-fns";
import * as Notifications from "expo-notifications";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
export default function EditExamSchedule({ route }) {
  const { exam } = route.params; // Receive passed data
  const [subject, setSubject] = useState(exam.subject);
  const [date, setDate] = useState(exam.date);
  const [time, setTime] = useState(exam.time);
  const [countdown, setCountdown] = useState(exam.countdown);
  const [examTimeReached, setExamTimeReached] = useState(exam.examTimeReached);
  const [module, setModule] = useState(exam.module);
  const [room, setRoom] = useState(exam.room);
  const navigation = useNavigation();
  const [audioFiles, setAudioFiles] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [sound, setSound] = useState(null);

  useEffect(() => {
         Notifications.setNotificationHandler({
           handleNotification: async () => ({
             shouldPlaySound: true,
             shouldShowAlert: true,
             shouldSetBadge: true,
           }),
         });
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
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
schedulePushNotification(examDateTime); 
        Alert.alert("Exam Time", `It's time for your ${subject} exam!`, [
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
 const schedulePushNotification = async (examDateTime) => {
   try {
     console.log("Scheduling notification for", examDateTime); // Log for debugging

     await Notifications.scheduleNotificationAsync({
       content: {
         title: "Exam Time!",
         body: `It's time for your exam session on ${subject}.`,
         sound: true,
         vibrate: [500, 1000, 500],
         //music:loadAndPlaySound(selectedAudio),
       },
       trigger: {
         // Set the trigger time to the studyDateTime
         timestamp: examDateTime.getTime(),
       },
     });

     console.log("Notification scheduled successfully!");
   } catch (error) {
     console.error("Error scheduling notification:", error);
   }
 };
 const [expoPushToken, setExpoPushToken] = useState();
 const [notification, setNotification] = useState();

 const notificationListener = useRef();
 const responseListener = useRef();

 async function registerForPushNotificationsAsync() {
   let token;
   if (Device.isDevice) {
     const { status: existingStatus } =
       await Notifications.getPermissionsAsync();
     let finalStatus = existingStatus;

     if (existingStatus !== "granted") {
       const { status } = await Notifications.requestPermissionsAsync();
       finalStatus = status;
     }
     if (finalStatus !== "granted") {
       alert("Failed to get push token for push notification");
       return;
     }

     token = await Notifications.getExpoPushTokenAsync({
       projectId: Constants.expoConfig?.extra?.eas.projectId,
     });
   } else {
     alert("Must be using a physical device for Push notifications");
   }

   // Set up notification channel for Android
   if (Platform.OS === "android") {
     await Notifications.setNotificationChannelAsync("default", {
       name: "default",
       importance: Notifications.AndroidImportance.MAX,
       vibrationPattern: [0, 250, 250, 250],
       lightColor: "#FF231F7C",
     });
   }

   return token;
 }
  useEffect(() => {
    // Register for notifications
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
    });

    // Listen for notifications
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

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

  const saveChanges = () => {
    const updatedExam = {
      id: exam.id,
      subject: subject || "",
      date: date || "",
      module: module || "",
      room: room || "",
      time: time || "",
      audioUri: selectedAudio,
    };
    startExamTimeCheck(date, time);
    navigation.navigate("Activities", { updatedExam }); // Pass updated study back
  };

  return (
    <LinearGradient
      colors={["#56465C", "#8A667B", "#5D5979"]}
      style={styles.gradientContainer}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Edit Exam Schedule</Text>
        <TextInput
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          placeholder="Subject"
        />
        <TextInput
          style={styles.input}
          value={module}
          onChangeText={setModule}
          placeholder="Module"
        />
        <TextInput
          style={styles.input}
          value={room}
          onChangeText={setRoom}
          placeholder="Date"
        />
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="Date"
        />
        <TextInput
          style={styles.input}
          value={time}
          onChangeText={setTime}
          placeholder="Time"
        />

        <Text style={styles.title}>Select Audio File:</Text>
        {audioFiles.length > 0 ? (
          <FlatList
            data={audioFiles}
            keyExtractor={(item) => item.id}
            renderItem={renderAudioItem}
          />
        ) : (
          <Text>No audio files found on your device.</Text>
        )}

        <TouchableOpacity
          style={styles.Cancel}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.CancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    top: 10,
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
    backgroundColor: "#2F8573",
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
    backgroundColor: "#A66E7C",
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
