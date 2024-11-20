import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";

import ClassesRoute from "./Routes/ClassRoute";
import ExamsRoute from "./Routes/ExamsRoute";
import TasksRoute from "./Routes/TasksRoute";
import VacationsRoute from "./Routes/VacationsRoute";
import { TabView, SceneMap } from "react-native-tab-view";
export default function Home() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [index, setIndex] = useState(0);

  const routes = [
    { key: "classes", title: "Classes", component: ClassesRoute },
    { key: "exams", title: "Exams", component: ExamsRoute },
    { key: "tasks", title: "Tasks", component: TasksRoute },
    { key: "vacations", title: "Vacations", component: VacationsRoute },
  ];

renderScene = ({ route }) => {
  switch (route.key) {
    case "classes":
      return <ClassesRoute />;
    case "exams":
      return <ExamsRoute />;
    case "tasks":
      return <TasksRoute />;
    case "vacations":
      return <VacationsRoute />;
    default:
      return null;
  }
};
//Object.fromEntries(routes.map(({ key, component }) => [key, component]))
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Good Afternoon!</Text>
      <Text style={styles.name}>Linfel</Text>
      <Text style={styles.date}>Sat, 20 Nov</Text>
      <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        onRequestClose={toggleModal}
        animationType="slide"
      >
        <View style={styles.modalContent}>
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: Dimensions.get("window").width }}
          />
        </View>
      </Modal>
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
    height: "100%",
    backgroundColor: "#FFF",
    padding: 20,
  },
});
