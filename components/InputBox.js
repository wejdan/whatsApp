import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {camaraImage, pickImage, uploadeImg} from '../utils/imagePickerHelper';
import colors from '../constants/colors';
import AwesomeAlert from 'react-native-awesome-alerts';
import Animated, {
  SlideInDown,
  SlideInRight,
  SlideInUp,
  SlideOutRight,
} from 'react-native-reanimated';
import {useDispatch} from 'react-redux';
import {setChatMessages} from '../store/messagesSlice';
import uuid from 'react-native-uuid';
import {auth} from '../utils/firebaseHelper';

const InputBox = ({
  onSendPress,

  chatID,
  replayingTo,

  setReplayingTo,
}) => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');

  const ref = useRef(null);
  const onSend = async () => {
    const key = uuid.v4();

    const msgObj = {
      sentAt: new Date().toISOString(),
      text: message,

      sentBy: auth.currentUser.uid,

      isLoading: true,
    };

    if (replayingTo) {
      msgObj.replayTo = replayingTo;
    }

    dispatch(
      setChatMessages({
        messagesData: {chatId: chatID, messages: {[key]: msgObj}},
      }),
    );

    onSendPress(key, message);
    setMessage('');
    setReplayingTo(null);
  };

  const openImagePicker = async () => {
    try {
      const tmpUri = await pickImage();
      if (!tmpUri) return;
      uploadImage(tmpUri);
    } catch (error) {
      console.log(error);
    }
  };
  const openCamara = async () => {
    try {
      const tmpUri = await camaraImage();
      if (!tmpUri) return;
      uploadImage(tmpUri);
    } catch (error) {
      console.log(error);
    }
  };
  const uploadImage = useCallback(
    async uri => {
      //   setIsLoading(true);
      // listRef.current.scrollToOffset({animated: true, offset: 0});
      const key = uuid.v4();
      try {
        const msgObj = {
          sentAt: new Date().toISOString(),
          text: 'image',
          sentBy: auth.currentUser.uid,
          imageUrl: uri,
          isLoading: true,
        };

        if (replayingTo) {
          msgObj.replayTo = replayingTo;
        }
        dispatch(
          setChatMessages({
            messagesData: {chatId: chatID, messages: {[key]: msgObj}},
          }),
        );
        //  setChatMessages({messagesData: {chatID, messages: messagesData}})

        setReplayingTo(null);

        const uploadUrl = await uploadeImg(uri, 'chat');
        onSendPress(key, null, uploadUrl);
        //  setIsLoading(false);
      } catch (error) {
        console.log(error);
        //  setIsLoading(false);
      }
    },
    [onSendPress, chatID, replayingTo, dispatch, setReplayingTo],
  );
  return (
    <View ref={ref} style={styles.container}>
      <TouchableOpacity onPress={openImagePicker} style={styles.icon}>
        <Feather name="plus" size={24} color={colors.blue} />
      </TouchableOpacity>
      <TextInput
        onSubmitEditing={onSend}
        onChangeText={text => {
          //  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setMessage(text);
        }}
        value={message}
        style={styles.input}
      />
      {message.length > 0 ? (
        <Animated.View
          exiting={SlideOutRight.duration(100)}
          entering={SlideInRight.duration(100)}>
          <TouchableOpacity onPress={onSend} style={styles.send}>
            <Ionicons name="send" size={18} color={'white'} />
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Animated.View
          exiting={SlideOutRight}
          entering={SlideInRight}
          key={'camra'}>
          <TouchableOpacity onPress={openCamara} style={styles.icon}>
            <Feather name="camera" size={24} color={colors.blue} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

export default InputBox;

const styles = StyleSheet.create({
  container: {
    height: 50,
    paddingVertical: 8,
    paddingHorizontal: 5,
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  icon: {
    width: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popUpTitle: {
    color: colors.textColor,
    letterSpacing: 0.3,
    fontFamily: 'Roboto-Medium',
  },
  send: {
    width: 35,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
    borderRadius: 50,
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 50,
    paddingVertical: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    borderColor: colors.lightGrey,
    marginHorizontal: 5,
  },
});
