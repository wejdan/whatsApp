import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {HeaderButton} from 'react-navigation-header-buttons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../constants/colors';

const CustomHeaderButton = props => {
  return (
    <HeaderButton
      IconComponent={Ionicons}
      iconSize={23}
      {...props}
      color={props.color ?? colors.blue}
    />
  );
};

export default CustomHeaderButton;

const styles = StyleSheet.create({});
