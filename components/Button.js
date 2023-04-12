import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import colors from '../constants/colors';

const Button = ({onPress, label, isDisabled, style}) => {
  return (
    <TouchableOpacity
      disabled={isDisabled}
      style={{
        ...styles.btn,

        backgroundColor: isDisabled ? colors.lightGrey : colors.primary,
        ...style,
      }}
      onPress={onPress}>
      <Text
        style={{...styles.label, color: isDisabled ? colors.grey : 'white'}}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    alignItems: 'baseline',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 10,
    //  marginTop: 20,
  },
  label: {
    color: 'white',
  },
});
