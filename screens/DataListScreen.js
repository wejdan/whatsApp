import {StyleSheet, Text, Dimensions, TextInput, View} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';
import DataItem from '../components/DataItem';
import {
  Menu,
  MenuTrigger,
  MenuOptions,
  MenuOption,
} from 'react-native-popup-menu';
import uuid from 'react-native-uuid';

import {MenuItem} from '../components/Bubble';
import {
  removeUserChat,
  sendNotification,
  updateChat,
} from '../utils/actions/chatActions';
import {ScrollView} from 'react-native-gesture-handler';
import colors from '../constants/colors';
import {auth} from '../utils/firebaseHelper';
const DataListScreen = ({navigation, route}) => {
  const storedUsers = useSelector(state => state.users.storedUsers);
  const userData = useSelector(state => state.auth.userData);

  const chatsData = useSelector(state => state.chats.chatsData);
  const chatId = route?.params?.chatID;
  const chatData = chatId && chatsData[chatId];
  const {height, width} = Dimensions.get('window');

  const isAdmin = chatData.createdBy == auth.currentUser.uid;
  const itemsRef = useRef([]);
  const [isLoading, setLoading] = useState(false);
  const [search, setSearch] = useState();
  const [searchResult, setSearchResult] = useState([]);

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
    } else {
      navigationProps.chatID = uuid.v4();
      navigationProps.isNewChat = true;
    }

    navigation.replace('ChatScreen', navigationProps);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: null,
      headerLeft: () => {
        return (
          <View style={{flexDirection: 'row', alignItems: 'center', width}}>
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
                setSearch(t);
              }}
            />
          </View>
        );
      },
    });
  }, [setSearch, navigation, width]);

  useEffect(() => {
    if (!search) {
      setSearchResult(
        chatData.users
          .filter(u => u !== auth.currentUser.uid)
          .map(user => storedUsers[user]),
      );
    } else {
      setSearchResult(
        chatData.users.map(user => {
          const userInfo = storedUsers[user];
          console.log(userInfo, search, userInfo.firstLast.startsWith(search));
          if (
            userInfo.firstLast.toLowerCase().startsWith(search.toLowerCase()) &&
            user != auth.currentUser.uid
          ) {
            return userInfo;
          }
        }),
      );
    }
  }, [search, chatData.users, storedUsers]);
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{alignItems: 'center'}}
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}>
        <View
          style={{
            marginTop: 3,
            width: '100%',
            paddingHorizontal: 10,
            //    marginTop: 20,
            backgroundColor: 'white',
            flex: 1,
          }}>
          {
            <DataItem
              title={'You'}
              subTitle={userData.about}
              image={userData.profileImage}
            />
          }
          {searchResult.map((userInfo, i) => {
            // const userInfo = storedUsers[user];
            if (!userInfo) return;

            return (
              <View key={i}>
                <DataItem
                  title={userInfo.firstLast}
                  subTitle={userInfo.about}
                  image={userInfo.profileImage}
                  onPress={() => {
                    itemsRef.current[i].props.ctx.menuActions.openMenu(
                      `${userInfo.firstLast}`,
                    );
                    // navigation.navigate('Contact', {
                    //   userId: user,
                    // });
                  }}
                />
                <Menu
                  key={`${userInfo.firstLast}`}
                  name={`${userInfo.firstLast}`}
                  ref={el => (itemsRef.current[i] = el)}>
                  <MenuTrigger />
                  <MenuOptions>
                    <MenuItem
                      text={`Message ${userInfo.firstLast}`}
                      //     icon="copy"
                      onSelect={() => {
                        messageUser(userInfo.userId);
                      }}
                    />
                    {isAdmin && (
                      <MenuItem
                        text={`Remove  ${userInfo.firstLast}`} // icon={isStarred ? 'star' : 'star-o'}
                        onSelect={() => {
                          removeUser(userInfo.userId);
                          const notificationObj = {
                            action: 'removed',
                            user: auth.currentUser.uid,
                            object: [userInfo.userId],
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
        </View>
      </ScrollView>
    </View>
  );
};

export default DataListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: 0,
  },
});
