import React, {useContext} from 'react';
import {StyleSheet, ScrollView, ImageBackground, Image} from 'react-native';
// import CheckBox from '@react-native-community/checkbox';
import Header from '../components/Header';
import {primaryBGColor} from '../utils/colors';

import {AppContext} from '../context/AppContext';
import {View} from 'native-base';

const Splash = props => {
  // Context
  const [state, dispatch] = useContext(AppContext);

  return (
    <ImageBackground
      source={require('../assets/img/header.png')}
      style={styles.bgContainer}>
      <Image
        source={require('../assets/img/splash_logo.png')}
        resizeMode={'contain'}
        style={styles.logo}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primaryBGColor,
    justifyContent: 'center',
  },
  bgContainer: {
    width: '100%',
    height: 105,
    position: 'absolute',
    top: 0,
  },
  logo: {
    width: '100%',
    height: 130,
    alignSelf: 'center',
    justifyContent: 'center',
  },
});

export default Splash;
