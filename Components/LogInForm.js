import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import React, { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import {
  signInWithEmailAndPassword,
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import { firebaseConfig, auth, db } from "./firebaseConfig"; // auth is imported from firebaseConfig
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { getDatabase, ref, get, set } from "firebase/database";

import { getApp, initializeApp } from "firebase/app";

// Initialize Firebase only if it is not initialized already
const app = getApp() || initializeApp(firebaseConfig);
WebBrowser.maybeCompleteAuthSession();

const LogInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigation = useNavigation();

  const [userInfo, setUserInfo] = useState();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "105140411604-2f9b4v2r0g2hdccf6q2i9p9go704mra1.apps.googleusercontent.com",
    });
  }, []);

  const signin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const user = await GoogleSignin.signIn();

      // Firebase authentication
      const { idToken } = await GoogleSignin.getTokens();
      const googleCredential = GoogleAuthProvider.credential(idToken);

      const firebaseUser = await signInWithCredential(auth, googleCredential);

      setUserInfo(firebaseUser.user);
      setError(null);

      // Extract the first name from the user's display name (assuming the displayName is in "First Last" format)
      const firstNameFromGoogle = firebaseUser.user.displayName.split(" ")[0];

      // Ensure that the firebaseUser.uid is used to reference the correct user in the database
      const database = getDatabase();
      const userRef = ref(database, `users/${firebaseUser.user.uid}`); // Use firebaseUser.uid here
      await set(userRef, {
        username: firstNameFromGoogle, // Store the first name
        email: firebaseUser.user.email,
      });

      // Save the user's first name and email in AsyncStorage
      await AsyncStorage.setItem("firstName", firstNameFromGoogle);
      await AsyncStorage.setItem("email", firebaseUser.user.email);

      // Navigate to Home screen and pass the first name as a parameter
      navigation.navigate("Home", {
        firstName: firstNameFromGoogle,
        email: firebaseUser.user.email, // Pass the first name to the Home screen
      });
    } catch (e) {
      setError(e.message || "An error occurred during sign-in.");
      console.error(e);
    }
  };

  // Async function for handling login
  const handleLogin = async () => {
    try {
      // Step 1: Log in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get user email from Firebase Authentication (this doesn't rely on the database)
      const userEmail = user.email;

      console.log("User Email:", userEmail); // Log the email for verification

      // Step 2: Fetch user profile from Realtime Database (you don't need to fetch email here)
      const userRef = ref(db, "users/" + user.uid); // Reference to user's data in Realtime Database
      const userSnapshot = await get(userRef); // Get the data snapshot

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val(); // Extract user data
        console.log("User Data:", userData); // Log the full user data

        // Step 3: Store the user data in AsyncStorage
        await AsyncStorage.setItem(
          "user",
          JSON.stringify({ ...userData, email: userEmail })
        );

        // Step 4: Navigate to the Home screen and pass the user data
        navigation.navigate("Home", {
          user: { ...userData, email: userEmail },
        });
      } else {
        console.error("No user data found in Realtime Database!");
        setError("No user data found in Realtime Database.");
      }
    } catch (error) {
      console.error("Error during login:", error.message);
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient
          colors={["#56465C", "#8A667B", "#5D5979"]}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.container}>
            {/* Logo */}
            <Image
              source={require("./assets/SmartStudy.png")}
              style={styles.logo}
            />
            {/* Welcome Message */}
            <Text style={styles.welcomeText}>Welcome back Student!</Text>
            {/* Email and Password Inputs */}
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
            />
            {/* Error Message */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {/* Log In Button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginText}>Log In</Text>
              <MaterialIcons
                name="login"
                size={24}
                color="black"
                marginRight={80}
                marginBottom={-20}
                top={-23}
              />
            </TouchableOpacity>
            {/* Account Options */}
            <View style={styles.accountOptions}>
              <TouchableOpacity
                onPress={() => navigation.navigate("SignUpForm")}
              >
                <Text style={styles.optionText}>
                  Don’t have an account yet?
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.container}>
              <Text>{error && `Error: ${error}`}</Text>
              {!userInfo && (
                <GoogleSigninButton
                  size={GoogleSigninButton.Size.Standard}
                  color={GoogleSigninButton.Color.Dark}
                  onPress={signin}
                />
              )}
              <StatusBar style="auto" />
            </View>
          </ScrollView>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
    top: 30,
  },
  welcomeText: {
    bottom: -10,
    height: 90,
    width: 400,
    fontSize: 30,
    fontWeight: "800",
    color: "#ffffff",
    marginLeft: 80,
    marginBottom: -30,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "rgba(255, 255, 255, 0.6)",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    color: "#ffffff",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  loginButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
    width: "100%",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  loginText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 18,
  },
  accountOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  optionText: {
    fontSize: 14,
    color: "#dcdcdc",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
});

export default LogInForm;
