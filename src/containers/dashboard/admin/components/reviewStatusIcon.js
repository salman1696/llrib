import React from 'react';
import {StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ReviewStatusIcon = props => {
  const {status} = props;
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: status ? 'green' : '#edb10e',
          borderRadius: 20,
          padding: 4,
        },
      ]}>
      {status ? (
        <Icon name="check" color={'white'} size={15} />
      ) : (
        <Icon name="timer-sand" color={'white'} size={15} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
});

export default ReviewStatusIcon;
