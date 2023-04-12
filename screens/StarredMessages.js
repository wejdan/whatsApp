import {
  StyleSheet,
  Text,
  Dimensions,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';
import {Menu, MenuTrigger, MenuOptions} from 'react-native-popup-menu';
import Bubble, {MenuItem} from '../components/Bubble';
import {TextInput} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';

import {
  geStarredMessagesWithLimits,
  retrieveMessage,
  unstarAll,
} from '../utils/actions/chatActions';
import {
  removeAllStarredMessages,
  setStarredMessages,
} from '../store/messagesSlice';
import md5 from 'md5';
import {auth} from '../utils/firebaseHelper';

const StarredMessages = ({navigation, route}) => {
  const menuRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showSearch, setShowSearch] = useState(false);
  const dispatch = useDispatch();

  const storedUsers = useSelector(state => state.users.storedUsers);
  const starredMessages = useSelector(state => state.messages.starredMessages);
  const [noMoreData, setNoMoreData] = useState(
    Object.values(starredMessages).length == 0 ? true : false,
  );

  const messagesData = useSelector(state => {
    return state.messages.messagesData;
  });
  const [messagesList, setMessagesList] = useState([]);
  const [starredList, setStarredList] = useState([]);

  useEffect(() => {
    if (!searchTerm || searchTerm == '') {
      setStarredList(messagesList);

      return;
    }
    const result = messagesList.filter(
      msg => msg.text.startsWith(searchTerm) && !msg.imageUrl,
    );
    setStarredList(result);
  }, [searchTerm, dispatch, messagesList]);
  const getMessagesData = useCallback(async () => {
    const tmp = [];
    const userStarredMessages = Object.values(starredMessages);

    for (let j = 0; j < userStarredMessages.length; j++) {
      const msg = userStarredMessages[j];
      if (messagesData[msg.chatId][msg.messageId]) {
        tmp.push({
          ...messagesData[msg.chatId][msg.messageId],
          chatId: msg.chatId,
          messageId: msg.messageId,
          starredAt: msg.starredAt,
        });
      } else {
        const message = await retrieveMessage(msg.chatId, msg.messageId);
        tmp.push({
          ...message,
          chatId: msg.chatId,
          messageId: msg.messageId,
          starredAt: msg.starredAt,
        });
      }
    }

    const sortedList = tmp.sort((a, b) => {
      return new Date(b.starredAt) - new Date(a.starredAt);
    });
    // console.log('setting the statae', sortedList);

    setMessagesList(sortedList);
  }, [messagesData, starredMessages]);
  useEffect(() => {
    getMessagesData();
  }, [starredMessages, getMessagesData]);
  const loadMoreMessages = useCallback(async () => {
    if (starredList.length == 0) return;
    const startDate = starredList[starredList.length - 1].starredAt;
    const lasstMessageId = starredList[starredList.length - 1].messageId;
    const lastMessageChatId = starredList[starredList.length - 1].chatId;
    const moreMessages = await geStarredMessagesWithLimits(
      auth.currentUser.uid,
      startDate,
      md5(lastMessageChatId + lasstMessageId),
    );
    if (Object.keys(moreMessages).length == 0) {
      setNoMoreData(true);
    }
    for (const chatId in moreMessages) {
      dispatch(
        setStarredMessages({
          starredMessages: {[chatId]: moreMessages[chatId]},
        }),
      );
    }

    setRefreshing(false);
  }, [starredList, dispatch]);
  React.useEffect(() => {
    if (refreshing) {
      //   dispatch(clearData());
      loadMoreMessages();
    }
  }, [loadMoreMessages, refreshing]);
  const {width} = Dimensions.get('window');
  const removeAll = useCallback(async () => {
    setLoading(true);
    await unstarAll(auth.currentUser.uid);
    setLoading(false);
    dispatch(removeAllStarredMessages());
    setStarredList([]);
  }, [dispatch]);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: showSearch ? width * 0.5 : undefined,
            }}>
            <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
              <Item
                title="Back"
                iconName="arrow-back"
                color={'white'}
                onPress={() => {
                  if (showSearch) {
                    setShowSearch(false);
                  } else {
                    navigation.goBack();
                  }
                }}
              />
            </HeaderButtons>
            {showSearch && (
              <TextInput
                placeholder="search..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={{flex: 1, color: 'white', fontSize: 18}}
                onChangeText={t => {
                  setSearchTerm(t);
                }}
              />
            )}
          </View>
        );
      },
      headerTitle: showSearch ? null : 'Starred Messages',
      headerRight: () => {
        return (
          <>
            <View style={{flexDirection: 'row'}}>
              <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
                {!showSearch && (
                  <Item
                    title="More"
                    iconName="search"
                    color={'white'}
                    onPress={() => {
                      setShowSearch(true);
                    }}
                  />
                )}
              </HeaderButtons>
              <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
                <Item
                  title="Serach"
                  iconName="ellipsis-vertical"
                  color={'white'}
                  onPress={() => {
                    menuRef.current.props.ctx.menuActions.openMenu(
                      'stars-manu',
                    );
                  }}
                />
              </HeaderButtons>
            </View>
            <Menu name={'stars-manu'} ref={menuRef}>
              <MenuTrigger />
              <MenuOptions>
                <MenuItem
                  text={`Unstar All`}
                  //     icon="copy"
                  onSelect={removeAll}
                />
              </MenuOptions>
            </Menu>
          </>
        );
      },
    });
  }, [navigation, showSearch, setShowSearch, width, removeAll]);
  const ListFooterComponent = useCallback(() => {
    if (noMoreData) return;
    return <ActivityIndicator />;
  }, [noMoreData]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
  }, []);
  return (
    <View style={styles.container}>
      <FlatList
        //  inverted
        showsVerticalScrollIndicator={false}
        data={starredList}
        onEndReached={onRefresh}
        ListFooterComponent={ListFooterComponent}
        ListFooterComponentStyle={{flexGrow: 1, paddingTop: 20}}
        renderItem={({item, index}) => {
          const {
            text,
            imageUrl,
            sentBy,
            messageId,
            chatId,
            starredAt,
            sentAt,
            key,
          } = item;

          //  lastDate.current = strDate;
          const isOwnMessage = sentBy == auth.currentUser.uid;
          const name =
            storedUsers[sentBy] && sentBy && storedUsers[sentBy].firstLast;
          return (
            <>
              <Bubble
                name={isOwnMessage ? 'You' : name}
                text={text}
                messageId={messageId}
                sentAt={sentAt}
                imageUrl={imageUrl}
                chatID={chatId}
                isStar={true}
                // onUnstar={() => {
                //   const tmp = [...starredList];

                //   setStarredList(tmp.filter(msg => msg.messageId != messageId));
                // }}
                type={
                  sentBy == auth.currentUser.uid ? 'myMessage' : 'theirMessage'
                }
              />
              <View style={{marginTop: 10}} />
            </>
          );
        }}
      />
      {loading && (
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
    </View>
  );
};

export default StarredMessages;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5,
    backgroundColor: 'white',
    paddingTop: 10,

    // paddingVertical: 25,
  },
});
