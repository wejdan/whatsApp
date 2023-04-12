import {getFirebaseApp} from '../firebaseHelper';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {child, getDatabase, ref, set} from 'firebase/database';

export const signUp = async form => {
  const {firstName, lastName, email, password} = form;
  const app = getFirebaseApp();
  const auth = getAuth(app);
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    const {uid} = result.user;
    await createUser(firstName, lastName, email, uid);
  } catch (error) {
    const errorCode = error.code;
    let message = 'Something went wrong';
    if (errorCode == 'auth/email-already-in-use') {
      message = 'This email already in use';
    }
    throw new Error(message);
  }
};

export const login = async form => {
  const {email, password} = form;
  const app = getFirebaseApp();
  const auth = getAuth(app);
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.log(error);
    const errorCode = error.code;
    let message = 'Something went wrong';
    if (
      errorCode === 'auth/wrong-password' ||
      errorCode === 'auth/user-not-found'
    ) {
      message = 'the username or password was incorrect';
    }
    throw new Error(message);
  }
};
export const signout = () => {
  const app = getFirebaseApp();
  const auth = getAuth(app);

  signOut(auth).catch(error => console.log('Error logging out: ', error));
};
const createUser = async (firstName, lastName, email, userId) => {
  const firstLast = `${firstName} ${lastName}`.toLowerCase();
  const userData = {
    firstName,
    lastName,
    firstLast,
    email,
    userId,
    signUpDate: new Date().toISOString(),
  };

  const dbRef = ref(getDatabase());
  const childRef = child(dbRef, `users/${userId}`);
  await set(childRef, userData);
  return userData;
};
