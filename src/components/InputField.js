import React from 'react';
import {Text, StyleSheet, TextInput} from 'react-native';
import {textFieldBorder} from '../utils/colors';

const InputField = React.forwardRef((props, ref) => {
  const textfield = {
    borderColor: props.borderColor,
    borderWidth: 1,
    marginTop: 7,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 5,
    color: 'black',
  };

  return (
    <>
      <TextInput
        autoCapitalize={props.cap === 'sentences' ? null : 'none'}
        ref={ref}
        style={{
          ...textfield,
          backgroundColor: props.editable == false ? 'lightgray' : 'white',
        }}
        placeholder={props.placeholder}
        // secureTextEntry={props.secureTextEntry ? true : false}
        keyboardType={props.keyboardType}
        onChangeText={props.onChangeText}
        placeholderTextColor={'lightgray'}
        value={props.value}
        {...props}
      />
      {props.hasError && <Text style={styles.error}>{props.error}</Text>}
    </>
  );
});

const styles = StyleSheet.create({
  error: {
    color: 'red',
    fontSize: 14,
  },
});

export default InputField;
