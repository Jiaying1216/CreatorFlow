import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../Screens/LoginScreen';
import RegisterationScreen from '../Screens/RegistrationScreen';
import MainStackNavigator from './MainStackNavigation'; 

const Stack = createStackNavigator();

const LoginNavigation = () => {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterationScreen} />
      <Stack.Screen name="Home" component={MainStackNavigator} />
    </Stack.Navigator>
  );
};

export default LoginNavigation;
