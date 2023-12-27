import React, {useContext, useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Header from '../../../components/Header';
import {
  blue,
  green,
  primaryBGColor,
  textFieldBorder,
} from '../../../utils/colors';
import LinearGradient from 'react-native-linear-gradient';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {applicationList, recentMembers} from '../../../assets/data/userdata';
import {Picker} from 'native-base';
import {AppContext} from '../../../context/AppContext';
import moment from 'moment';

const ApplicationList = props => {
  const [state, dispatch] = useContext(AppContext);
  const [profileImg, setProfileImg] = useState(''); 

  useEffect(() => {
    // console.log(state.applications, 'usersall');
    state.user.imageUrl !== '' && getDocument(state.user.imageUrl);
  }, []);

    const getDocument = async path => {
    let response = await getPresignedUrlToGetDocuments(
      {
        file: path,
      },
      state.user?.accessToken,
    );
    if (response.status === 200) {
      console.log(response, 'url fetched');
      setProfileImg(response.data.url);
    } else {
      console.log(response, 'url fetched err');
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: primaryBGColor}}>
      <ScrollView>
        <Header
          redirectToAdminProfile={() =>
            props.navigation.navigate('admin_profile')
          }
          name={state.user.displayName}
          isAdmin={true}
          adminImg={profileImg}
        />
        <View style={styles.container}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 15,
            }}>
            <View style={{flex: 0.6}}>
              <Text style={{fontSize: 24, fontWeight: 'bold'}}>
                Applications
              </Text>
            </View>
          </View>
          <View>
            {state.applications.map((item, index) => {
              return (
                <View style={styles.card}>
                  <TouchableOpacity
                    onPress={() => {
                      if (item.status !== 'IN_PROGRESS') {
                        props.navigation.navigate('application_cards', {
                          item: item,
                        });
                      } else {
                        props.navigation.navigate('application_list', {
                          item: item,
                        });
                      }
                    }}
                    style={{flexDirection: 'row'}}>
                    <View>
                      <Text style={styles.cardTitle}>
                        {item?.userProfile?.firstName === null ||
                        item?.userProfile === null
                          ? 'John Doe'
                          : item?.userProfile?.firstName}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          marginTop: 3,
                          alignItems: 'center',
                        }}>
                        <Text style={{color: 'gray', fontSize: 12}}>
                          Community:{' '}
                        </Text>
                        <Text style={styles.sub}>
                          {item?.type === 'SOCIAL_ASSIST'
                            ? 'Socail Assistance'
                            : 'La Ronge'}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          marginTop: 3,
                          alignItems: 'center',
                        }}>
                        <Text style={{color: 'gray', fontSize: 12}}>
                          Application Date:{' '}
                        </Text>
                        <Text style={styles.sub}>
                          {moment.utc(item.startedOn).format('YYYY-MM-DD')}
                        </Text>
                      </View>
                      {item.status == 'APPROVED' && (
                        <View
                          style={{
                            flexDirection: 'row',
                            marginTop: 3,
                            alignItems: 'center',
                          }}>
                          <Text style={{color: 'gray', fontSize: 12}}>
                            Review Date:{' '}
                          </Text>
                          <Text style={styles.sub}>
                            {' '}
                            {moment.utc(item.reviewedOn).format('YYYY-MM-DD')}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={{position: 'absolute', right: 0, top: 0}}>
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Icon name="chevron-right" size={25} color={green} />
                      </TouchableOpacity>
                    </View>
                    <View style={{position: 'absolute', right: 0, bottom: 0}}>
                      <View
                        style={{
                          ...styles.statusContainer,
                          backgroundColor:
                            item.status == 'APPROVED'
                              ? '#D4F6E5'
                              : item?.status == 'SUBMITTED'
                              ? '#d4e3f6'
                              : '#FCF0D3',
                        }}>
                        <Text
                          style={{
                            color:
                              item.status == 'APPROVED'
                                ? green
                                : item?.status == 'SUBMITTED'
                                ? blue
                                : 'orange',
                            textTransform: 'capitalize',
                            fontSize: 12,
                          }}>
                          {item.status}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: 40,
    height: 50,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 5,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 15,
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
    fontSize: 16,
    marginBottom: 5,
  },
  label: {
    color: 'lightgray',
    fontSize: 15,
    marginBottom: 3,
  },
  sub: {
    color: 'gray',
    fontSize: 12,
  },
  dropdown: {
    width: 100,
    height: 30,
    borderColor: textFieldBorder,
    borderWidth: 1,
    borderRadius: 5,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
});

export default ApplicationList;
