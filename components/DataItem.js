import {
  StyleSheet,
  Image,
  Text,
  View,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import userImage from '../assets/images/userImage.jpeg';
import colors from '../constants/colors';
import {formatDate} from './Bubble';

const DataItem = ({
  title,
  isLoading,
  subTitle,
  image,
  onPress,
  type,
  isChecked,
  date,
}) => {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.container}>
        <Image
          source={image != null ? {uri: image} : userImage}
          resizeMode="contain"
          style={styles.img}
        />
        <View style={styles.text}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subTitle && (
            <Text numberOfLines={1} style={styles.subtitle}>
              {subTitle}
            </Text>
          )}
        </View>

        {type === 'checkbox' && (
          <View
            style={[
              {...styles.iconContainer},
              isChecked && styles.checkedStyle,
            ]}>
            <Ionicons name={'checkmark'} size={24} color={'white'} />
          </View>
        )}
        {isLoading && (
          <View>
            <ActivityIndicator size={'small'} color={colors.primary} />
          </View>
        )}
        {!isLoading && date && (
          <View>
            <Text style={styles.time}>{formatDate(date)}</Text>
          </View>
        )}
        {type === 'link' && (
          <View>
            <Ionicons
              name={'chevron-forward-outline'}
              size={24}
              color={colors.grey}
            />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default DataItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    //  marginVertical: 8,
    // height: 70,
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 50,
  },
  img: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    marginRight: 5,
  },
  text: {
    marginLeft: 14,
    flex: 1,
  },
  title: {
    color: colors.textColor,
    fontFamily: 'Roboto-Medium',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: 'Roboto-Regular',
    letterSpacing: 0.3,
    color: colors.grey,
  },
  iconContainer: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 50,
    backgroundColor: 'white',
  },
  checkedStyle: {
    backgroundColor: colors.primary,
    borderColor: 'transparent',
    color: 'white',
  },
  time: {
    fontSize: 12,
    color: colors.gray,
  },
});
