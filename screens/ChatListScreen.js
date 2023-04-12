import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useLayoutEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import DataItem from '../components/DataItem';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';
import colors from '../constants/colors';
import PageTitle from '../components/PageTitle';
import {readNotification} from '../utils/notifications';

import {
  Menu,
  MenuTrigger,
  MenuOptions,
  MenuOption,
} from 'react-native-popup-menu';
import {MenuItem} from '../components/Bubble';
import {auth} from '../utils/firebaseHelper';
const ChatListScreen = ({navigation}) => {
  const storedUsers = useSelector(state => state.users.storedUsers);
  const menuRef = useRef(null);

  const chatsData = useSelector(state => {
    const userChats = state.chats.chatsData;
    return Object.values(userChats).sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  });
  const isLoading = useSelector(state => state.chats.isLoading);
  const userPressed = (userId, chatID) => {
    const navigationProps = {
      newChatData: {
        users: [userId, auth.currentUser.uid],
      },
      chatID,
    };
    navigation.navigate('ChatScreen', navigationProps);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item
              title="New Chat"
              iconName="create-outline"
              onPress={() => {
                navigation.navigate('NewChat');
              }}
            />
            <Item
              title="More"
              iconName="ellipsis-vertical"
              color={colors.textColor}
              onPress={() => {
                menuRef.current.props.ctx.menuActions.openMenu('home-settings');
              }}
            />
            <Menu name={'home-settings'} ref={menuRef}>
              <MenuTrigger />
              <MenuOptions>
                <MenuItem
                  text={`Starred Messages`}
                  //     icon="copy"
                  onSelect={() => {
                    navigation.navigate('StarredMessages');
                  }}
                />
              </MenuOptions>
            </Menu>
          </HeaderButtons>
        );
      },
    });
  }, [navigation]);
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <PageTitle text="Chats" />
      <View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('NewChat', {isGroupChat: true});
          }}>
          <Text style={styles.newGroupText}>New Group</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={chatsData}
        renderItem={itemData => {
          const chatInfo = itemData.item;
          const userId = chatInfo.users.find(id => id !== auth.currentUser.uid);

          const chatID = chatInfo.key;
          const userInfo = storedUsers[userId];
          let lastMessageLoading = false;
          if (!userInfo) return;
          let subTitle = '';
          if (!chatInfo.latestMessage) {
            subTitle = '';
          } else if (chatInfo.latestMessage.isNotification === true) {
            // chatInfo.latestMessage.text
            const latestMessageUser =
              storedUsers[chatInfo.latestMessage.text.user];
            if (!latestMessageUser) return;
            subTitle = readNotification(
              auth.currentUser.uid,
              chatInfo.latestMessage.text,
              latestMessageUser,
              storedUsers,
            );
          } else {
            lastMessageLoading = chatInfo.latestMessage.isLoading;
            if (chatInfo.isGroupChat) {
              const latestMessageUser =
                storedUsers[chatInfo.latestMessage.sentBy];
              if (!latestMessageUser) return;

              subTitle = `${
                chatInfo.latestMessage?.sentBy == auth.currentUser.uid
                  ? 'You: '
                  : latestMessageUser.firstLast + ': '
              }${chatInfo.latestMessage?.text}`;
            } else {
              subTitle = `${chatInfo.latestMessage?.text}`;
            }
          }

          const title = chatInfo.isGroupChat
            ? chatInfo.chatName
            : `${userInfo?.firstName} ${userInfo?.lastName}`;
          const img = chatInfo.isGroupChat
            ? chatInfo?.profileImage
            : userInfo?.profileImage;
          const updatedAt = chatInfo.updatedAt;
          return (
            <DataItem
              title={title}
              subTitle={subTitle}
              image={img}
              isLoading={lastMessageLoading}
              date={updatedAt}
              onPress={() => {
                userPressed(userId, chatID);
              }}
            />
          );
        }}
      />
    </View>
  );
};

export default ChatListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    // paddingVertical: 25,
  },
  newGroupText: {color: colors.blue, fontSize: 17, marginBottom: 5},
});
