import {
  child,
  get,
  getDoc,
  doc,
  getDatabase,
  ref,
  set,
  update,
  push,
  remove,
  query,
  limitToLast,
  orderByKey,
  startAt,
  orderByChild,
  endAt,
} from 'firebase/database';
import uuid from 'react-native-uuid';
import md5 from 'md5';
import {getFirebaseApp} from '../firebaseHelper';

export const createChat = async (loggedInUserID, chatId, chatData) => {
  const newChatData = {
    ...chatData,
    createdBy: loggedInUserID,
    updatedBy: loggedInUserID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  //const newChat = await push(childRef, newChatData);
  await set(child(dbRef, `chats/${chatId}/`), newChatData);
  const chatUsers = newChatData.users;
  for (let index = 0; index < chatUsers.length; index++) {
    const userId = chatUsers[index];
    //   await ref.child(newChat.key).set(newChat.key);
    await set(child(dbRef, `userchats/${userId}/${chatId}`), chatId);
  }
  return chatId;
};
export const updateChat = async (chatData, chatId) => {
  const app = getFirebaseApp();

  const dbRef = ref(getDatabase(app));
  const childRef = child(dbRef, `chats/${chatId}`);
  await update(childRef, chatData);
};
export const addUsersToChat = async (newUsers, oldUsers, chatId) => {
  const app = getFirebaseApp();
  //  const data = await getChatData(chatId);
  const usersList = [...oldUsers, ...newUsers];
  const chatData = {
    users: [...new Set(usersList)],
  };
  const dbRef = ref(getDatabase(app));
  const childRef = child(dbRef, `chats/${chatId}`);
  for (let index = 0; index < newUsers.length; index++) {
    const userId = newUsers[index];
    await set(child(dbRef, `userchats/${userId}/${chatId}`), chatId);
  }
  await update(childRef, chatData);
};
export const deleteChat = async chatId => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const childRef = child(dbRef, `chats/${chatId}`);
  const messagesRef = child(dbRef, `messages/${chatId}`);
  await remove(messagesRef);
  await remove(childRef);
};
export const sendTextMessage = async (
  key,
  senderData,
  chatId,
  message,
  replayingTo,
  chatUsers,
) => {
  await sendMessage(key, senderData.userId, chatId, message, null, replayingTo);
  //sendPushNotificationForUsers(chatUsers, senderData.firstLast, message);
};

export const sendImage = async (
  key,
  loggedInUserID,
  chatId,
  imageUrl,
  replayingTo,
) => {
  await sendMessage(
    key,
    loggedInUserID,
    chatId,
    'Image',
    imageUrl,
    replayingTo,
  );
};

const sendMessage = async (
  key,
  loggedInUserID,
  chatId,
  messageText,
  imageUrl,
  replayingTo,
) => {
  const app = getFirebaseApp();

  const dbRef = ref(getDatabase(app));

  const messagesRef = child(dbRef, `messages/${chatId}/${key}`);

  const msgObj = {
    sentAt: new Date().toISOString(),
    text: messageText,
    sentBy: loggedInUserID,
    isLoading: true,
  };

  if (replayingTo) {
    msgObj.replayTo = replayingTo;
  }
  if (imageUrl) {
    msgObj.imageUrl = imageUrl;
  }
  const newChatData = {
    updatedBy: loggedInUserID,
    updatedAt: new Date().toISOString(),
    latestMessage: {text: messageText, sentBy: loggedInUserID, isLoading: true},
  };
  const childRef = child(dbRef, `chats/${chatId}`);
  update(childRef, newChatData);
  await set(messagesRef, msgObj);
  set(messagesRef, {
    ...msgObj,
    isLoading: false,
  });
  update(childRef, {
    latestMessage: {
      text: messageText,
      sentBy: loggedInUserID,
      isLoading: false,
    },
  });
};
export const sendNotification = async (
  loggedInUserID,
  chatId,
  notificationObj,
) => {
  const app = getFirebaseApp();

  const dbRef = ref(getDatabase(app));
  const key = uuid.v4();

  const messagesRef = child(dbRef, `messages/${chatId}/${key}`);

  const msgObj = {
    sentAt: new Date().toISOString(),
    text: notificationObj,
    sentBy: loggedInUserID,
    // type: 'system',
    isNotification: true,
  };

  const newChatData = {
    updatedBy: loggedInUserID,
    updatedAt: new Date().toISOString(),
    latestMessage: {
      text: notificationObj,
      isNotification: true,
      sentBy: loggedInUserID,
    },
  };
  await set(messagesRef, msgObj);

  const childRef = child(dbRef, `chats/${chatId}`);
  await update(childRef, newChatData);
};
export const getUserChats = async userId => {
  const app = getFirebaseApp();

  const dbRef = ref(getDatabase(app));
  const childRef = child(dbRef, `userchats/${userId}`);

  const chats = await get(childRef);
  return chats.val();
};

