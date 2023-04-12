// Import the functions you need from the SDKs you need
import {getApp, getApps, initializeApp} from 'firebase/app';
import {
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getAuth} from 'firebase/auth';

export const getFirebaseApp = () => {
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: 'AIzaSyA5r0XuDqs_FLA1qK9q9c83a4_Jp1nN0xQ',
    authDomain: 'whatsapp-c067e.firebaseapp.com',
    projectId: 'whatsapp-c067e',
    storageBucket: 'whatsapp-c067e.appspot.com',
    messagingSenderId: '535880810943',
    appId: '1:535880810943:web:fd875626ca4c48e745e10a',
    measurementId: 'G-FSP9KC05ZK',
  };
  let defaultApp;
  if (!getApps().length) {
    try {
      defaultApp = initializeApp(firebaseConfig);
      initializeAuth(defaultApp, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch (error) {
      console.log('Error initializing app: ' + error);
    }
  } else {
    defaultApp = getApp();
  }

  return defaultApp;
};
export const auth = getAuth(getFirebaseApp());
