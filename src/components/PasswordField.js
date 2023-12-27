import React, {useState} from 'react';
import {View, StyleSheet, TextInput, Text, Platform, TouchableOpacity} from 'react-native';
import {textFieldBorder} from '../utils/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const PasswordField = React.forwardRef((props, ref) => {
  const [show, setShow] = useState(true);

  const textfield = {
    borderColor: props.borderColor,
    borderWidth: 1,
    marginTop: 7,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === "ios" ? 12 : 0,   // Yawar bro it will distrub the UI.
    borderRadius: 5,
    color: 'black',
  };

  return (
    <View style={textfield}>
      <TextInput
        {...props}
        ref={ref}
        placeholder={props.placeholder}
        placeholderTextColor={'lightgray'}
        secureTextEntry={show}
        style={{width: '90%'}}
        onChangeText={props.onChangeText}
      />
      <View style={styles.icon}>
        <TouchableOpacity onPress={() => setShow(!show)}>
          <Icon
            name={show ? 'eye-off-outline' : 'eye'}
            size={22}
            color={textFieldBorder}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  icon: {
    position: 'absolute',
    justifyContent: 'center',
    right: 15,
    top: 0,
    bottom: 0,
  },
});

export default PasswordField;
