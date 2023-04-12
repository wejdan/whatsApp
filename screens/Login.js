import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useEffect, useReducer, useState} from 'react';
import logo from '../assets/images/logo.png';
import InputField from '../components/InputField';
import Button from '../components/Button';
import colors from '../constants/colors';
import {validateInput} from '../utils/actions/formAction';
import {reducer} from '../utils/reducers/formReducer';
import {login} from '../utils/actions/authActions';
import {useDispatch} from 'react-redux';

const initState = {
  inputValues: {email: '', password: ''},

  inputValidities: {
    email: false,
    password: false,
  },
  formIsValid: false,
};
const Login = ({navigation}) => {
  const [formState, dispatchFormState] = useReducer(reducer, initState);
  const [isLoading, setLoad] = useState(false);
  const [errorMsg, setError] = useState(null);
  const dispatch = useDispatch();

  const inputChangeHandler = useCallback(
    (inputId, inputValue) => {
      let value = inputId === 'password' ? inputValue : inputValue.trim();
      const result = validateInput(inputId, value);

      dispatchFormState({id: inputId, validationResult: result, value});
    },
    [dispatchFormState],
  );
  useEffect(() => {
    if (errorMsg) {
      Alert.alert('An error occured', errorMsg, [{text: 'Okey'}]);
    }
  }, [errorMsg]);
  const authHandler = useCallback(async () => {
    //  console.log(formState.inputValues);
    try {
      setLoad(true);
      setError(null);

      await login(formState.inputValues);
    } catch (error) {
      setError(error.message);
      setLoad(false);
    }
  }, [formState]);
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
        style={{flex: 1}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Image source={logo} resizeMode="contain" style={styles.img} />
          <InputField
            lable="Email"
            icon="envelope-o"
            id="email"
            error={formState.inputValidities.email}
            inputChangeHandler={inputChangeHandler}
          />
          <InputField
            lable="Password"
            icon="lock"
            id="password"
            error={formState.inputValidities.password}
            inputChangeHandler={inputChangeHandler}
          />
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{marginTop: 10}}
            />
          ) : (
            <Button
              label="Login"
              onPress={authHandler}
              isDisabled={!formState.formIsValid}
              style={{marginTop: 20}}
            />
          )}

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Signup');
            }}>
            <Text style={styles.link}>Switch to Sigup</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  img: {alignSelf: 'center', width: '70%'},
  link: {
    color: colors.blue,
    textAlign: 'center',
    marginTop: 10,
  },
});
