import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD520fCVb3S_zgYy598IAQoZt_yvS5Ke5k",
    authDomain: "creatorflowapp.firebaseapp.com",
    projectId: "creatorflowapp",
    storageBucket: "creatorflowapp.appspot.com",
    messagingSenderId: "768657961710",
    appId: "1:768657961710:web:87004d9eafffb2412e79ff",
    measurementId: "G-PXSPEQ4ZST"
  };

if (!firebase.apps.length){
    firebase.initializeApp(firebaseConfig) 
}

export { firebase };

