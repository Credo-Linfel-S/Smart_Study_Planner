import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Vibration,
  View,
  FlatList,
  Platform,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getDatabase, ref, set, push } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, parse } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import * as MediaLibrary from "expo-media-library";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

const StudySchedule = ({ route }) => {
  const [subject, setSubject] = useState("");
  const [module, setModule] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [studyTimeReached, setStudyTimeReached] = useState(false);
  const [audioFiles, setAudioFiles] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [sound, setSound] = useState(null);
  const [update, setUpdate] = useState();
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState("");
  const [notificationHandler, setNotificationHandler] = useState("");
  // Request permissions for media library and fetch audio files
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
      staysActiveInBackground: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      shouldDuckAndroid: true,
      shouldPlay: true,
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedFirstName = await AsyncStorage.getItem("firstName");
        const storedUsername = await AsyncStorage.getItem("username");

        if (storedFirstName) setFirstName(storedFirstName);
        if (storedUsername) setUsername(storedUsername);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const startStudyTimeCheck = (studyDate, studyTime) => {
    const studyTime24h = convertTo24HourFormat(studyTime);
    const studyDateTimeString = `${studyDate} ${studyTime24h}`;
    const studyDateTime = parse(
      studyDateTimeString,
      "MM-dd-yyyy HH:mm",
      new Date()
    );

    if (isNaN(studyDateTime)) {
      console.error("Failed to parse study date/time:", studyDateTimeString);
      Alert.alert("Error", "Invalid study date or time.");
      return;
    }

    let interval = null;
    interval = setInterval(() => {
      const now = new Date();
      const timeRemaining = studyDateTime - now;

      if (timeRemaining <= 0 && !studyTimeReached) {
        setStudyTimeReached(true);
        clearInterval(interval); // Stop the interval

        Vibration.vibrate([500, 1000, 500, 1000, 500, 1000]);
        loadAndPlaySound(selectedAudio);

        schedulePushNotification(studyDateTime);
        setShowModal(true);
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

  const schedulePushNotification = async (studyDateTime) => {
    try {
      console.log("Scheduling notification for", studyDateTime);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Study Time!",
          body: `It's time for your study session on ${subject}.`,
          sound: "default",
          vibrate: [500, 1000, 500],
        },
        trigger: {
          // Set the trigger time to the studyDateTime
          timestamp: studyDateTime.getTime(),
          channelId: "alarm-channel",
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

  useEffect(() => {
    const responseListener =
      Notifications.addNotificationResponseReceivedListener(
        async (response) => {
          console.log(
            "Notification received in background or foreground",
            response
          );

          // Check if the notification is related to study time and play sound
          if (response.notification.request.content.title === "Study Time!") {
            setModalVisible(true);
            if (selectedAudio) {
              await loadAndPlaySound(selectedAudio);
            }
          }
        }
      );

    return () => {
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, [selectedAudio]);

  const handleSaveStudy = async () => {
    if (!subject || !module || !date || !time || !selectedAudio) {
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

      if (route.params?.study?.id) {
        // Update existing study schedule
        const studyId = route.params.study.id; // Get the ID of the schedule being edited
        const studyRef = ref(db, `study/${username}/${studyId}`);

        await update(studyRef, {
          subject,
          module,
          date,
          time,
          audioUri: selectedAudio,
          updatedAt: new Date().toISOString(), // Optional: track the update time
        });

        // Update the local list of studies
        navigation.navigate("Home", {
          updatedStudy: {
            id: studyId,
            subject,
            module,
            date,
            time,
            audioUri: selectedAudio,
          },
        });
      } else {
        // Create a new schedule
        const userStudiesRef = ref(db, `study/${username}`); // Concatenate first name and username

        const newStudyRef = push(userStudiesRef);
        await set(newStudyRef, {
          subject,
          module,
          date,
          time,
          audioUri: selectedAudio,
          createdAt: new Date().toISOString(),
          username,
          firstName,
        });

        navigation.navigate("Home", {
          savedStudy: {
            subject,
            module,
            date,
            time,
            audioUri: selectedAudio,
          },
        });
        startStudyTimeCheck(date, time);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save Study Schedule. Please try again.");
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

  return (
    <LinearGradient
      colors={["#56465C", "#8A667B", "#5D5979"]}
      style={styles.gradientContainer}
    >
      <View style={styles.container}>
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

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveStudy}>
          <Text style={styles.saveButtonText}>Save Schedule</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Study Time!</Text>
            <Text style={styles.modalText}>
              It's time for your {subject} study session.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                stopSound();
                setShowModal(false);
              }}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalText: {
    fontSize: 16,
    marginVertical: 10,
  },
  modalButton: {
    backgroundColor: "#2F8573",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 20,
    borderWidth: 1,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
});
export default StudySchedule;
