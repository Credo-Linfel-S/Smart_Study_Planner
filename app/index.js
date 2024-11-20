import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
//import LogInForm from "../Components/LogInForm";
import Home from "../Components/Home";
import SignUpForm from "../Components/SignUpForm"



export default function index() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator initialRouteName="SignUpForm">
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
    </Stack.Navigator>
  );
}
