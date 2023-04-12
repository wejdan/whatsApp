import {
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Text,
  View,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import DataItem from '../components/DataItem';
import {useDispatch, useSelector} from 'react-redux';
import ProfileImage from '../components/ProfileImage';
import colors from '../constants/colors';

import {
  deleteChat,
  removeUserChat,
  updateChat,
  sendNotification,
} from '../utils/actions/chatActions';

import {
  Menu,
  MenuTrigger,
  MenuOptions,
  MenuOption,
} from 'react-native-popup-menu';
import {MenuItem} from '../components/Bubble';

import Button from '../components/Button';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {auth} from '../utils/firebaseHelper';
const ChatSettingsScreen = ({navigation, route}) => {
  const storedUsers = useSelector(state => state.users.storedUsers);
  const userData = useSelector(state => state.auth.userData);

  const chatsData = useSelector(state => state.chats.chatsData);
  const [isLoading, setLoading] = useState(false);
  const chatId = route?.params?.chatID;
  const chatData = chatId && chatsData[chatId];
  const menuRef = useRef(null);

  const isAdmin = chatData && chatData.createdBy == auth.currentUser.uid;
  const itemsRef = useRef([]);

  const exitGroup = useCallback(async () => {
    await removeUser(auth.currentUser.uid);
    const notificationObj = {
      action: 'left group',
      user: auth.currentUser.uid,
    };
    sendNotification(auth.currentUser.uid, chatId, notificationObj);

    navigation.navigate('Home');
  }, [chatId, navigation, removeUser]);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
              <Item
                title="More"
                iconName="ellipsis-vertical"
                color={colors.textColor}
                onPress={() => {
                  menuRef.current.props.ctx.menuActions.openMenu('settings');
                }}
              />
            </HeaderButtons>
            <Menu name={'settings'} ref={menuRef}>
              <MenuTrigger />
              <MenuOptions>
                {isAdmin && (
                  <MenuItem
                    text={`Change group name`}
                    //     icon="copy"
                    onSelect={() => {
                      navigation.navigate('ChangeName', {chatId});
                    }}
                  />
                )}
                {isAdmin && (
                  <MenuItem
                    text={`Add a participant`}
                    //     icon="copy"
                    onSelect={() => {
                      navigation.navigate('UsersList', {chatId});
                    }}
                  />
                )}
                <MenuItem
                  text={`Exit the group`}
                  //     icon="copy"
                  onSelect={() => {
                    exitGroup();
                  }}
                />
              </MenuOptions>
            </Menu>
          </>
        );
      },
    });
  }, [navigation, isAdmin, chatId, removeUser, exitGroup]);
  const removeUser = useCallback(
    async userId => {
      setLoading(true);
      await removeUserChat(userId, chatId);
      const newData = {
        users: chatsData[chatId].users.filter(user => user != userId),
      };
      await updateChat(newData, chatId);
      setLoading(false);
    },
    [chatId, chatsData],
  );
  const removeGroup = useCallback(
    async (id, users) => {
      users.map(async user => {
        await removeUserChat(user, id);
      });
      await deleteChat(id);

      navigation.navigate('Home');
    },
    [navigation],
  );
  const messageUser = userId => {
    let chatID = null;
    Object.keys(chatsData).map(key => {
      if (
        chatsData[key].users.includes(userId) &&
        !chatsData[key].isGroupChat
      ) {
        chatID = key;
      }
    });
    const navigationProps = {
      newChatData: {
        users: [userId, auth.currentUser.uid],
      },
    };
    if (chatID) {
      navigationProps.chatID = chatID;
    }

    navigation.replace('ChatScreen', navigationProps);
  };

  if (!chatData) {
    return (
      <View
        style={{
          ...StyleSheet.absoluteFill,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.5)',
        }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{alignItems: 'center'}}
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}>
        <ProfileImage
          size={120}
          uri={chatData.profileImage}
          chatId={chatId}
          isGroupImg={true}
          edit={true}
        />
        <Text style={styles.title}>{chatData.chatName}</Text>

        <View
          style={{
            marginTop: 10,
            width: '100%',
            paddingHorizontal: 10,
            marginTop: 20,
            backgroundColor: 'white',
            flex: 1,
          }}>
          {chatData.users.length > 0 && (
            <View style={{marginVertical: 10}}>
              <Text
                style={
                  styles.about
                }>{`${chatData.users.length}  participants`}</Text>
            </View>
          )}
          {
            <DataItem
              title={userData.firstLast}
              subTitle={userData.about}
              image={userData.profileImage}
            />
          }
          {chatData.users
            .filter(u => u !== auth.currentUser.uid)
            .slice(0, 3)
            .map((user, i) => {
              const userInfo = storedUsers[user];
              if (!userInfo) return;

              return (
                <View key={i}>
                  <DataItem
                    title={userInfo.firstLast}
                    subTitle={userInfo.about}
                    image={userInfo.profileImage}
                    onPress={() => {
                      itemsRef.current[i].props.ctx.menuActions.openMenu(user);
                      // navigation.navigate('Contact', {
                      //   userId: user,
                      // });
                    }}
                  />
                  <Menu
                    key={user}
                    name={user}
                    ref={el => (itemsRef.current[i] = el)}>
                    <MenuTrigger />
                    <MenuOptions>
                      <MenuItem
                        text={`Message ${userInfo.firstLast}`}
                        //     icon="copy"
                        onSelect={() => {
                          messageUser(user);
                        }}
                      />
                      {isAdmin && (
                        <MenuItem
                          text={`Remove  ${userInfo.firstLast}`} // icon={isStarred ? 'star' : 'star-o'}
                          onSelect={() => {
                            removeUser(user);
                            const notificationObj = {
                              action: 'removed',
                              user: auth.currentUser.uid,
                              object: [user],
                            };
                            sendNotification(
                              auth.currentUser.uid,
                              chatId,
                              notificationObj,
                            );
                          }}
                        />
                      )}
                    </MenuOptions>
                  </Menu>
                </View>
              );
            })}
          {chatData.users.length > 4 && (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('DataList', {chatID: chatId});
              }}
              style={{alignSelf: 'center'}}>
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: 'Roboto-Regular',
                  letterSpacing: 0.3,
                  fontSize: 16,
                  paddingVertical: 15,
                }}>
                Veiw all ({`${chatData.users.length - 4}`} more)
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {isAdmin && (
          <Button
            label="Remove Group"
            onPress={async () => {
              setLoading(true);
              await removeGroup(chatId, chatData.users);
            }}
            // isDisabled={!formState.formIsValid}
            style={{
              marginTop: 20,
              marginBottom: 10,
              // alignSelf: 'center',
              backgroundColor: colors.red,
            }}
          />
        )}
      </ScrollView>
      {isLoading && (
        <View
          style={{
            ...StyleSheet.absoluteFill,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.5)',
          }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
};

export default ChatSettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: 20,
  },
  about: {
    color: colors.grey,
    fontFamily: 'Roboto-Medium',
    letterSpacing: 0.3,
    fontSize: 16,
  },
  title: {
    color: colors.textColor,
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.3,
    fontSize: 22,
    marginTop: 20,
    //   marginBottom: 5,
  },
});
