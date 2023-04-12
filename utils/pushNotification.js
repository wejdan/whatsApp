import axios from 'axios';
import PushNotification, {Importance} from 'react-native-push-notification';
export const createChannel = () => {
  PushNotification.createChannel(
    {
      channelId: 'test channel', // (required)
      channelName: 'test channel', // (required)
    },
    created => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
  );
};

export const handleNotification = text => {
  PushNotification.localNotification({
    /* Android Only Properties */
    channelId: 'test channel', // (required) channelId, if the channel doesn't exist, notification will not trigger.

    title: `you send ${text}`, // (optional)
    message: text, // (required)
    bigText: text, // (optional) default: "message" prop
  });
};
export const sendPushNotification = async (token, title, body) => {
  //console.log("token==>", token);

  const FIREBASE_API_KEY =
    'AAAAfMT8Qb8:APA91bE95lLkaemI0M58AZd4CKsY78NN8A6WIkpGzktlBqgl9lKCAEIQvS8DJG_GV-CKFlfDyrdOHo5i3af0uN-AzmhRLv-v3pvPy0VHJEoUA-OKmzW4JP9FRjpFN2jHkmyMDu3exwDQ';

  const message = {
    notification: {
      title: title,
      body: body,
    },
    to: token, // the token from 'messaging.getToken(' from the reciving client
  };
  let headers = new Headers({
    'Content-Type': 'application/json',
    Authorization: 'key=' + FIREBASE_API_KEY,
  });

  let response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers,
    body: JSON.stringify(message),
  });
  // console.log("=><*", response);
  response = await response.json();
  console.log('=><*', response);
};
