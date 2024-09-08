import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from "react-native";
import { firebase } from '../config';

const LoginScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const headerHeight = useRef(new Animated.Value(400)).current;
  const headerFontSize = useRef(new Animated.Value(50)).current;

  const toggleLoginRegister = () => {
    setIsLogin(!isLogin);

    Animated.parallel([
      Animated.timing(headerHeight, {
        toValue: isLogin ? 200 : 400,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(headerFontSize, {
        toValue: isLogin ? 30 : 50,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleLogin = () => {
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        Alert.alert('Success', 'Logged in successfully');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };


  const handleRegister = () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        firebase.firestore().collection('users').doc(user.uid).set({
          username: username,
          businessName: businessName,
          email: email,
        })
        .then(() => {
          Alert.alert('Success', 'Account created successfully');
          navigation.navigate('Home');
        })
        .catch((error) => {
          Alert.alert('Error', 'Failed to save additional information');
        });
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animated.View style={[styles.topContainer, { height: headerHeight }]}>
            <Animated.Text style={[styles.headerText, { fontSize: headerFontSize }]}>
              {isLogin ? "Hello!" : "Welcome"}
            </Animated.Text>
            <Text style={styles.subHeaderText}>
              {isLogin ? "Log in to Creatorflow" : "Create an account"}
            </Text>
          </Animated.View>
          <View style={styles.inputContainer}>
            {!isLogin && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  value={username}
                  onChangeText={(text) => setUsername(text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Business Name"
                  value={businessName}
                  onChangeText={(text) => setBusinessName(text)}
                />
              </>
            )}
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={(text) => setConfirmPassword(text)}
              />
            )}

            <TouchableOpacity
              style={styles.loginButton}
              onPress={isLogin ? handleLogin : handleRegister}
            >
              <Text style={styles.loginBtnText}>
                {isLogin ? "Login" : "Register"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={toggleLoginRegister}
            >
              <Text style={styles.registerBtnText}>
                {isLogin ? "New User? Register here" : "Back to Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: "#F2F2F7",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  topContainer: {
    width: "100%",
    backgroundColor: "#194569",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  headerText: {
    fontWeight: "600",
    color: "#FFFFFF", 
  },
  subHeaderText: {
    fontSize: 16,
    color: "#B0BEC5", 
    marginTop: 10,
  },
  inputContainer: {
    width: "100%",
    padding: 20,
  },
  input: {
    width: "100%",
    height: 48, 
    backgroundColor: "#FFFFFF",
    borderRadius: 8, 
    paddingHorizontal: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0", 
  },
  loginButton: {
    backgroundColor: "#194569",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  registerButton: {
    backgroundColor: "transparent", 
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  loginBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  registerBtnText: {
    color: "#194569",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LoginScreen;
