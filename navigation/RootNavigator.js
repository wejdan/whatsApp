import {ActivityIndicator, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import MainNavigator from './MainNavigator';
import {useSelector, useDispatch} from 'react-redux';
import AuthStack from './AuthStack';
import {getUserData} from '../utils/actions/userActions';
import {authenticate, logout, setDidTryAutoLogin} from '../store/authSlice';
import colors from '../constants/colors';
import {onAuthStateChanged} from 'firebase/auth';

import {auth} from '../utils/firebaseHelper';
import {removeAllStarredMessages} from '../store/messagesSlice';
import {setChatsData} from '../store/chatSlice';

const RootNavigator = () => {
  const [isAuth, setIsAuth] = useState(false);
  const didTryAutoLogin = useSelector(state => state.auth.didTryAutoLogin);
  const dispatch = useDispatch();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async authenticatedUser => {
      if (authenticatedUser) {
        const {uid, stsTokenManager} = authenticatedUser;
        const {accessToken} = stsTokenManager;
        const userData = await getUserData(uid);
        dispatch(authenticate({token: accessToken, userData}));
        setIsAuth(true);
        dispatch(setDidTryAutoLogin());
      } else {
        setIsAuth(false);
        dispatch(removeAllStarredMessages());
        dispatch(setChatsData({chatsData: {}}));

        dispatch(logout());
        dispatch(setDidTryAutoLogin());
      }
    });

    return unsubscribe;
    // unsubscribe auth listener on unmount
  }, [dispatch]);

  if (!didTryAutoLogin) {
    return (
      <View
        style={{
          ...StyleSheet.absoluteFill,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return (
    <NavigationContainer>
      {isAuth ? <MainNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default RootNavigator;

const styles = StyleSheet.create({});
