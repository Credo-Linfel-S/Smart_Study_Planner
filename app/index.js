import React from "react";
//import { NavigationContainer } from "@react-navigation/native"; // Only one container here
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LogInForm from "../Components/LogInForm";
import Home from "./Home";
//import SignUpForm from "../Components/SignUpForm"



export default function index() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator initialRouteName="SignUpForm">
      <Stack.Screen
        name="SignUpForm"
        component={LogInForm}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
