import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigation'; 
import CreateTaskScreen from '../Screens/CreateTaskScreen';
import CreateProjectScreen from '../Screens/CreateProjectScreen';
import ProjectDetailScreen from '../Screens/ProjectDetailScreen';

const Stack = createStackNavigator();

const MainStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
      <Stack.Screen name="CreateTaskScreen" component={CreateTaskScreen} />
      <Stack.Screen name="CreateProjectScreen" component={CreateProjectScreen} />
      <Stack.Screen name="ProjectDetailScreen" component={ProjectDetailScreen} />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;
