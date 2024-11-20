import React, { useState, useEffect } from "react";
import {
  View,
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
import { auth } from "./firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
{/*import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
*/}
export default function SignUpForm() {
 
  {/* const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "105140411604-2f9b4v2r0g2hdccf6q2i9p9go704mra1.apps.googleusercontent.com",
    });
  }, []);

  const handleSignUp = async () => {
    setError(null);
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      storeUserData(user);
      setEmail("");
      setPassword("");
      navigation.navigate("Home");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const credential = GoogleAuthProvider.credential(userInfo.idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      storeUserData(user);
      navigation.navigate("Home");
    } catch (error) {
      setError(error.message);
    }
  };

  const storeUserData = async (userData) => {
    try {
      await ReactNativeAsyncStorage.setItem("user", JSON.stringify(userData));
      console.log("User data saved successfully");
    } catch (error) {
      console.error("Error saving user data", error);
    }
  };
*/}
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
            {/*<Text style={{ color: "red" }}>{error || ""}</Text>*/}
            <TextInput
              placeholder="Email"
              //value={email}
              //onChangeText={setEmail}
              style={styles.input}
            />
            <TextInput
              placeholder="Password"
              //value={password}
              //onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.signUpButton}
              //onPress={handleSignUp}
            >
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.ask}>Have an account? Sign In here </Text>
            </TouchableOpacity>
            <Text style={styles.orText}>Or Sign Up with</Text>
            <View style={styles.socialContainer}>
             {/*<GoogleSigninButton
                //size={GoogleSigninButton.Size.Wide}
                //color={GoogleSigninButton.Color.Dark}
               // onPress={handleGoogleSignIn}
                style={styles.socialButton}
              />*/}
            </View>
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
  ask: { bottom: 10, marginBottom: 0, marginRight: 100 },
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
    width: "100%",
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
  socialText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});