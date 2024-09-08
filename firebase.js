import { initializeApp } from 'firebase/app';
import {  initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore, doc, setDoc } from 'firebase/firestore'; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyD520fCVb3S_zgYy598IAQoZt_yvS5Ke5k",
    authDomain: "creatorflowapp.firebaseapp.com",
    projectId: "creatorflowapp",
    storageBucket: "creatorflowapp.appspot.com",
    messagingSenderId: "768657961710",
    appId: "1:768657961710:web:87004d9eafffb2412e79ff",
    measurementId: "G-PXSPEQ4ZST"
  };
  

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
    persistence: getReactNativePersistence(AsyncStorage),
});
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);