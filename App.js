import { registerRootComponent } from 'expo';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import LoginNavigation from './navigation/LoginNavigation'; 
import BottomTabNavigator from './navigation/BottomTabNavigation';
import { firebase } from './config';
import { registerBackgroundTask } from './backgroundTask';

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    registerBackgroundTask();

    const onAuthStateChanged = (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    };

    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; 
  }, [initializing]);

  if (initializing) {
    return null; 
  }

  return (
    <NavigationContainer>
      {user ? <BottomTabNavigator /> : <LoginNavigation />}
    </NavigationContainer>
  );
};

export default App;

registerRootComponent(App);