export const getUserStarrredMessages = async userId => {
  const app = getFirebaseApp();

  const dbRef = ref(getDatabase(app));
  const childRef = child(dbRef, `usersStarredMessages/${userId}`);

  const chats = await get(childRef);
  return chats.val();
};
export const getChatData = async chatId => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const childRef = child(dbRef, `chats/${chatId}`);
  const chatData = await get(childRef);

  return chatData.val();
};
export const geChatMessages = async chatId => {
  const app = getFirebaseApp();

  const dbRef = ref(getDatabase(app));
  const childRef = child(dbRef, `messages/${chatId}`);

  const chats = await get(childRef);
  return chats.val();
};
export const geChatMessagesWithLimits = async (
  chatId,
  startDate,
  messageId,
) => {
  const app = getFirebaseApp();

  const dbRef = ref(getDatabase(app));
  const childRef = child(dbRef, `messages/${chatId}`);
  const messgesLimitRef = query(
    childRef,
    orderByChild('sentAt'),

    endAt(startDate),
    limitToLast(5),
  );
  const chats = await get(messgesLimitRef);
  const messages = chats.val();
  delete messages[messageId];
  return messages;
};

export const geStarredMessagesWithLimits = async (
  uid,
  startDate,
  messageId,
) => {
  const app = getFirebaseApp();

  const dbRef = ref(getDatabase(app));

  const childRef = child(dbRef, `usersStarredMessages/${uid}`);
  const messgesLimitRef = query(
    childRef,
    orderByChild('starredAt'),

    endAt(startDate),
    limitToLast(2),
  );
  const chats = await get(messgesLimitRef);
  const messages = chats.val();
  delete messages[messageId];
  return messages;
};
export const geChatMessagesToDate = async (chatId, startDate) => {
  const app = getFirebaseApp();

  const dbRef = ref(getDatabase(app));
  const childRef = child(dbRef, `messages/${chatId}`);
  const messgesLimitRef = query(
    childRef,
    orderByChild('sentAt'),

    startAt(startDate),
  );
  const chats = await get(messgesLimitRef);
  const messages = chats.val();

  return messages;
};
export const retrieveMessage = async (
  chatId,

  messageId,
) => {
  const app = getFirebaseApp();

  const dbRef = ref(getDatabase(app));
  const childRef = child(dbRef, `messages/${chatId}/${messageId}`);

  const chats = await get(childRef);
  const message = chats.val();
  return message;
};
export const removeUserChat = async (userId, chatId) => {
  const app = getFirebaseApp();

  const dbRef = ref(getDatabase(app));
  const childRef = child(dbRef, `userchats/${userId}/${chatId}`);
  await remove(childRef);

  //  await remove(childRef);
};
export const starMessage = async (messageId, chatId, userId) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const starId = md5(chatId + messageId);

  const favRef = child(dbRef, `usersStarredMessages/${userId}/${starId}`);
  const snapShot = await get(favRef);
  if (snapShot.exists()) {
    console.log('found ', starId, 'removing ....');
    await remove(favRef);
  } else {
    const starredMessageData = {
      messageId,
      chatId,
      starredAt: new Date().toISOString(),
    };
    await set(favRef, starredMessageData);
  }
};

export const unstarAll = async userId => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));

  const favRef = child(dbRef, `usersStarredMessages/${userId}`);
  const snapShot = await get(favRef);
  if (snapShot.exists()) {
    await remove(favRef);
  }
};
