import {getAuth} from 'firebase/auth';
import {getFirebaseApp} from '../firebaseHelper';

import {getMessaging, getToken} from 'firebase/messaging';

export const setupNotification = () => {
  const app = getFirebaseApp();
  const auth = getAuth(app);

  const messaging = getMessaging(app);
  getToken(messaging, {
    vapidKey:
      'BPbULNhaBVRMrtxg-ZmXhH2iJDrGmEK3iUtyht4UGiXZC5Ou9a27ShTVfmUPzwmt1Vzi6fLflyFRBdiAB1jeswM',
  })
    .then(currentToken => {
      if (currentToken) {
        // Send the token to your server and update the UI if necessary
        // ...
        console.log('currentToken', currentToken);
      } else {
        // Show permission request UI
        console.log(
          'No registration token available. Request permission to generate one.',
        );
        // ...
      }
    })
    .catch(err => {
      console.log('An error occurred while retrieving token. ', err);
      // ...
    });
};
