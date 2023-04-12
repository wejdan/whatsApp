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
import {useDispatch, useSelector} from 'react-redux';
import Bubble from '../components/Bubble';
import {
  createChat,
  geChatMessagesToDate,
  geChatMessagesWithLimits,
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

import {setChatMessages} from '../store/messagesSlice';
import {auth} from '../utils/firebaseHelper';
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

const ChatScreen = ({navigation, route}) => {
  const chatsData = useSelector(state => state.chats.chatsData);
  const storedUsers = useSelector(state => state.users.storedUsers);
  const dispatch = useDispatch();

  const [chatID, setChatId] = useState(route?.params?.chatID);
  const [isNewChat, setisNewChat] = useState(route?.params?.isNewChat);
  const [showCursorDown, setShowCursorDown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const listRef = useRef(null);
  const [errorBannerText, setErrorBannerText] = useState('');
  const messagesList = useSelector(state => {
    const msgsList = state.messages.messagesData[chatID];
    if (!msgsList) {
      return [];
    } else {
      const messagesList = Object.keys(msgsList).map(key => {
        return {...msgsList[key], key};
      });

      const messages = messagesList.sort((a, b) => {
        return new Date(b.sentAt) - new Date(a.sentAt);
      });

      return messages;
    }
  });
  const [messageId, setMessageId] = useState(
    route?.params?.messageId &&
      messagesList.findIndex(m => m.key === route?.params?.messageId),
  );
  const [listOpacity, setOpacity] = useState(messageId ? 0 : 1);
  const userData = useSelector(state => state.auth.userData);
  const handleBackButton = () => {
    navigation.navigate('Home');
    return true;
  };

  const [noMoreData, setNoMoreData] = useState(
    messagesList.length == 0 ? true : false,
  );
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
  const chatUsers = chatData && chatData.users;
  const chatName = chatData.chatName;
  const isGroupChat = chatData.isGroupChat;
  const fetchMessages = useCallback(async () => {
    const moreMessages = await geChatMessagesToDate(
      chatID,
      route.params.sentAt,
    );
    dispatch(
      setChatMessages({
        messagesData: {
          chatId: chatID,
          messages: moreMessages,
          loadOldMessages: true,
        },
      }),
    );
  }, [chatID, route, dispatch]);
  useEffect(() => {
    if (route?.params?.messageId) {
      fetchMessages();
    }
  }, [route, chatID, fetchMessages]);
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

  const goToIndex = React.useCallback(info => {
    const wait = new Promise(resolve => setTimeout(resolve, 200));
    wait.then(() => {
      listRef.current?.scrollToIndex({index: info.index, animated: true});
    });
  }, []);

  useEffect(() => {
    if (route?.params?.messageId && messageId == -1) {
      const index = messagesList.findIndex(
        m => m.key === route.params.messageId,
      );
      setMessageId(index);
    }
  }, [messagesList, route, messageId]);
  const loadMoreMessages = useCallback(async () => {
    if (messagesList.length == 0) return;
    const startDate = messagesList[messagesList.length - 1].sentAt;
    const lasstMessageId = messagesList[messagesList.length - 1].key;
    const isLastMessageLoading =
      messagesList[messagesList.length - 1].isLoading;
    if (isLastMessageLoading) return;
    const moreMessages = await geChatMessagesWithLimits(
      chatID,
      startDate,
      lasstMessageId,
    );
    if (Object.keys(moreMessages).length == 0) {
      setNoMoreData(true);
    }
    dispatch(
      setChatMessages({
        messagesData: {
          chatId: chatID,
          messages: moreMessages,
          loadOldMessages: true,
        },
      }),
    );

    setRefreshing(false);
  }, [chatID, messagesList, dispatch]);
  React.useEffect(() => {
    if (refreshing) {
      loadMoreMessages();
    }
  }, [loadMoreMessages, refreshing]);
  const onSendPress = useCallback(
    async (key, messageTxt, uploadUrl = null) => {
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
            key,
            auth.currentUser.uid,
            chatID,
            uploadUrl,
            replayingTo?.key,
          );
          //   dispatch(setChatMessages({messagesData: {[id]: [...messagesList]}}));
        } else {
          await sendTextMessage(
            key,
            userData,
            chatID,
            messageTxt,
            replayingTo?.key,
            chatUsers,
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
    [
      chatID,
      route.params.newChatData,
      replayingTo,
      chatUsers,
      userData,
      isNewChat,
    ],
  );
  const scrollDown = useCallback(() => {
    listRef.current.scrollToOffset({
      animated: true,
      offset: 0,
    });
  }, []);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
  }, []);
  const onLayout = useCallback(() => {
    if (messageId && messageId !== -1) {
      listRef.current.scrollToIndex({index: messageId, animated: false});
    }
  }, [messageId]);
  const ListFooterComponent = useCallback(() => {
    if (noMoreData) return;
    return <ActivityIndicator />;
  }, [noMoreData]);
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
        <View key={index}>
          {isNewDate && <PureBubble text={strDate} type="date" />}

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
    ],
  );
  const onViewableItemsChanged = useCallback(({viewableItems, changed}) => {
    //console.log('onViewableItemsChanged', viewableItems);
    const firstItem = viewableItems.find(item => item.index == 0);

    if (firstItem) {
      // console.log(firstItem);
      setShowCursorDown(firstItem.isViewable == true ? false : true);
    } else {
      setShowCursorDown(true);
    }
    if (route?.params?.messageId) {
      const scrollToItem = viewableItems.find(
        item => item.item.key == route.params.messageId,
      );
      if (scrollToItem && scrollToItem.isViewable) {
        setOpacity(1);
        setMessageId(null);
      }
    }
  }, []);

  return (
    <ImageBackground source={bg} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
        style={{flex: 1}}>
        <View style={styles.messages}>
          {messagesList.length == 0 && (
            <Bubble text="This is a new chat. Say hi" type="system" />
          )}

          {errorBannerText !== '' && (
            <Bubble text={errorBannerText} type="error" />
          )}
          <FlatList
            style={{opacity: listOpacity}}
            inverted
            showsVerticalScrollIndicator={false}
            onEndReached={onRefresh}
            ListFooterComponent={ListFooterComponent}
            ListFooterComponentStyle={{flexGrow: 1, paddingTop: 20}}
            onContentSizeChange={onLayout}
            initialNumToRender={20}
            removeClippedSubviews={true}
            windowSize={3}
            onScrollToIndexFailed={index => goToIndex(index)}
            ref={listRef}
            data={messagesList}
            renderItem={renderItem}
            onViewableItemsChanged={onViewableItemsChanged}
          />
          {listOpacity == 0 && (
            <View
              style={{
                ...StyleSheet.absoluteFill,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.5)',
              }}>
              <ActivityIndicator size="large" />
            </View>
          )}
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
