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
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { ref, get } from "firebase/database"; // Import Realtime Database functions
WebBrowser.maybeCompleteAuthSession();

const LogInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigation = useNavigation();

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
