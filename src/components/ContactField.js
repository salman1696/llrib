import React, { useEffect, useState } from 'react';
import { Picker } from 'native-base';
import { StyleSheet, Text, TextInput, View, Platform } from 'react-native';
import { textFieldBorder } from '../utils/colors';
import { dialingcodes } from '../assets/data/dialingcodes';
import parsePhoneNumber from 'libphonenumber-js';

const ContactField = React.forwardRef((props, ref) => {
  let container = {
    flexDirection: 'row',
    borderColor: props.borderColor,
    borderWidth: 1,
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === "android" ? 1 : 10,
    borderRadius: 5,
  };
  
    const [ codes, setCodes ] = useState(null);
    const [ selected, setSelected ] = useState(null);
    const [ format, setformat ] = useState(null);
    const [ lastIndex, setLastIndex ] = useState(0);

  const [phone, setPhone] = useState(null);
  const [formattedPhone, setFormattedPhone] = useState(null);

  const [focused, setFocused] = useState(false);

  let items = null;

  useEffect(() => {
    items = dialingcodes.map((item, index) => {
      return <Picker.Item key={index} value={item.code} label={item.code} />;
    });
    setCodes(items);
  }, []);

  function handleTextChange(text) {
    console.log('Length', String(text).length);
    if (String(text).length == 3 && lastIndex < String(text).length) {
      text = '(' + text + ') ';
      setformat(text);
    } else if (String(text).length > 3 && lastIndex > String(text).length) {
      text = String(text).substring(1, 4);
      setformat(text);
      setLastIndex(String(text).length);
    } else {
      setLastIndex(String(text).length);
    }
    props.onChangeText(text);
  }

  const getFormattedValue = () => {
    const formattedNumber = parsePhoneNumber(props.value ?? phone, 'US');
    console.log('Formatted Phone', formattedNumber.formatNational());
    setFormattedPhone(formattedNumber.formatNational());
    return formattedNumber.formatNational();
  }

  return (
    <View style={container}>
      <View style={{ flex: 0.3, justifyContent: 'center', alignItems: 'center' }}>
        {/* <Picker
                    itemStyle={{backgroundColor: 'white'}}
                    mode="dropdown"
                    selectedValue={props.selectedValue}
                    onValueChange={props.onValueChange}
                >
                    {codes}
                </Picker> */}
        <Text style={{ color: 'black', fontSize: 18 }}>+1</Text>
      </View>
      <TextInput
        {...props}
        ref={ref}
        maxLength={focused == true ? 10 : 20}
        style={{
          flex: 0.75,
          borderLeftColor: 'black',
          paddingHorizontal: 13,
          borderLeftWidth: 1,
          color: 'black',
        }}
        placeholder={'(xxx) xxx-xxxx'}
        value={props.value}
        keyboardType="phone-pad"
        onFocus={() => {
          setPhone(phone);
          setFocused(true);
        }}
        onBlur={() => {
          if (String(phone).length == 10) {
            const formattedNumber = parsePhoneNumber(phone, 'US');
            console.log('Formatted Phone', formattedNumber.formatNational());
            setFormattedPhone(formattedNumber.formatNational());
            setFocused(false);
          } else {
            setPhone(null);
            // alert('Invalid phone number.');
          }
        }}
        // "+12133734253"
        placeholderTextColor={'lightgray'}
        onChangeText={text => {
          setPhone(text);
          props.onChangeText(text);
        }}
      />
    </View>
  );
});

export default ContactField;
