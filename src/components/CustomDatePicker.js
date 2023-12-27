import React from 'react';
import {StyleSheet, View, Text, Platform} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {TouchableOpacity} from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useState, useEffect} from 'react';
import {DatePicker} from 'native-base';
import moment from 'moment';

const MIN_AGE_LIMIT = 18;
const MAX_AGE_LIMIT = 65;

const CustomDatePicker = props => {
  // new Date()
  const [date, setDate] = useState(
    props.value
      ? Date.parse(
          String(props.value).includes('T')
            ? props.value
            : `${props.value}T00:00:00Z`,
        )
      : new Date(2000, 0, 1),
  ); ///Updated
  const [show, setShow] = useState(false);
  const [pickerWidth, setPickerWidth] = useState(160);
  const [maxDate, setMaxDate] = useState();
  const [minDate, setMinDate] = useState();

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDate = new Date().getDate();

    setMaxDate(
      new Date(
        currentYear + MIN_AGE_LIMIT,
        currentMonth,
        currentDate,
        0,
        0,
        0,
        0,
      ),
    );
    setMinDate(
      new Date(
        currentYear - MAX_AGE_LIMIT,
        currentMonth,
        currentDate,
        0,
        0,
        0,
        0,
      ),
    );
  }, []);

  useEffect(() => {
    var currentDate = props.value ? new Date(props.value) : new Date(2000, 0, 1);
    setDate(currentDate);
  }, [props]);

  function onChange(event, d) {
    console.log('Date', new Date(d).getDate());
    if (new Date(d).getDate() < 10) {
      setPickerWidth(145);
    } else {
      setPickerWidth(155);
    }

    setShow(false);
    if (d) {
      setDate(d);
      props.onChange(d);
    }
  }

  return (
    <View
      style={{
        ...styles.container,
        borderColor: props.hasError ? 'red' : 'black',
      }}>
      {Platform.OS === 'android' && (
        <TouchableOpacity
          style={{flexDirection: 'row', height: 50, alignItems: 'center'}}
          onPress={() => {
            props.editable && setShow(true);
          }}>
          <Text
            style={{
              fontSize: 14,
              color: !props.init ? 'black' : 'lightgray',
              marginLeft: 5,
            }}>
            {props.value
              ? `${new Date(props.value ?? '').toLocaleDateString()}`
              : !props.init
              ? new Date().toLocaleDateString()
              : 'Set date'}
          </Text>
          <View style={styles.icon}>
            <Icon name="calendar" size={25} color={'black'} />
          </View>
        </TouchableOpacity>
      )}
      {Platform.OS === 'ios' && (
        <View
          style={{
            height: 45,
            justifyContent: 'center',
          }}>
          <View style={{alignItems: 'center', width: '25%'}}>
            <DateTimePicker
              display="default"
              mode="date"
              style={{width: pickerWidth}}
              value={date == null ? new Date() : date}
              onChange={onChange}
              maximumDate={moment().subtract(18, "years")._d}
              minimumDate={moment().subtract(65, "years")._d}
            />
          </View>
        </View>
      )}
      {show && Platform.OS === 'android' && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date == null ? new Date() : date}
          mode={'date'}
          display="default"
          onChange={onChange}
          maximumDate={moment().subtract(18, "years")._d}
          minimumDate={moment().subtract(65, "years")._d}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    marginTop: 7,
    paddingLeft: 12,
    paddingRight: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  icon: {
    position: 'absolute',
    right: 15,
    top: 10,
  },
});

export default CustomDatePicker;
