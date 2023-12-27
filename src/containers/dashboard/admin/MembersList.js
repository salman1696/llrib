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
import {green, primaryBGColor, textFieldBorder} from '../../../utils/colors';
import LinearGradient from 'react-native-linear-gradient';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {recentApplications, recentMembers} from '../../../assets/data/userdata';
import {Picker} from 'native-base';
import {AppContext} from '../../../context/AppContext';
import MemberListItem from '../../../components/MemberListItem';
import { getPresignedUrlToGetDocuments } from '../../../servercalls/fetchFiles';

const MembersList = props => {
  const [state, dispatch] = useContext(AppContext);
  const [profileImg, setProfileImg] = useState(''); 

  const memberList = state.users;
  useEffect(() => {
    console.log(state.users, 'usersall');
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
          isAdmin={true}
          name={state.user.displayName}
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
              <Text style={{fontSize: 24, fontWeight: 'bold'}}>Members</Text>
            </View>
          </View>
          <View>
            {memberList.map((item, index) => {
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
                //       <View style={{marginRight: 10}}>
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
                //         <Text style={{marginLeft: 7}}>Application</Text>
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
    marginBottom: 15,
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
    fontSize: 18,
  },
  label: {
    color: 'lightgray',
    fontSize: 15,
    marginBottom: 3,
  },
  sub: {
    color: 'black',
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

export default MembersList;
