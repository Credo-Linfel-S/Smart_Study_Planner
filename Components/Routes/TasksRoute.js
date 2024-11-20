import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";

const TasksRoute = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Add Class</Text>
      <TextInput placeholder="Module Name" style={styles.input} />
      <TextInput placeholder="Room" style={styles.input} />
      <TextInput placeholder="Building" style={styles.input} />
      <TextInput placeholder="Teacher Name" style={styles.input} />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton}>
          <Text
            style={styles.buttonText}
            onPress={() => navigation.navigate("Home")}
          >
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.buttonText}>Save Class</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExamsRoute;

const styles = StyleSheet.create({});
