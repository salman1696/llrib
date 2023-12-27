import {useFocusEffect} from '@react-navigation/core';
import React, {useEffect} from 'react';
import {Alert, AsyncStorage} from 'react-native';
import UserApplications from './UserApplications';

const UserLogout = props => { 
  useFocusEffect(
    React.useCallback(() => {
      Alert.alert('Sign Out', 'Do you want to sign out from app?', [
        {
          text: 'Cancel',
          onPress: () => props.navigation.goBack(),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () =>
            setTimeout(async () => {
              try {
                await AsyncStorage.clear();
                // navigation.dispatch(
                //   CommonActions.reset({
                //     index: 0,
                //     routes: [{name: 'AuthenticationStack'}],
                //   }),
                // );
                props.navigation.navigate('AuthenticationStack');
              } catch (exception) {}
            }, 1000),
        },
      ], 
      {cancelable: false}
      );
    }, []),
  );

  return null;
};

export default UserLogout;
