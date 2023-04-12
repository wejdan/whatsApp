import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useReducer, useState} from 'react';
import {signout} from '../utils/actions/authActions';
import {useDispatch, useSelector} from 'react-redux';
import colors from '../constants/colors';
import InputField from '../components/InputField';
import {validateInput} from '../utils/actions/formAction';
import {reducer} from '../utils/reducers/formReducer';
import Button from '../components/Button';
import PageTitle from '../components/PageTitle';
import {updateUser} from '../utils/actions/userActions';
import {setData} from '../store/authSlice';
import ProfileImage from '../components/ProfileImage';

const SettingsScreen = ({navigation}) => {
  const userData = useSelector(state => state.auth.userData);

  const [isLoading, setLoad] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isFormChanged, setFormChanged] = useState(false);

  const initState = {
    inputValues: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      about: userData.about,
    },
    inputValidities: {
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      about: undefined,
    },
    formIsValid: false,
  };
  const [formState, dispatchFormState] = useReducer(reducer, initState);
  useEffect(() => {
    const inputValues = {
      ...formState.inputValues,
    };
    let isChange = false;
    for (const key in inputValues) {
      if (inputValues[key] != userData[key]) {
        isChange = true;
        break;
      }
    }
    setFormChanged(isChange);
  }, [formState, userData]);
  const inputChangeHandler = useCallback(
    (inputId, inputValue) => {
      let value = inputId === 'password' ? inputValue : inputValue.trim();
      const result = validateInput(inputId, value);

      dispatchFormState({id: inputId, validationResult: result, value});
    },
    [dispatchFormState],
  );
  const dispatch = useDispatch();

  const handleLogout = () => {
    signout();
  };

  const saveHandler = useCallback(async () => {
    const firstLast =
      `${formState.inputValues.firstName} ${formState.inputValues.lastName}`.toLowerCase();

    const newData = {...formState.inputValues, firstLast};
    try {
      setLoad(true);
      await updateUser(newData);
      //   setFormChanged(false);

      dispatch(setData({userData: newData}));
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
    } finally {
      setLoad(false);
    }
  }, [dispatch, formState]);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
        style={{flex: 1}}>
        <PageTitle text="Settings" />

        <ScrollView
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}>
          <ProfileImage edit={true} size={80} uri={userData.profileImage} />
          <InputField
            lable="First Name"
            icon="user-o"
            id="firstName"
            initalValue={userData.firstName}
            inputChangeHandler={inputChangeHandler}
            error={formState.inputValidities.firstName}
          />
          <InputField
            lable="Last Name"
            icon="user-o"
            id="lastName"
            initalValue={userData.lastName}
            inputChangeHandler={inputChangeHandler}
            error={formState.inputValidities.lastName}
          />
          <InputField
            lable="Email"
            icon="envelope-o"
            id="email"
            initalValue={userData.email}
            inputChangeHandler={inputChangeHandler}
            error={formState.inputValidities.email}
          />
          <InputField
            lable="About"
            icon="user-o"
            id="about"
            initalValue={userData.about}
            multiline={true}
            inputChangeHandler={inputChangeHandler}
            error={formState.inputValidities.about}
          />
          <View style={{marginTop: 20}}>
            {showSuccessMessage && (
              <Text style={{textAlign: 'center'}}>Saved Successfuly</Text>
            )}
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{marginTop: 10}}
              />
            ) : (
              isFormChanged && (
                <Button
                  label="Save"
                  onPress={saveHandler}
                  isDisabled={!formState.formIsValid}
                  style={{marginTop: 20}}
                />
              )
            )}
          </View>
          <Button
            label="Logout"
            onPress={handleLogout}
            // isDisabled={!formState.formIsValid}
            style={{
              marginTop: 20,
              // alignSelf: 'center',
              backgroundColor: colors.red,
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    //paddingVertical: 25,
  },
  form: {alignItems: 'center'},
});
