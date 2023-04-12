import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  ScrollView,
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
import DataItem from '../components/DataItem';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';
import colors from '../constants/colors';

import ProfileImage from '../components/ProfileImage';
import {addUsersToChat, sendNotification} from '../utils/actions/chatActions';
import {setStoredUsers} from '../store/userSlice';
import {searchUsers} from '../utils/actions/userActions';
import {TextInput} from 'react-native-gesture-handler';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {auth} from '../utils/firebaseHelper';

const UsersListScreen = ({navigation, route}) => {
  const storedUsers = useSelector(state => state.users.storedUsers);

  const chatId = route?.params?.chatId;
  const chatData = useSelector(state => state.chats.chatsData[chatId]);

  const scrollViewRef = useRef();
  const {width} = Dimensions.get('window');

  const [checkedUsers, setCheckedUsers] = useState([]);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [users, setUsers] = useState();

  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [isSeaching, setIsSearching] = useState(false);
  const dispatch = useDispatch();

  const isAddUsersDisabled = checkedUsers.length == 0 || isLoading;
  const userPressed = userId => {
    if (checkedUsers.includes(userId)) {
      setCheckedUsers(prev => prev.filter(user => user !== userId));
    } else {
      setCheckedUsers([...checkedUsers, userId]);
    }
  };

  const addUsers = useCallback(async () => {
    if (checkedUsers.length == 0) return;
    setLoading(true);
    await addUsersToChat(checkedUsers, chatData.users, chatId);
    const notificationObj = {
      action: 'Added',
      user: auth.currentUser.uid,
      object: checkedUsers,
    };
    sendNotification(auth.currentUser.uid, chatId, notificationObj);
    // setLoading(false);

    navigation.goBack();
  }, [checkedUsers, chatId, navigation, chatData.users]);
  useLayoutEffect(() => {
    navigation.setOptions({
      title: null,
      headerRight: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item
              iconName="create-outline"
              title="Create"
              disabled={isAddUsersDisabled}
              color={isAddUsersDisabled ? colors.lightGrey : undefined}
              onPress={addUsers}
            />
          </HeaderButtons>
        );
      },
      headerLeft: () => {
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: width * 0.5,
            }}>
            <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
              <Item
                title="Back"
                iconName="arrow-back"
                color={colors.textColor}
                onPress={() => {
                  navigation.goBack();
                }}
              />
            </HeaderButtons>
            <TextInput
              placeholder="search..."
              style={{flex: 1}}
              onChangeText={t => {
                setSearchTerm(t);
              }}
            />
          </View>
        );
      },
    });
  }, [setSearchTerm, navigation, width, addUsers, isAddUsersDisabled]);
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchTerm || searchTerm == '') {
        setUsers();
        setNoResultsFound(false);
        return;
      }
      setIsSearching(true);

      const results = await searchUsers(searchTerm);
      // delete results[auth.currentUser.uid];
      chatData.users.map(u => delete results[u]);
      setUsers(results);
      if (Object.keys(results).length == 0) {
        setNoResultsFound(true);
      } else {
        setNoResultsFound(false);
        dispatch(setStoredUsers({newUsers: results}));
      }

      setIsSearching(false);
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, dispatch, chatData.users]);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item
              title="New Chat"
              iconName="create-outline"
              onPress={addUsers}
              disabled={isAddUsersDisabled}
              color={isAddUsersDisabled ? colors.lightGrey : undefined}
            />
          </HeaderButtons>
        );
      },
    });
  }, [navigation, isAddUsersDisabled, addUsers, setLoading]);

  return (
    <View style={styles.container}>
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

      {isSeaching && (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      {!isSeaching && users && (
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
                type={'checkbox'}
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
      {!isSeaching && noResultsFound && (
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

      {!isSeaching && !users && (
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

export default UsersListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  newGroupText: {color: colors.blue, fontSize: 17, marginBottom: 5},
});
