import {
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useEffect, useReducer, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import colors from '../constants/colors';
import Button from '../components/Button';
import logo from '../assets/images/logo.png';
import InputField from '../components/InputField';
import {validateInput} from '../utils/actions/formAction';
import {reducer} from '../utils/reducers/formReducer';
import {signUp} from '../utils/actions/authActions';

const initState = {
  inputValues: {firstName: '', lastName: '', email: '', password: ''},
  inputValidities: {
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  },
  formIsValid: false,
};
const Signup = ({navigation}) => {
  const dispatch = useDispatch();

  const [error, setError] = useState(null);
  const [isLoading, setLoad] = useState(false);

  const [formState, dispatchFormState] = useReducer(reducer, initState);
  const inputChangeHandler = useCallback(
    (inputId, inputValue) => {
      let value = inputId === 'password' ? inputValue : inputValue.trim();
      const result = validateInput(inputId, value);

      dispatchFormState({id: inputId, validationResult: result, value});
    },
    [dispatchFormState],
  );
  useEffect(() => {
    if (error) {
      Alert.alert('An error occured', error, [{text: 'Okey'}]);
    }
  }, [error]);
  const authHandler = useCallback(async () => {
    //  console.log(formState.inputValues);
    try {
      setLoad(true);

      setError(null);
      await signUp(formState.inputValues);
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
            lable="First Name"
            icon="user-o"
            id="firstName"
            inputChangeHandler={inputChangeHandler}
            error={formState.inputValidities.firstName}
          />
          <InputField
            lable="Last Name"
            icon="user-o"
            id="lastName"
            inputChangeHandler={inputChangeHandler}
            error={formState.inputValidities.lastName}
          />
          <InputField
            lable="Email"
            icon="envelope-o"
            id="email"
            inputChangeHandler={inputChangeHandler}
            error={formState.inputValidities.email}
          />
          <InputField
            lable="Password"
            icon="lock"
            id="password"
            isPassword={true}
            inputChangeHandler={inputChangeHandler}
            error={formState.inputValidities.password}
          />
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{marginTop: 10}}
            />
          ) : (
            <Button
              label="Create Account"
              onPress={authHandler}
              isDisabled={!formState.formIsValid}
              style={{marginTop: 20}}
            />
          )}

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Login');
            }}>
            <Text style={styles.link}>Switch to Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Signup;

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
