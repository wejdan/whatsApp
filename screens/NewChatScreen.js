import {
  ActivityIndicator,
  Button,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';
import colors from '../constants/colors';
import {searchUsers} from '../utils/actions/userActions';
import DataItem from '../components/DataItem';
import {setStoredUsers} from '../store/userSlice';
import ProfileImage from '../components/ProfileImage';
import {createChat, sendNotification} from '../utils/actions/chatActions';
import uuid from 'react-native-uuid';
import {auth} from '../utils/firebaseHelper';

const NewChatScreen = ({navigation, route}) => {
  const isGroupChat = route.params?.isGroupChat;
  const chatsData = useSelector(state => state.chats.chatsData);
  const storedUsers = useSelector(state => state.users.storedUsers);
  const dispatch = useDispatch();
  const [isloading, setIsLoading] = useState(false);
  const [createGroupLoading, setCreateGroupLoading] = useState(false);
  const [users, setUsers] = useState();
  const [checkedUsers, setCheckedUsers] = useState([]);

  const [noResultsFound, setNoResultsFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupName, setSetGroupName] = useState('');
  const scrollViewRef = useRef();
  const isCreateGroupDisabled =
    groupName === '' || checkedUsers.length == 0 || createGroupLoading;
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchTerm || searchTerm == '') {
        setUsers();
        setNoResultsFound(false);
        return;
      }
      setIsLoading(true);

      const results = await searchUsers(searchTerm);
      delete results[auth.currentUser.uid];
      setUsers(results);
      if (Object.keys(results).length == 0) {
        setNoResultsFound(true);
      } else {
        setNoResultsFound(false);
        dispatch(setStoredUsers({newUsers: results}));
      }

      setIsLoading(false);
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, dispatch]);

  const createGroup = useCallback(async () => {
    const newChatData = {
      chatName: groupName,
      isGroupChat: true,
      users: [auth.currentUser.uid, ...checkedUsers],
      //chatID: id,
    };
    setCreateGroupLoading(true);
    const id = uuid.v4();
    await createChat(auth.currentUser.uid, id, newChatData);
    const notificationObj = {
      action: 'Created a chat',
      user: auth.currentUser.uid,
    };
    sendNotification(auth.currentUser.uid, id, notificationObj);
    setCreateGroupLoading(false);
    const navigationProps = {
      newChatData: {
        chatName: groupName,
        isGroupChat: true,
        users: [auth.currentUser.uid, ...checkedUsers],
      },
      chatID: id,
    };

    navigation.replace('ChatScreen', navigationProps);
  }, [checkedUsers, groupName, navigation]);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item title="Close" onPress={() => navigation.goBack()} />
          </HeaderButtons>
        );
      },
      headerTitle: isGroupChat ? 'Add participants' : 'New Chat',
      headerRight: () => {
        if (!isGroupChat) return;
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item
              iconName="create-outline"
              title="Create"
              disabled={isCreateGroupDisabled}
              color={isCreateGroupDisabled ? colors.lightGrey : undefined}
              onPress={createGroup}
            />
          </HeaderButtons>
        );
      },
    });
  }, [
    navigation,
    groupName,
    isGroupChat,
    checkedUsers,
    isCreateGroupDisabled,
    createGroup,
  ]);
  const userPressed = userId => {
    if (isGroupChat) {
      if (checkedUsers.includes(userId)) {
        setCheckedUsers(prev => prev.filter(user => user !== userId));
      } else {
        setCheckedUsers([...checkedUsers, userId]);
      }
    } else {
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
      } else {
        navigationProps.chatID = uuid.v4();
        navigationProps.isNewChat = true;
      }

      navigation.replace('ChatScreen', navigationProps);
    }
  };
  return (
    <View style={styles.container}>
      {isGroupChat && (
        <>
          <View style={styles.chatNameContainer}>
            <View style={styles.textContainer}>
              <TextInput
                placeholder="Enter a name for your chat"
                style={styles.textBox}
                value={groupName}
                autoCorrect={false}
                onChangeText={text => setSetGroupName(text)}
              />
            </View>
          </View>
          {checkedUsers.length > 0 && (
            <View
              style={{
                marginTop: 5,

                height: 50,
              }}>
              <ScrollView
                ref={scrollViewRef}
                onContentSizeChange={() =>
                  scrollViewRef.current.scrollToEnd({animated: true})
                }
                horizontal
                showsHorizontalScrollIndicator={false}>
                {checkedUsers.map((user, i) => {
                  return (
                    <View style={{marginRight: 10}} key={user}>
                      <ProfileImage
                        size={40}
                        uri={storedUsers[user]?.profileImage}
                        isDelete={true}
                        onPress={() => {
                          setCheckedUsers(prev => prev.filter(u => u !== user));
                        }}
                      />
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </>
      )}
      <View style={styles.seachContainer}>
        <FontAwesome name="search" size={15} color={colors.lightGrey} />
        <TextInput
          placeholder="Search"
          style={styles.input}
          onChangeText={text => {
            setSearchTerm(text);
          }}
        />
      </View>
      {isloading && (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      {!isloading && users && (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={Object.keys(users)}
          renderItem={itemData => {
            const userId = itemData.item;

            const userInfo = users[userId];

            return (
              <DataItem
                title={`${userInfo.firstName} ${userInfo.lastName}`}
                subTitle={userInfo.about}
                image={userInfo.profileImage}
                type={isGroupChat ? 'checkbox' : ''}
                isChecked={checkedUsers.includes(userId)}
                onPress={() => {
                  userPressed(userId);
                }}
                // type={isGroupChat ? 'checkbox' : ''}
                //  isChecked={selectedUsers.includes(userId)}
              />
            );
          }}
        />
      )}
      {!isloading && noResultsFound && (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <FontAwesome
            name="question"
            size={55}
            color={colors.lightGrey}
            style={styles.noResultsIcon}
          />
          <Text style={styles.noResultsText}>No users found</Text>
        </View>
      )}

      {!isloading && !users && (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <FontAwesome
            name="users"
            size={55}
            color={colors.lightGrey}
            style={styles.noResultsIcon}
          />
          <Text style={styles.noResultsText}>
            Enter a name to search for a user
          </Text>
        </View>
      )}

      {createGroupLoading && (
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

export default NewChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    // paddingVertical: 25,
  },
  input: {flex: 1, marginLeft: 8, fontSize: 15},
  seachContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.extraLightGrey,
    marginVertical: 8,
    //  paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  noResultsIcon: {marginBottom: 20},
  noResultsText: {
    color: colors.textColor,
    fontFamily: 'Roboto-Regular',
    letterSpacing: 0.3,
  },
  img: {
    borderWidth: 1,
    borderColor: colors.grey,
  },
  textContainer: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.nearlyWhite,
    flexDirection: 'row',
    borderRadius: 2,
  },
  chatNameContainer: {paddingVertical: 10},
  textBox: {
    color: colors.textColor,
    width: '100%',
    fontFamily: 'Roboto-Regular',
    letterSpacing: 0.3,
  },
});
