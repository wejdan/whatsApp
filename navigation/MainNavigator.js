import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import StackNavigator from './StackNavigator';

import {useDispatch} from 'react-redux';
import {
  getDatabase,
  limitToLast,
  off,
  onValue,
  orderByChild,
  query,
  ref,
} from 'firebase/database';
import {setChatdataLoading, setChatsData} from '../store/chatSlice';
import {setStoredUsers} from '../store/userSlice';
import {setChatMessages, setStarredMessages} from '../store/messagesSlice';
import {getFirebaseApp, auth} from '../utils/firebaseHelper';

const MainNavigator = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const app = getFirebaseApp();

    const dbref = ref(getDatabase(app), `userchats/${auth.currentUser.uid}`);
    const refs = [dbref];
    dispatch(setChatdataLoading({isLoading: true}));

    onValue(dbref, snapshot => {
      let chatsIdsData = snapshot.val() === null ? [] : snapshot.val();
      const chatsIds = Object.values(chatsIdsData);
      const chatsData = {};

      let chatCountFound = 0;
      console.log('chatsIds', chatsIds);
      chatsIds.map(async chatId => {
        const chatRef = ref(getDatabase(app), `chats/${chatId}`);
        refs.push(chatRef);
        onValue(chatRef, async chatSnapshot => {
          let data = chatSnapshot.val() === null ? [] : chatSnapshot.val();
          chatCountFound = chatCountFound + 1;
          if (data) {
            data.key = chatSnapshot.key;
            if (!data.users?.includes(auth.currentUser.uid)) {
              return;
            }
            data.users.forEach(async userId => {
              // if (storedUsers[userId]) {
              //   return;
              // }
              const userRef = ref(getDatabase(app), `users/${userId}`);
              refs.push(userRef);
              onValue(userRef, userSnapshot => {
                let userInfo =
                  userSnapshot.val() === null ? [] : userSnapshot.val();

                dispatch(setStoredUsers({newUsers: {[userId]: userInfo}}));
              });
            });

            chatsData[chatSnapshot.key] = data;
          }

          if (chatCountFound >= chatsIds.length) {
            dispatch(setChatsData({chatsData}));
            dispatch(setChatdataLoading({isLoading: false}));
          }
        });

        const messgesRef = ref(getDatabase(app), `messages/${chatId}`);
        const messgesLimitRef = query(
          messgesRef,
          orderByChild('sentAt'),

          limitToLast(5),
        );

        refs.push(messgesLimitRef);

        onValue(messgesLimitRef, MessagesSnapshot => {
          let messagesData =
            MessagesSnapshot.val() === null ? [] : MessagesSnapshot.val();

          dispatch(
            setChatMessages({messagesData: {chatId, messages: messagesData}}),
          );
        });
      });

      if (chatsIds.length == 0) {
        dispatch(setChatdataLoading({isLoading: false}));
      }

      //  dispatch(setData({userData: allData}));
    });

    const starredRef = ref(
      getDatabase(app),
      `usersStarredMessages/${auth.currentUser.uid}`,
    );
    const starredLimitRef = query(
      starredRef,
      orderByChild('starredAt'),

      // limitToLast(2),
    );

    refs.push(starredLimitRef);

    onValue(starredLimitRef, starredSnapshot => {
      let starredData = starredSnapshot.val();
      console.log('starredData', starredData);
      if (starredData) {
        dispatch(
          setStarredMessages({
            starredMessages: starredData,
          }),
        );
      }
    });
    return () => {
      refs.forEach(r => {
        off(r);
      });
    };
  }, [dispatch]);

  return <StackNavigator />;
};

export default MainNavigator;

const styles = StyleSheet.create({});
