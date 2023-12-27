import React, {useContext, useEffect, useReducer, useState} from 'react';
import {
  AsyncStorage,
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
import {recentApplications, recentMembers} from '../../../assets/data/userdata';
import {Picker} from 'native-base';
import {getMembers, getApplications} from '../../../utils/strings';
import {
  getApplicationsAction,
  getUsersAction,
} from '../../../servercalls/admin';
import {AppContext} from '../../../context/AppContext';
import moment from 'moment';
import {getPresignedUrlToGetDocuments} from '../../../servercalls/fetchFiles';
import MemberListItem from '../../../components/MemberListItem';

const AdminHome = props => {
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentMembers, setReMember] = useState([]);
  const [profileImg, setProfileImg] = useState(''); 

  const [state, dispatch] = useContext(AppContext);
  useEffect(() => {
    // initiate the server call.
    getUsers();
    getApplicationsCall();
    state.user.imageUrl !== '' &&
    getDocument(state.user?.imageUrl);
    console.log(state.user,'url==>');
  }, []);

  async function getUsers() {
    const response = await getUsersAction(state?.user?.accessToken);
    console.log('Response', response);
    // setLoading(false);
    if (response.status == 200) {
      // Store the complete data object for future use.
      // AsyncStorage.setItem('users', response.data);

      if (response?.data.length <= 3) {
        setReMember(response?.data.reverse());
      } else {
        setReMember(
          response?.data
            .slice(response?.data.length - 3, response?.data.length + 1)
            .reverse(),
        );
      }
      if (Object.keys(response?.data).length != 0) {
        // store data in context api.
        dispatch({
          type: getMembers,
          payload: response?.data.reverse(),
        });
      }
    } else {
      //   alert(response.data.title);
      setHasError(true);
      setErrorMesssage(response.data.title);
    }
  }
  async function getApplicationsCall() {
    let response = await getApplicationsAction(state?.user?.accessToken);
    console.log('Response', response);
    // setLoading(false);
    if (response.status == 200) {
      // Store the complete data object for future use.
      // AsyncStorage.setItem('users', response.data);
      if (response?.data.length <= 3) {
        setRecentApplications(response?.data.reverse());
      } else {
        setRecentApplications(
          response?.data
            .slice(response?.data.length - 3, response?.data.length + 1)
            .reverse(),
        );
      }

      if (Object.keys(response?.data).length != 0) {
        // store data in context api.
        dispatch({
          type: getApplications,
          payload: response?.data.reverse(),
        });
      }
    } else {
      //   alert(response.data.title);
      setHasError(true);
      setErrorMesssage(response.data.title);
    }
  }
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
              marginVertical: 13,
            }}>
            <View style={{flex: 0.6}}>
              <Text
                adjustsFontSizeToFit
                style={{fontSize: 24, fontWeight: 'bold'}}>
                Recent Members
              </Text>
            </View>
          </View>
          <View>
            {recentMembers.map((item, _index) => {
              return (
                <MemberListItem item={item} navigation={props.navigation} />
                // <View style={styles.card}>
                //   <View style={{flexDirection: 'row'}}>
                //     <TouchableOpacity
                //       onPress={() =>
                //         props.navigation.navigate('profile_cards', {
                //           showStatus: true,
                //           item: item,
                //         })
                //       }
                //       style={{flexDirection: 'row'}}>
                //       <View style={{marginRight: 5}}>
                //         <Icon
                //           name="account-circle"
                //           size={40}
                //           color={'lightgray'}
                //         />
                //       </View>
                //       <View>
                //         <Text style={styles.cardTitle}>
                //           {item?.firstName === null || item === null
                //             ? 'John Doe'
                //             : item?.firstName}
                //         </Text>
                //         <Text style={styles.sub}>{item.email}</Text>
                //         <Text style={styles.sub}>Community Name</Text>
                //       </View>
                //     </TouchableOpacity>
                //     <View style={{position: 'absolute', right: 0, top: 0}}>
                //       <TouchableOpacity
                //         onPress={() => {
                //           props.navigation.navigate('user_apps', {
                //             return_to_adminView: true,
                //             item: item,
                //           });
                //         }}
                //         style={{
                //           flexDirection: 'row',
                //           alignItems: 'center',
                //         }}>
                //         <Icon name="note-text" size={14} color={green} />
                //         <Text style={{marginLeft: 7}}>Applications</Text>
                //       </TouchableOpacity>
                //     </View>
                //     <View style={{position: 'absolute', right: 0, bottom: 0}}>
                //       <TouchableOpacity
                //         onPress={() =>
                //           props.navigation.navigate('feedback', {
                //             item: item,
                //             route: 'user-profile',
                //           })
                //         }
                //         style={{flexDirection: 'row', alignItems: 'center'}}>
                //         <Icon
                //           name="message-reply-text"
                //           size={14}
                //           color={green}
                //         />
                //         <Text style={{marginLeft: 7}}>Feedback</Text>
                //       </TouchableOpacity>
                //     </View>
                //   </View>
                // </View>
              );
            })}
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <View style={{flex: 1}}>
              <Text
                adjustsFontSizeToFit
                style={{fontSize: 24, fontWeight: 'bold'}}>
                Recent Applications
              </Text>
            </View>
          </View>
          <View>
            {recentApplications.map((item, _index) => {
              return (
                <View style={styles.card}>
                  <View>
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
                      }}>
                      <Text adjustsFontSizeToFit style={styles.cardTitle}>
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
                          Community:{''}
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
                    </TouchableOpacity>
                  </View>
                  <View style={{position: 'absolute', right: 10, top: 13}}>
                    <TouchableOpacity
                      onPress={() =>
                        props.navigation.navigate('feedback', {
                          item: item,
                          route: 'application',
                        })
                      }
                      style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Icon name="message-reply-text" size={14} color={green} />
                      <Text style={{marginLeft: 7}}>Feedback</Text>
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
                    {/* <View style={styles.dropdown}>
                      <Picker style={{height: 30, width: 100}} mode="dropdown">
                        <Picker.Item
                          label="Technical Training"
                          value={'TECH_TRAINING'}
                        />
                        <Picker.Item label="Diploma" value={'DIPLOMA'} />
                        <Picker.Item label="Degree" value={'DEGREE'} />
                      </Picker>
                    </View> */}
                  </View>
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
    width: Dimensions.get('screen').width / 1.78,
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
    bottom: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
});

export default AdminHome;
