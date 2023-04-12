//import {getFirebaseApp} from '../firebaseHelper';
import {
  child,
  get,
  getDoc,
  doc,
  getDatabase,
  ref,
  set,
  update,
  orderByChild,
  query,
  startAt,
  endAt,
  limitToLast,
} from 'firebase/database';
import {auth, getFirebaseApp} from '../firebaseHelper';

export const getUserData = async userId => {
  const app = getFirebaseApp();

  const dbRef = ref(getDatabase(app));
  const childRef = child(dbRef, `users/${userId}`);
  const userData = await get(childRef);
  return userData.val();
};
export const updateUser = async userData => {
  const app = getFirebaseApp();

  const dbRef = ref(getDatabase(app));
  const childRef = child(dbRef, `users/${auth.currentUser.uid}`);
  const result = await update(childRef, userData);
  return result;
};
export const searchUsers = async searchTerm => {
  const queryText = searchTerm.toLowerCase();

  const app = getFirebaseApp();

  const dbRef = ref(getDatabase(app));
  const childRef = child(dbRef, `users`);

  const searchRef = query(
    childRef,
    orderByChild('firstLast'),
    startAt(queryText),
    endAt(queryText + '\uf8ff'),
  );

  const snapShot = await get(searchRef);
  if (snapShot.exists()) {
    return snapShot.val();
  }

  return {};
};
