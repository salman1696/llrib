import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import {green} from '../utils/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {TouchableOpacity} from 'react-native-gesture-handler';

const Header = props => {
  return (
    <ImageBackground
      source={require('../assets/img/header.png')}
      style={styles.bgContainer}>
      <View style={styles.viewContainer}>
        <View style={styles.childContainer}>
          <Image
            source={require('../assets/img/splash_logo.png')}
            resizeMode={'contain'}
            style={styles.logo}
          />
        </View>
        <View
          style={{
            ...styles.childContainerProfile,
            paddingRight: props.onCreateAccount ? '2%' : '5%',
          }}>
          {props.isAdmin ? (
            <TouchableOpacity
              style={{justifyContent: 'center', alignItems: 'center'}}
              onPress={props.redirectToAdminProfile}>
              {props.adminImg !== '' ? (
                <Image
                  source={{uri: props.adminImg}}
                  style={{width: 40, height: 40, borderRadius: 65}}
                />
              ) : (
                <Icon name="account-circle" size={40} color={'lightgray'} />
              )}
              <Text style={{color: 'white'}}>{props.name}</Text>
            </TouchableOpacity>
          ) : props.isUser ? (
            <TouchableOpacity
              style={{justifyContent: 'center', alignItems: 'center'}}
              onPress={props.redirectToUserProfile}>
              {props.imgPath !== '' ? (
                <Image
                  source={{uri: props.imgPath}}
                  resizeMode={'cover'}
                  style={{width: 35, height: 35, borderRadius: 55}}
                />
              ) : (
                <Icon name="account-circle" size={40} color={'lightgray'} />
              )}

              <Text style={{color: 'white'}}>{props?.user?.displayName}</Text>
            </TouchableOpacity>
          ) : props.onCreateAccount ? (
            <TouchableOpacity
              style={styles.button}
              onPress={props.onCreateAccount}>
              <Text style={styles.buttonText}>Create account</Text>
            </TouchableOpacity>
          ) : props.onSignIn ? (
            <TouchableOpacity
              style={[styles.button, styles.btnSignIn]}
              onPress={props.onSignIn}>
              <Text style={styles.buttonText}>Sign in</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bgContainer: {
    width: '100%',
    height: 105,
    backgroundColor: '#fff',
  },
  viewContainer: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? 0 : 25,
    flexDirection: 'row',
    paddingRight: '2%',
  },
  childContainer: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childContainerProfile: {
    flex: 0.5,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  logo: {
    flex: 1,
    justifyContent: 'center',
    width: '80%',
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: '5%',
    paddingVertical: 11,
    borderRadius: 20,
  },
  btnSignIn: {
    paddingHorizontal: 30,
  },
  buttonText: {
    color: green,
  },
});

export default Header;
