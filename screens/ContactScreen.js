import {StyleSheet, Text, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import ProfileImage from '../components/ProfileImage';
import colors from '../constants/colors';
import DataItem from '../components/DataItem';

const ContactScreen = ({route, navigation}) => {
  const storedUsers = useSelector(state => state.users.storedUsers);
  const chatsData = useSelector(state => state.chats.chatsData);
  const [commonChats, setCommonChats] = useState([]);

  const userId = route?.params?.userId;
  const userData = storedUsers[userId];

  useEffect(() => {
    if (!userId) return;
    const tmpList = [];
    Object.keys(chatsData).map(chat => {
      const singleChat = chatsData[chat];
      if (singleChat.isGroupChat && singleChat.users.includes(userId)) {
        console.log(singleChat.chatName);
        tmpList.push(singleChat);
      }
    });
    setCommonChats(tmpList);
  }, [userId, chatsData]);

  if (!userData) return <View></View>;
  return (
    <View style={styles.container}>
      <ProfileImage size={120} uri={userData.profileImage} />
      <Text style={styles.title}>{userData.firstLast}</Text>
      {userData.about && (
        <Text style={styles.about} numberOfLines={2}>
          {userData.about}
        </Text>
      )}
      <View
        style={{
          marginTop: 10,
          width: '100%',
          paddingHorizontal: 10,
          marginTop: 20,
          backgroundColor: 'white',
          flex: 1,
        }}>
        {commonChats.length > 0 && (
          <View style={{marginVertical: 10}}>
            <Text style={styles.about}>{`${commonChats.length} ${
              commonChats.length == 1 ? 'Group' : 'Groups'
            } in Common`}</Text>
          </View>
        )}
        {commonChats.map((chat, i) => {
          const subtitle = [];
          chat.users.map(user => {
            subtitle.push(storedUsers[user].firstName);
          });
          return (
            <DataItem
              key={i}
              title={chat.chatName}
              subTitle={subtitle.join()}
              type="link"
              image={chat.profileImage}
              onPress={() => {
                navigation.replace('ChatScreen', {chatID: chat.key});
              }}
            />
          );
        })}
      </View>
    </View>
  );
};

export default ContactScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
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
