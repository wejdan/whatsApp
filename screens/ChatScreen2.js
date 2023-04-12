import {
  BackHandler,
  FlatList,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import bg from '../assets/images/droplet.jpeg';
import InputBox from '../components/InputBox';
import {auth, defaultApp} from '../firebase';
import {useDispatch, useSelector} from 'react-redux';
import Bubble from '../components/Bubble';
import {
  createChat,
  sendImage,
  sendTextMessage,
} from '../utils/actions/chatActions';
import ReplayTo from '../components/ReplayTo';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';
import colors from '../constants/colors';
import {readNotification} from '../utils/notifications';
import PureBubble from '../components/PureBubble';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, {ZoomIn, FadeIn, ZoomOut} from 'react-native-reanimated';
export function formatDate(textDate) {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const date = new Date(textDate);
  return (
    monthNames[date.getMonth()] +
    ' ' +
    date.getDate() +
    ',' +
    date.getFullYear()
  );
}

export const measureObj = async ref => {
  return new Promise(r => {
    ref.measure((x0, y0, w, h, px, py) => r({x: px, y: py, h: h, w: w}));
  });
};

const ChatScreen = ({navigation, route}) => {
  const chatsData = useSelector(state => state.chats.chatsData);
  const storedUsers = useSelector(state => state.users.storedUsers);

  const [chatID, setChatId] = useState(route?.params?.chatID);
  const [isNewChat, setisNewChat] = useState(route?.params?.isNewChat);
  const [showCursorDown, setShowCursorDown] = useState(false);

  const listRef = useRef(null);
  const [errorBannerText, setErrorBannerText] = useState('');
  const itemHeights = useRef([]).current;
  const messagesList = useSelector(state => {
    const msgsList = state.messages.messagesData[chatID];
    const messagesList = Object.keys(msgsList).map(key => {
      return {...msgsList[key], key};
    });

    return messagesList ? messagesList.reverse() : [];
  });

  const [messageId, setMessageId] = useState(
    route?.params?.messageId &&
      messagesList.findIndex(m => m.key === route?.params?.messageId),
  );

  const handleBackButton = () => {
    navigation.navigate('Home');
    return true;
  };
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, []);

  const [replayingTo, setReplayingTo] = useState(null);

  const chatData = (chatID && chatsData[chatID]) || route?.params?.newChatData;
  const [otherUser, setOtherUser] = useState(
    chatData
      ? storedUsers[chatData.users.find(uid => uid != auth.currentUser.uid)]
      : {},
  );

  const chatName = chatData.chatName;
  const isGroupChat = chatData.isGroupChat;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item
              title="Back"
              iconName="arrow-back"
              color={colors.textColor}
              onPress={() => {
                navigation.navigate('Home');
              }}
            />
          </HeaderButtons>
        );
      },
      headerTitle: () => {
        return (
          <Pressable
            onPress={() => {
              if (isGroupChat) {
                navigation.navigate('ChatSettings', {chatID});
              } else {
                if (chatData) {
                  navigation.navigate('Contact', {
                    userId: chatData.users.find(
                      uid => uid != auth.currentUser.uid,
                    ),
                  });
                }
              }
            }}>
            <Text style={styles.title}>
              {isGroupChat ? chatName : otherUser.firstLast || ''}
            </Text>
          </Pressable>
        );
      },
    });
  }, [navigation, otherUser, isGroupChat, chatName, chatData, chatID]);

  const onSendPress = useCallback(
    async (messageTxt, uploadUrl = null) => {
      try {
        if (isNewChat) {
          //create chat
          setisNewChat(false);
          await createChat(
            auth.currentUser.uid,
            chatID,
            route.params.newChatData,
          );
        }
        if (uploadUrl) {
          await sendImage(
            auth.currentUser.uid,
            chatID,
            uploadUrl,
            replayingTo?.key,
          );
          //   dispatch(setChatMessages({messagesData: {[id]: [...messagesList]}}));
        } else {
          await sendTextMessage(
            auth.currentUser.uid,
            chatID,
            messageTxt,
            replayingTo?.key,
          );
        }
      } catch (error) {
        console.log('err', error);
        setErrorBannerText('Message failed to send');
        setTimeout(() => {
          setErrorBannerText('');
        }, 5000);
      }
    },
    [chatID, route.params.newChatData, replayingTo, isNewChat],
  );
  const scrollDown = useCallback(() => {
    listRef.current.scrollToOffset({
      animated: true,
      offset: 0,
    });
  }, []);
  const onLayout = useCallback(() => {
    console.log('onLayout', messageId);
    if (messageId) {
      listRef.current.scrollToIndex({index: messageId, animated: false});
      setMessageId(null);
    }
  }, [messageId]);
  const renderItem = useCallback(
    ({item, index}) => {
      const {
        text,
        imageUrl,
        isNotification,
        sentBy,
        replayTo,
        isLoading,
        sentAt,
        key,
      } = item;
      // console.log('message', item);
      let notificationText = '';
      if (isNotification) {
        const latestMessageUser = storedUsers[text.user];

        notificationText = readNotification(
          auth.currentUser.uid,
          text,
          latestMessageUser,
          storedUsers,
        );
      }
      const strDate = formatDate(sentAt);
      const isNewDate =
        index == messagesList.length - 1
          ? true
          : formatDate(messagesList[index + 1].sentAt) != strDate;
      //  lastDate.current = strDate;
      const isOwnMessage = sentBy == auth.currentUser.uid;
      const name =
        storedUsers[sentBy] && sentBy && storedUsers[sentBy].firstLast;

      return (
        <View
          key={index}
          onLayout={object => {
            // console.log(object, index);
            itemHeights[index] = object.nativeEvent.layout.height;
          }}>
          <PureBubble
            navigation={navigation}
            isGroupChat={isGroupChat}
            name={isGroupChat && !isOwnMessage && !isNotification ? name : null}
            isLoading={isLoading}
            text={isNotification ? notificationText : text}
            chatID={chatID}
            messageId={key}
            sentAt={sentAt}
            imageUrl={imageUrl}
            replayTo={replayTo && messagesList.find(msg => msg.key == replayTo)}
            setReplay={() => {
              setReplayingTo(item);
            }}
            type={
              isNotification
                ? 'info'
                : sentBy == auth.currentUser.uid
                ? 'myMessage'
                : 'theirMessage'
            }
          />
          {isNewDate && <PureBubble text={strDate} type="date" />}
        </View>
      );
    },
    [
      chatID,
      isGroupChat,
      storedUsers,
      navigation,
      setReplayingTo,
      messagesList,
      itemHeights,
    ],
  );
  const keyExtractor = useCallback(item => item.key, []);

  const getItemLayout = (data, index) => {
    console.log('data', data);
    const length = itemHeights[index];
    const offset = itemHeights.slice(0, index).reduce((a, c) => a + c, 0);
    return {length: 54, offset: offset, index};
  };
  const onViewableItemsChanged = useCallback(({viewableItems, changed}) => {
    //   console.log('onViewableItemsChanged', viewableItems);
    //  console.log('changed', changed);

    const firstItem = viewableItems.find(item => item.index == 0);

    if (firstItem) {
      // console.log(firstItem);
      setShowCursorDown(firstItem.isViewable == true ? false : true);
    } else {
      setShowCursorDown(true);
    }
  }, []);
  const onScrollToIndexFailed = error => {
    console.log('error===', error);

    const offset = error.averageItemLength * error.index;
    listRef.current.scrollToOffset({
      offset,
    });
    setTimeout(() => {
      listRef.current.scrollToIndex({
        index: error.index,
      });
    }, 100);
    console.log('error===', error);
  };

  return (
    <ImageBackground source={bg} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
        style={{flex: 1}}>
        <View style={styles.messages}>
          {isNewChat && (
            <Bubble text="This is a new chat. Say hi" type="system" />
          )}

          {errorBannerText !== '' && (
            <Bubble text={errorBannerText} type="error" />
          )}
          <FlatList
            inverted
            showsVerticalScrollIndicator={false}
            //initialScrollIndex={messageId}
            onContentSizeChange={onLayout}
            // initialNumToRender={60} //   onLayout={onLayout}
            onScrollToIndexFailed={onScrollToIndexFailed}
            keyExtractor={keyExtractor}
            //   getItemLayout={getItemLayout}
            ref={listRef}
            data={messagesList}
            renderItem={renderItem}
            onViewableItemsChanged={onViewableItemsChanged}
          />

          {showCursorDown && (
            <Animated.View
              style={styles.scrollDown}
              entering={ZoomIn}
              exiting={ZoomOut}>
              <Pressable onPress={scrollDown}>
                <Ionicons name="arrow-down" size={24} />
              </Pressable>
            </Animated.View>
          )}
        </View>
        {replayingTo && (
          <ReplayTo
            text={replayingTo.text}
            user={storedUsers[replayingTo.sentBy]}
            onCancel={() => {
              setReplayingTo(null);
            }}
          />
        )}
        <InputBox
          listRef={listRef}
          chatID={chatID}
          onSendPress={onSendPress}
          messagesList={messagesList}
          replayingTo={replayingTo}
          setReplayingTo={setReplayingTo}
        />
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    color: colors.textColor,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.3,
    fontSize: 18,
  },
  messages: {
    flex: 1,
    paddingHorizontal: 5,
    paddingTop: 10,
    //  paddingVertical: 20,
  },
  img: {
    width: 40,
    height: 40,
    marginRight: 15,
    borderRadius: 40,
    marginLeft: 10,
  },
  scrollDown: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    position: 'absolute',
    bottom: 5,
    right: 0,
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    zIndex: 1000,
  },
});
