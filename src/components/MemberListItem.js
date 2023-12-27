import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {green} from '../utils/colors';
import GlobalStyles from '../GlobalStyles';
import {truncateString} from '../helpers/Utils';

const MemberListItem = props => {
  const {item, navigation} = props;
  return (
    <View style={styles.card}>
      <View style={GlobalStyles.flexDirectionRow}>
        <View style={GlobalStyles.flexOne}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('profile_cards', {
                showStatus: true,
                item: item,
              })
            }
            style={GlobalStyles.flexDirectionRow}>
            <View style={{marginRight: 5}}>
              <Icon name="account-circle" size={40} color={'lightgray'} />
            </View>
            <View>
              <Text style={styles.cardTitle}>
                {item?.firstName === null || item === null
                  ? 'John Doe'
                  : item?.firstName}
              </Text>
              <Text style={styles.sub}>{truncateString(item.email, 24)}</Text>
              <Text style={styles.sub}>Community Name</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View>
          <View style={GlobalStyles.flexOne}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('user_apps', {
                  return_to_adminView: true,
                  item: item,
                });
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Icon name="note-text" size={14} color={green} />
              <Text style={{marginLeft: 7}}>Applications</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flex: 0.5,
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            }}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('feedback', {
                  item: item,
                  route: 'user-profile',
                })
              }
              style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon name="message-reply-text" size={14} color={green} />
              <Text style={{marginLeft: 7}}>Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 5,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 10,
    minHeight: 70,
    borderColor: '#ededed',
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    color: green,
    fontWeight: 'bold',
    fontSize: 15,
  },
  sub: {
    color: 'gray',
    fontSize: 12,
    flexWrap: 'wrap',
  },
});

export default MemberListItem;
