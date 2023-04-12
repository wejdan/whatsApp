import {StyleSheet, Text} from 'react-native';
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ChatSettingsScreen from '../screens/ChatSettingsScreen';
import TabNavigator from './TabNavigator';
import ChatScreen from '../screens/ChatScreen';
import ContactScreen from '../screens/ContactScreen';
import DataListScreen from '../screens/DataListScreen';
import NewChatScreen from '../screens/NewChatScreen';
import ChangeNameScreen from '../screens/ChangeNameScreen';
import colors from '../constants/colors';
import UsersListScreen from '../screens/UsersListScreen';
import StarredMessages from '../screens/StarredMessages';

const Stack = createStackNavigator();
const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Group>
        <Stack.Screen
          options={{headerShown: false}}
          name="Home"
          component={TabNavigator}
        />
        <Stack.Screen
          options={{
            title: '',
            headerLeft: () => {
              return <Text>back</Text>;
            },
          }}
          name="ChatScreen"
          component={ChatScreen}
        />
        <Stack.Screen
          name="ChatSettings"
          component={ChatSettingsScreen}
          options={{title: 'Settings', headerShadowVisible: false}}
        />
        <Stack.Screen
          name="ChangeName"
          component={ChangeNameScreen}
          options={{
            title: 'Enter new name',
            headerShadowVisible: false,
            headerLeft: null,
            headerTitleStyle: {
              color: 'white',
            },
            headerStyle: {
              backgroundColor: colors.primary,
            },
          }}
        />
        <Stack.Screen
          name="UsersList"
          options={{title: 'Add particpants'}}
          component={UsersListScreen}
        />
        <Stack.Screen
          name="StarredMessages"
          options={{
            title: null,
            headerTitleStyle: {
              color: 'white',
            },
            headerStyle: {
              backgroundColor: colors.primary,
            },
          }}
          component={StarredMessages}
        />
      </Stack.Group>
      <Stack.Group screenOptions={{presentation: 'containedModal'}}>
        <Stack.Screen name="NewChat" component={NewChatScreen} />
        <Stack.Screen
          name="Contact"
          options={{title: 'Contact info'}}
          component={ContactScreen}
        />
        <Stack.Screen name="DataList" component={DataListScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});
