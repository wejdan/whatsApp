import {PermissionsAndroid} from 'react-native';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
} from 'firebase/storage';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import uuid from 'react-native-uuid';
import {auth, getFirebaseApp} from './firebaseHelper';

export const uploadeImg = async (path, type, name) => {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', path, true);
    xhr.send(null);
  });
  const app = getFirebaseApp();

  //  const mimeType = mime.getType(img); // => 'application/pdf'

  const uploadName =
    type == 'group' ? name : type == 'chat' ? uuid.v4() : auth.currentUser.uid;
  const folderName =
    type == 'chat'
      ? 'chatImgs'
      : type == 'profile'
      ? 'profilePics'
      : 'groupPics';
  const reference = ref(getStorage(app), `/${folderName}/${uploadName}`);

  const uploadTask = await uploadBytesResumable(reference, blob);
  blob.close();
  const url = await getDownloadURL(uploadTask.ref);

  return url;
};
export const pickImage = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'App Camera Permission',
        message: 'App needs access to your camera ',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Camera permission given');
      let options = {
        title: 'Select Image',
        customButtons: [
          {
            name: 'customOptionKey',
            title: 'Choose Photo from Custom Option',
          },
        ],
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      };

      const response = await launchImageLibrary(options);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        return response.assets[0].uri;
      }
    } else {
      alert('Camera permission denied');
      console.log('Camera permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
};

export const camaraImage = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'App Camera Permission',
        message: 'App needs access to your camera ',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Camera permission given');
      let options = {
        title: 'Select Image',
        customButtons: [
          {
            name: 'customOptionKey',
            title: 'Choose Photo from Custom Option',
          },
        ],
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      };

      const response = await launchCamera(options);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        return response.assets[0].uri;
      }
    } else {
      alert('Camera permission denied');
      console.log('Camera permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
};
