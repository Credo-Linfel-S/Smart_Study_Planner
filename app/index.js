import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LogInForm from "../Components/LogInForm";
import Home from "../Components/Home";
import SignUpForm from "../Components/SignUpForm";
import React from "react";
import Class from "../Components/Routes/Class";

export default function index() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator initialRouteName="Home">
      {/*<Stack.Screen
        name="LogInForm"
        component={LogInForm}
        options={{ headerShown: false }}
      />*/}
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUpForm"
        component={SignUpForm}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Class"
        component={Class}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
