import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import { getDatabase, ref, set } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session";

export default function SignUpForm() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  // Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      "105140411604-2f9b4v2r0g2hdccf6q2i9p9go704mra1.apps.googleusercontent.com",
    redirectUri: Google.makeRedirectUri({
      useProxy: true, // Set to false if running on a physical device without Expo Go
    }),
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;

      const handleGoogleSignUp = async () => {
        try {
          const googleCredential = GoogleAuthProvider.credential(id_token);
          const userCredential = await signInWithCredential(
            auth,
            googleCredential
          );
          const user = userCredential.user;

          // Get user's first name (from displayName or givenName if available)
          const firstNameFromGoogle = user.displayName?.split(" ")[0] || "User"; // Fallback to "User" if no name

          // Save user data to AsyncStorage
          await AsyncStorage.setItem(
            "user",
            JSON.stringify({ username: firstNameFromGoogle, email: user.email })
          );

          // Save user data to Firebase Database
          const database = getDatabase();
          const userRef = ref(database, `users/${user.uid}`);
          await set(userRef, {
            username: firstNameFromGoogle,
            email: user.email,
          });

          console.log("User signed in with Google:", user.uid);
          navigation.navigate("Home", {
            user: { username: firstNameFromGoogle, email: user.email },
          });
        } catch (error) {
          console.error("Error signing in with Google:", error.message);
          alert("Google Sign-In failed. Please try again.");
        }
      };

      handleGoogleSignUp();
    }
  }, [response, navigation]);

  const handleSignUp = async () => {
    if (!firstName || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({ username: firstName, email })
      );
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const database = getDatabase();
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, { username: firstName, email });

      console.log("User created and saved to database:", user.uid);
      navigation.navigate("Home", { user: { username: firstName, email } });
    } catch (error) {
      console.error("Error signing up:", error.message);
      alert(error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient
          colors={["#56465C", "#8A667B", "#5D5979"]}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title_upper}>Sign Up with</Text>
            <Image
              source={require("./assets/SmartStudy.png")}
              alt="logo"
              style={styles.logo}
            />
            <Text style={styles.title}>Start your journey by Signing Up</Text>
            <TextInput
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
            />
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
              secureTextEntry
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={handleSignUp}
            >
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("LogInForm")}>
              <Text style={styles.existedAcc}>Already have an account?</Text>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

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
    marginBottom: 10,
    top: 30,
  },
  title_upper: {
    fontSize: 34,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: -20,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  title: {
    fontSize: 22.5,
    fontWeight: "400",
    color: "#dcdcdc",
    textAlign: "center",
    marginBottom: 30,
    top: 15,
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
  signUpButton: {
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
  signUpText: { color: "#ffffff", fontWeight: "700", fontSize: 18 },
  existedAcc: { color: "#ffffff", fontWeight: "300", fontSize: 14,marginRight:155,bottom:-1, },
  orText: { color: "#dcdcdc", fontSize: 16, marginVertical: 20 },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#db4437",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "100%",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
  },
  googleIcon: { width: 25, height: 25, marginRight: 10 },
  googleText: { color: "#fff", fontWeight: "500", fontSize: 16 },
});
