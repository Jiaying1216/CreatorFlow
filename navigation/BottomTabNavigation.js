import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import Home from '../Screens/HomeScreen';
import Project from '../Screens/ProjectScreen';
import Calender from '../Screens/CalenderScreen';
import Finances from '../Screens/FinancesScreen';
import Profile from '../Screens/ProfileScreen';

import CreateProjectScreen from '../Screens/CreateProjectScreen';
import ProjectDetailScreen from '../Screens/ProjectDetailScreen';
import CreateTaskScreen from '../Screens/CreateTaskScreen';
import CreateEventScreen from '../Screens/CreateEventScreen';
import AllEventsScreen from '../Screens/AllEventsScreen';
import EventDetailScreen from '../Screens/EventDetailScreen';
import CreateSpendingScreen from '../Screens/CreateSpendingScreen';
import LoginNavigation from './LoginNavigation';
import AllSpendingScreen from '../Screens/AllSpendingScreen';
import SpendingDetailScreen from '../Screens/SpendingDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


function HomeStackNavigator() {
  return( 
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='TodoHome' component={Home} />
      <Stack.Screen name='CreateTaskScreen' component={CreateTaskScreen} />
    </Stack.Navigator>
  )
}
function ProjectStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='ProjectHome' component={Project} />
      <Stack.Screen name='CreateProjectScreen' component={CreateProjectScreen} />
      <Stack.Screen name='ProjectDetailScreen' component={ProjectDetailScreen} />
    </Stack.Navigator>
  );
}

function CalenderStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='CalenderHome' component={Calender} />
      <Stack.Screen name='CreateEventScreen' component={CreateEventScreen} />
      <Stack.Screen name='EventDetailScreen' component={EventDetailScreen} />
      <Stack.Screen name='CreateTaskScreen' component={CreateTaskScreen} />
    </Stack.Navigator>
  );
}

function FinanceStackNavigator() {
  return(
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='FinanceHome' component={Finances} />
      <Stack.Screen name='AllEventsScreen' component={AllEventsScreen} />
      <Stack.Screen name='EventDetailScreen' component={EventDetailScreen} />
      <Stack.Screen name='CreateEventScreen' component={CreateEventScreen} />
      <Stack.Screen name='CreateSpendingScreen' component={CreateSpendingScreen} />
      <Stack.Screen name='AllSpendingScreen' component={AllSpendingScreen} />
      <Stack.Screen name='SpendingDetailScreen' component={SpendingDetailScreen}/>
    </Stack.Navigator>
  )
}

function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false}}>
      <Stack.Screen name='Profile' component={Profile}/>
    </Stack.Navigator>
  )
}

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Todo') {
            iconName = 'checkmark-circle';
          } else if (route.name === 'Project') {
            iconName = 'briefcase';
          } else if (route.name === 'Calendar') {
            iconName = 'calendar';
          } else if (route.name === 'Finances') {
            iconName = 'cash';
          } else if (route.name === 'Personal') {
            iconName = 'person';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: {
          backgroundColor: '#194569',
        },
      })}
    >
      <Tab.Screen name='Todo' options={{ headerShown: false }} component={HomeStackNavigator} />
      <Tab.Screen name='Project' options={{ headerShown: false }} component={ProjectStackNavigator} />
      <Tab.Screen name='Calendar' options={{ headerShown: false }} component={CalenderStackNavigator} />
      <Tab.Screen name='Finances' options={{ headerShown: false }} component={FinanceStackNavigator} />
      <Tab.Screen name='Personal' options={{ headerShown: false }} component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
