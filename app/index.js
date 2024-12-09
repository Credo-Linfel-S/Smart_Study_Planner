import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LogInForm from "../Components/LogInForm";
import Home from "../Components/Home";
import SignUpForm from "../Components/SignUpForm";
import StudySchedule from "../Routes/StudySchedule";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import ExamSchedule from "../Routes/ExamSchedule";
import Activities from "../Components/TabNavigator/Activities";

import EditStudySchedule from "../Mods/EditStudySchedule";
import EditExamSchedule from "../Mods/EditExamSchedule";

GoogleSignin.configure({
  webClientId:
    "105140411604-2f9b4v2r0g2hdccf6q2i9p9go704mra1.apps.googleusercontent.com",
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
    <Stack.Navigator initialRouteName="LogInForm">
      <Stack.Screen
        name="LogInForm"
        component={LogInForm}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUpForm"
        component={SignUpForm}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StudySchedule"
        component={StudySchedule}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExamSchedule"
        component={ExamSchedule}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Activities"
        component={Activities}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditStudySchedule"
        component={EditStudySchedule}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditExamSchedule"
        component={EditExamSchedule}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
export default index;
