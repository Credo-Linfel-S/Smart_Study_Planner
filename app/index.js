import React from "react";
//import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Testing from "../Components/Testing";
import Home from "../Components/Home";



export default function index() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator initialRouteName="Testing">
      <Stack.Screen
        name="Testing"
        component={Testing}
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
