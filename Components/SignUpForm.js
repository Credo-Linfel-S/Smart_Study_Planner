import React, { useState } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { getDatabase, ref, set } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function SignUpForm() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

 const handleSignUp = async () => {
   if (!firstName || !email || !password) {
     alert("Please fill in all fields.");
     return;
   }

   try {
     // Save user data to AsyncStorage
     await AsyncStorage.setItem(
       "user",
       JSON.stringify({ username: firstName, email })
     );

     // Verify that data was saved
     const savedUser = await AsyncStorage.getItem("user");
     console.log("Saved User to AsyncStorage:", savedUser); // Check the saved data
   } catch (error) {
     console.error("Error saving user data to AsyncStorage:", error);
   }

   try {
     // Create user in Firebase Authentication
     const userCredential = await createUserWithEmailAndPassword(
       auth,
       email,
       password
     );

     const user = userCredential.user;

     if (!user) {
       throw new Error("User object is missing from Firebase response.");
     }

     console.log("Firebase User Object:", user);

     // Save user data to Realtime Database
     const database = getDatabase(); // Initialize database instance
     const userRef = ref(database, `users/${user.uid}`); // Reference user's node

     await set(userRef, {
       username: firstName,
       email: email,
     });

     console.log("User created and saved to database:", user.uid);

     // Navigate to the Home screen
     console.log("Navigating to Home with:", { name: firstName, email });
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
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
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
    marginBottom: 10,
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
  signUpText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 18,
  },
});
