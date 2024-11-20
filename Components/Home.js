import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
} from "react-native";
import { TabView, SceneMap } from "react-native-tab-view";

export default function Home() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "classes", title: "Classes" },
    { key: "exams", title: "Exams" },
    { key: "tasks", title: "Tasks" },
    { key: "vacations", title: "Vacations" },
  ]);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const ClassesRoute = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Add Class</Text>
      <TextInput placeholder="Module Name" style={styles.input} />
      <TextInput placeholder="Room" style={styles.input} />
      <TextInput placeholder="Building" style={styles.input} />
      <TextInput placeholder="Teacher Name" style={styles.input} />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.buttonText}>Save Class</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ExamsRoute = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Add Exam</Text>
      <TextInput placeholder="Module Name" style={styles.input} />
      <TextInput placeholder="Room" style={styles.input} />
      <TextInput placeholder="Building" style={styles.input} />
      <TextInput placeholder="Teacher Name" style={styles.input} />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.buttonText}>Save Exam</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const TasksRoute = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Add Task</Text>
      <TextInput placeholder="Module Name" style={styles.input} />
      <TextInput placeholder="Room" style={styles.input} />
      <TextInput placeholder="Building" style={styles.input} />
      <TextInput placeholder="Teacher Name" style={styles.input} />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.buttonText}>Save Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const VacationsRoute = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Add Vacation</Text>
      <TextInput placeholder="Module Name" style={styles.input} />
      <TextInput placeholder="Room" style={styles.input} />
      <TextInput placeholder="Building" style={styles.input} />
      <TextInput placeholder="Teacher Name" style={styles.input} />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.buttonText}>Save Vacation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderScene = SceneMap({
    classes: ClassesRoute,
    exams: ExamsRoute,
    tasks: TasksRoute,
    vacations: VacationsRoute,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Good Afternoon!</Text>
      <Text style={styles.name}>Kim</Text>
      <Text style={styles.date}>Sat, 09 Nov</Text>
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
  tabContent: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "90%",
    height: 40,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#DDD",
    padding: 10,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: "#00C8FF",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#FFF",
  },
});
