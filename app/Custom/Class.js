import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  //Button,
  StyleSheet,
} from "react-native";

const ExamForm = () => {
  const [subject, setSubject] = useState("");
  const [resit, setResit] = useState(false);
  const [type, setType] = useState("Exam");
  const [mode, setMode] = useState("In Person");
  const [module, setModule] = useState("");
  const [seat, setSeat] = useState("");
  const [room, setRoom] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>New</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Select subject *</Text>
        <View style={styles.buttonGroup}>
          {[
            "English",
            "Mathematics",
            "Science",
            "Biology",
            "Chemistry",
            "Physics",
            "Music",
            "Geography",
            "History",
            "Computer Science",
          ].map((subj) => (
            <TouchableOpacity
              key={subj}
              style={[styles.button, subject === subj && styles.buttonSelected]}
              onPress={() => setSubject(subj)}
            >
              <Text style={styles.buttonText}>{subj}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Resit</Text>
        <Switch value={resit} onValueChange={(value) => setResit(value)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.buttonGroup}>
          {["Exam", "Quiz", "Test"].map((examType) => (
            <TouchableOpacity
              key={examType}
              style={[
                styles.button,
                type === examType && styles.buttonSelected,
              ]}
              onPress={() => setType(examType)}
            >
              <Text style={styles.buttonText}>{examType}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Mode</Text>
        <View style={styles.buttonGroup}>
          {["In Person", "Online"].map((examMode) => (
            <TouchableOpacity
              key={examMode}
              style={[
                styles.button,
                mode === examMode && styles.buttonSelected,
              ]}
              onPress={() => setMode(examMode)}
            >
              <Text style={styles.buttonText}>{examMode}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Module*</Text>
        <TextInput
          style={styles.input}
          placeholder="Module Name"
          value={module}
          onChangeText={setModule}
        />
      </View>

      <View style={styles.sectionRow}>
        <View style={styles.halfInputContainer}>
          <Text style={styles.label}>Seat</Text>
          <TextInput
            style={styles.input}
            placeholder="Seat #"
            value={seat}
            onChangeText={setSeat}
          />
        </View>
        <View style={styles.halfInputContainer}>
          <Text style={styles.label}>Room</Text>
          <TextInput
            style={styles.input}
            placeholder="Room"
            value={room}
            onChangeText={setRoom}
          />
        </View>
      </View>

      <View style={styles.sectionRow}>
        <View style={styles.halfInputContainer}>
          <Text style={styles.label}>Date*</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Fri, 4 Mar 2022"
            value={date}
            onChangeText={setDate}
          />
        </View>
        <View style={styles.halfInputContainer}>
          <Text style={styles.label}>Time*</Text>
          <TextInput
            style={styles.input}
            placeholder="10:30 AM"
            value={time}
            onChangeText={setTime}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Duration (In minutes)*</Text>
        <TextInput
          style={styles.input}
          placeholder="Duration (In minutes)"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => alert("Canceled")}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => alert("Exam Saved!")}
        >
          <Text style={styles.buttonText}>Save Exam</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f0f8ff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  halfInputContainer: {
    width: "48%",
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#007bff",
    backgroundColor: "white",
    marginRight: 5,
    marginBottom: 5,
  },
  buttonSelected: {
    backgroundColor: "#007bff",
  },
  buttonText: {
    color: "#007bff",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    padding: 15,
    backgroundColor: "#ff4d4d",
    borderRadius: 5,
    flex: 0.45,
  },
  saveButton: {
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 5,
    flex: 0.45,
  },
});

export default ExamForm;
