import {StyleSheet, Text, View, TextInput} from 'react-native';
import React from 'react';
import colors from '../constants/colors';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
const InputField = ({
  lable,
  id,
  icon,
  error,
  inputChangeHandler,
  initalValue,
  multiline,
}) => {
  const onChangeText = text => {
    inputChangeHandler(id, text);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{lable}</Text>
      <View style={styles.row}>
        {icon && <FontAwesome name={icon} size={18} color={colors.grey} />}
        <TextInput
          secureTextEntry={id == 'password'}
          autoCapitalize="none"
          keyboardType={id == 'email' ? 'email-address' : 'default'}
          multiline={multiline === true ? true : false}
          style={styles.input}
          defaultValue={initalValue}
          onChangeText={onChangeText}
        />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
  },
  input: {
    flex: 1,
    paddingVertical: 6,
    color: colors.textColor,
    fontFamily: 'Roboto-Regular',
    letterSpacing: 0.3,
  },
  label: {
    color: colors.textColor,
    letterSpacing: 0.3,
    marginBottom: 8,
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  errorContainer: {marginVertical: 5},
  error: {
    color: 'red',
    fontSize: 13,
    letterSpacing: 0.3,
    fontFamily: 'Roboto-Regular',
  },
  row: {
    backgroundColor: '#f2f7f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderRadius: 5,
  },
});
