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
import { auth } from "./firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
WebBrowser.maybeCompleteAuthSession();

const LogInForm = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
 const navigation = useNavigation();
  // Async function for handling login
  const handleLogin = async () => {
    try {
      // Await the signInWithEmailAndPassword function
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // If login is successful, get the user information
      const user = userCredential.user;

      // Store user data in AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(user));
      console.log("User signed in and data saved to AsyncStorage");
  navigation.navigate("Home");
      // Redirect user to Home screen (or any other screen)
      // Adjust according to your screen names
    } catch (e) {
      // Catch errors and display error message
      setError("Invalid credentials");
      console.error(e.message);
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
              <TouchableOpacity>
                <Text style={styles.optionText}>
                  Don’t have an account yet?
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.optionText}>Forget password?</Text>
              </TouchableOpacity>
            </View>

            {/* Social Login Text */}
            <Text style={styles.orText}>Or Log In with</Text>

            {/* Social Buttons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Image
                  source={require("./assets/facebook.png")}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Image
                  source={require("./assets/google.png")}
                  style={styles.socialIcon}
                />
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
    fontSize: 34,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: -20,
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
  orText: {
    fontSize: 16,
    marginVertical: 10,
    color: "#f1f1f1",
    textAlign: "center",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 10,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
    elevation: 5,
    width: "40%",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  socialIcon: {
    width: 28,
    height: 28,
    marginRight: 10,
    resizeMode: "contain",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
});

export default LogInForm;
