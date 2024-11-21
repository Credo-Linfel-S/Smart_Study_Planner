import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, Alert } from "react-native";
import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";

const Testing = ({ navigation }) => {
  const [error, setError] = useState();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "105140411604-2f9b4v2r0g2hdccf6q2i9p9go704mra1.apps.googleusercontent.com",
    });
  }, []);

  const signin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      // Extract user details
      const fullName = userInfo?.data?.user?.name || "User";
      const email = userInfo?.data?.user?.email || "N/A";

      console.log("Extracted User Info:", { fullName, email });


      navigation.replace("Home", {
        user: {
          name: fullName,
          email: email,
        },
      });
    } catch (e) {
      console.error("Google Sign-In Error:", e);

      Alert.alert("Sign-In Failed", e.message);
    }
  };

  return (
    <View style={styles.container}>
      {error && <Text>{JSON.stringify(error)}</Text>}
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Standard}
        color={GoogleSigninButton.Color.Dark}
        onPress={signin}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Testing;
