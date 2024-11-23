import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LogInForm from "../Components/LogInForm";
import Home from "../Components/Home";
import SignUpForm from "../Components/SignUpForm";
import Class from "../Components/Routes/Class";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Testing from "../Components/Testing"
// Configure Google Sign-In
GoogleSignin.configure({
  webClientId:
    "105140411604-2f9b4v2r0g2hdccf6q2i9p9go704mra1.apps.googleusercontent.com", // Replace with your actual Web Client ID from Google Cloud Console
  offlineAccess: true,
});

// Logout handler (optional if used elsewhere)
export const handleLogout = async (navigation) => {
  try {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      await GoogleSignin.signOut();
      console.log("Google sign-out successful");
    }

    await AsyncStorage.removeItem("user");

    // Navigate back to the login screen
    navigation.replace("LogInForm");
  } catch (error) {
    console.error("Logout Error:", error);
    Alert.alert(
      "Error",
      "There was an error logging you out. Please try again."
    );
  }
};

// Stack Navigator
const index = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="LogInForm"
        component={LogInForm}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Testing"
        component={Testing}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Class"
        component={Class}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUpForm"
        component={SignUpForm}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default index;
