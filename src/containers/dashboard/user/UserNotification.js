import {useIsFocused} from '@react-navigation/native';
import moment from 'moment';
import {Container} from 'native-base';
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
} from 'react-native';
import Header from '../../../components/Header';
import {AppContext} from '../../../context/AppContext';
import {
  getNotificationByUserId,
  markedAsViewNotification,
} from '../../../servercalls/user';

const UserNotification = props => {
  const [state, dispatch] = useContext(AppContext);
  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;
  const [notiList, setNotiList] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isAdmin) {
      getNotifications();
    }
  }, [isFocused]);

  async function getNotifications() {
    let response = await getNotificationByUserId(
      state?.user?.id,
      state?.user?.accessToken,
    );
    console.log('Response', response);
    if (response.status == 200) {
      console.log(response?.data, 'Notifications data by user id');
      setNotiList(response.data?.reverse());
    } else {
      alert(response.data.title);
    }
  }
  async function markedAsViewied(notiId) {
    let params = {
      id: notiId,
      isViewedOnMobile: true,
      user: {
        id: state.user?.id,
      },
    };
    console.log(params, notiId, state?.user?.accessToken);
    let response = await markedAsViewNotification(
      params,
      notiId,
      state?.user?.accessToken,
    );
    console.log('Response', response);
    if (response.status == 200) {
      console.log(response?.data, 'Notification set as viewed');

      getNotifications();
    } else {
      alert(response.data.title);
    }
  }

  useEffect(() => {
    if(!isFocused && notiList?.filter(notification => notification?.isViewedOnMobile === false)?.length > 0) {
        notificationView();
    }
  }, [notiList, isFocused]);



  const notificationView = () => {
    notiList?.forEach((element) => {
      if (!element.isViewedOnMobile) {
        markedAsViewied(element.id);
      }
    });
  };

  return (
    <Container>
      <ScrollView>
        <Header />
        <View style={styles.container}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 15,
            }}>
            <View style={{flex: 0.6}}>
              <Text style={{fontSize: 24, fontWeight: 'bold'}}>
                Notifications
              </Text>
            </View>
          </View>
          <View
            style={{
              marginVertical: 10,
              borderBottomColor: 'lightgray',
              // borderBottomWidth: 1,
              paddingBottom: 20,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
              }}>
              <Text style={{fontSize: 20, marginRight: 8}}>New</Text>
              <View
                style={{
                  minWidth: 30,
                  height: 30,
                  paddingHorizontal: 8,
                  backgroundColor: '#D7E7E1',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 30,
                }}>
                <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                  {
                    notiList?.filter(item => item.isViewedOnMobile === false)
                      .length
                  }
                </Text>
              </View>
            </View>
            {notiList?.filter(item => item.isViewedOnMobile === false)?.map(item => {
              return (
                <View
                  key={item.id}
                  onPress={() => markedAsViewied(item.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginVertical: 15,
                  }}>
                  <View style={{padding: 5, marginRight: 10, marginTop: 5}}>
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 35,
                        backgroundColor: !item.isViewedOnMobile
                          ? 'dimgrey'
                          : 'lightgray',
                      }}></View>
                  </View>
                  <View>
                    <Text style={styles.title}>{item?.details}</Text>
                    <Text style={styles.sub}>{item?.title}</Text>
                    <View style={styles.timeStamp}>
                      <Text style={styles.sub}>
                        {moment(item?.notificationOn).fromNow()}
                      </Text>
                    </View>
                  </View>
               </View>
              );
            })}
               <View style={{marginVertical: 10, borderBottomColor: 'lightgray', borderBottomWidth: 1, 
                           paddingBottom: 20}}>
                        <View style={{flexDirection: 'row', alignItems:'center', marginBottom: 10}}>
                            <Text style={{fontSize: 20, marginRight: 8}}>Earlier</Text>
                            <View
                            style={{
                            minWidth: 30,
                            height: 30,
                            paddingHorizontal: 8,
                            backgroundColor: '#D7E7E1',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 30,
                            }}>
                            <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                            {
                                notiList?.filter(item => item.isViewedOnMobile === true)
                                .length
                            }
                            </Text>
                        </View>
                        </View>
                        {notiList?.filter(item => item.isViewedOnMobile === true)?.map(item => {
                        return (
                            <View
                            key={item.id}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                marginVertical: 15,
                            }}>
                            <View style={{padding: 5, marginRight: 10, marginTop: 5}}>
                                <View
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 35,
                                    backgroundColor: !item.isViewedOnMobile
                                    ? 'dimgrey'
                                    : 'lightgray',
                                }}></View>
                            </View>
                            <View>
                                <Text style={styles.title}>{item?.details}</Text>
                                <Text style={styles.sub}>{item?.title}</Text>
                                <View style={styles.timeStamp}>
                                <Text style={styles.sub}>
                                    {moment(item?.notificationOn).fromNow()}
                                </Text>
                                </View>
                            </View>
                        </View>
                        );
                        })}
                    </View>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  sub: {
    color: 'gray',
    fontSize: 12,
  },
  timeStamp: {
    width: "94%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 10,
    marginTop: 5,
  }
});

export default UserNotification;
