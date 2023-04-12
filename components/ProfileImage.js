import {
  StyleSheet,
  Image,
  Text,
  View,
  TouchableOpacity,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import userImage from '../assets/images/userImage.jpeg';
import colors from '../constants/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {setData} from '../store/authSlice';
import {updateUser} from '../utils/actions/userActions';
import {useDispatch} from 'react-redux';
import {pickImage, uploadeImg} from '../utils/imagePickerHelper';
import {sendNotification, updateChat} from '../utils/actions/chatActions';
import {auth} from '../utils/firebaseHelper';

const ProfileImage = ({
  size,
  isDelete,
  edit,
  chatId,
  isGroupImg,
  uri,
  onPress,
}) => {
  const [img, setImg] = useState(uri);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const openImagePicker = async () => {
    const tmpUri = await pickImage();
    if (!tmpUri) return;
    setLoading(true);
    const imgUrl = await uploadeImg(
      tmpUri,
      isGroupImg ? 'group' : 'profile',
      isGroupImg && chatId,
    );
    setImg(imgUrl);
    setLoading(false);
    const newData = {profileImage: imgUrl};
    if (isGroupImg) {
      await updateChat(newData, chatId);
      const notificationObj = {
        action: `Changed the chat image`,
        user: auth.currentUser.uid,
      };
      sendNotification(auth.currentUser.uid, chatId, notificationObj);
    } else {
      await updateUser(newData);
      dispatch(setData({userData: newData}));
    }
    //   setFormChanged(false);
  };
  const isEditButton = isDelete || edit;
  const Container = isEditButton ? TouchableOpacity : View;
  return (
    <Container onPress={onPress || (edit && openImagePicker)}>
      {loading ? (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.lightGrey,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ActivityIndicator size="small" color={colors.extraLightGrey} />
        </View>
      ) : (
        <Image
          source={img ? {uri: img} : userImage}
          resizeMode="contain"
          style={{
            ...styles.img,
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        />
      )}
      {isDelete && (
        <View
          style={{
            position: 'absolute',
            right: -3,
            bottom: -3,
            backgroundColor: colors.lightGrey,
            borderRadius: 20,
            padding: 3,
          }}>
          <FontAwesome name="remove" size={15} />
        </View>
      )}
      {edit && (
        <View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            backgroundColor: colors.lightGrey,
            borderRadius: 20,
            padding: 8,
          }}>
          <FontAwesome name="pencil" size={15} />
        </View>
      )}
    </Container>
  );
};

export default ProfileImage;

const styles = StyleSheet.create({
  img: {
    borderWidth: 1,
    borderColor: colors.grey,
  },
});
