import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LogInForm from "../Components/LogInForm";
import Home from "../Components/Home";
import React from "react";

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
