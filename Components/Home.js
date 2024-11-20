import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { GoogleSignin } from "@react-native-google-signin/google-signin"; // Import GoogleSignin
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage if you're using it

export default function Home({ route }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();

  // Extract user and first name
  const { user } = route.params || {};
  const name = user?.name || "User";
  const email = user?.email || "N/A";

  // Toggle modal visibility
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  // Handle navigation to selected route
  const handleMenuSelection = (routeName) => {
    setIsModalVisible(false);
    navigation.navigate(routeName);
  };

  // Logout function - clears user data, signs out from Google and navigates to sign-in screen
  const handleLogout = async () => {
    try {
      // Sign out from Google
      await GoogleSignin.signOut();

      // Clear AsyncStorage (if you're storing user data in AsyncStorage)
      await AsyncStorage.removeItem("user");

      // Navigate to sign-in screen
      navigation.replace("Testing"); // Replace this with your actual Sign-In screen name
    } catch (error) {
      console.error("Logout Error: ", error);
      Alert.alert(
        "Error",
        "There was an error logging you out. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Display user's first name */}
      <Text style={styles.greeting}>Good Afternoon!</Text>
      <Text>Welcome, {name}!</Text>
      <Text>Email: {email}</Text>
      <Text style={styles.date}>Sat, 20 Nov</Text>

      {/* Add button to toggle modal */}
      <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Modal showing options for routes */}
      <Modal
        visible={isModalVisible}
        onRequestClose={toggleModal}
        animationType="slide"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select a Route</Text>

          {/* Menu options with navigation */}
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleMenuSelection("Class")}
          >
            <Text style={styles.optionText}>Classes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleMenuSelection("ExamsRoute")}
          >
            <Text style={styles.optionText}>Exams</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleMenuSelection("TasksRoute")}
          >
            <Text style={styles.optionText}>Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleMenuSelection("VacationsRoute")}
          >
            <Text style={styles.optionText}>Vacations</Text>
          </TouchableOpacity>

          {/* Cancel button to close modal */}
          <TouchableOpacity style={styles.cancelButton} onPress={toggleModal}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Logout Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F8FF",
  },
  greeting: {
    fontSize: 18,
    color: "#333",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  date: {
    fontSize: 16,
    color: "#666",
  },
  addButton: {
    position: "absolute",
    bottom: 50,
    right: 20,
    backgroundColor: "#00C8FF",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: 24,
    color: "#FFF",
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: "#00C8FF",
    width: 200,
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  optionText: {
    color: "#FFF",
    fontSize: 18,
  },
  cancelButton: {
    backgroundColor: "gray",
    width: 200,
    padding: 15,
    marginTop: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelText: {
    color: "#FFF",
    fontSize: 18,
  },
  buttonContainer: {
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: "#FF6347",
    padding: 15,
    width: 200,
    borderRadius: 5,
    alignItems: "center",
  },
  logoutText: {
    color: "#FFF",
    fontSize: 18,
  },
});
