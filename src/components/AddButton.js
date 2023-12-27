import React from 'react';
import {ActivityIndicator, StyleSheet, Text} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {color} from 'react-native-reanimated';
import {green} from '../utils/colors';

const AddButton = props => {
  return (
    <TouchableOpacity
      style={[styles.button, props.style]}
      disabled={props.isLoading}
      onPress={props.onPress}>
      {props.isLoading ? (
        <ActivityIndicator size={'small'} color={green} />
      ) : (
        <Text style={[styles.buttonText, props.textStyle]}>{props.text}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 6,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: green,
  },
  buttonText: {
    fontSize: 16,
    color: green,
    fontWeight: 'bold',
  },
});

export default AddButton;
