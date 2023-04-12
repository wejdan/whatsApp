import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, {useState} from 'react';
import colors from '../constants/colors';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import {sendNotification, updateChat} from '../utils/actions/chatActions';
import {auth} from '../utils/firebaseHelper';

const ChangeNameScreen = ({route, navigation}) => {
  const chatsData = useSelector(state => state.chats.chatsData);
  const [isLoading, setLoading] = useState(false);

  const chatId = route?.params?.chatId;
  const chatData = chatsData[chatId];
  const [chatName, setChatName] = useState(chatData?.chatName);
  const updateName = async () => {
    if (!chatName) return;
    setLoading(true);
    const newData = {
      chatName: chatName,
    };
    await updateChat(newData, chatId);
    const notificationObj = {
      action: `Changed the name to ${chatName}`,
      user: auth.currentUser.uid,
    };
    sendNotification(auth.currentUser.uid, chatId, notificationObj);
    setLoading(false);
    navigation.goBack();
  };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
      }}>
      <View style={{marginHorizontal: 20, marginTop: 10}}>
        <TextInput
          value={chatName}
          onChangeText={t => setChatName(t)}
          style={styles.input}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          flexDirection: 'row',
          width: '100%',
        }}>
        <View style={styles.button}>
          <TouchableWithoutFeedback onPress={updateName}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableWithoutFeedback>
        </View>
        <View style={{...styles.button, borderLeftWidth: 1}}>
          <TouchableWithoutFeedback
            onPress={() => {
              navigation.goBack();
            }}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableWithoutFeedback>
        </View>
      </View>
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

export default ChangeNameScreen;

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderTopWidth: 1,
    borderColor: colors.lightGrey,

    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.primary,
  },
  input: {
    //flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: 3,
    color: colors.textColor,
  },
});
