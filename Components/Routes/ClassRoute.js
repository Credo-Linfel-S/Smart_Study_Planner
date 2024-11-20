import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function ClassesRoute() {
  return (
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
}

const styles = StyleSheet.create({
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
