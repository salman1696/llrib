import React, {useContext, useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, Text} from 'react-native';
import Header from '../../../../components/Header';
import {green, primaryBGColor} from '../../../../utils/colors';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {getDetailsAction} from '../../../../servercalls/admin';
import {AppContext} from '../../../../context/AppContext';
import {
  application,
  applicationData,
  applicationsData,
} from '../../../../utils/strings';
import Toast from 'react-native-simple-toast';
import moment from 'moment';
import {getDocumentsByUserIdUser} from '../../../../servercalls/profile';
// import {CommonActions} from '@react-navigation/native';
// import {NavigationActions} from '@react-navigation';

const ApplicationSteps = props => {
  const item = props.route?.params?.item;
  const [state, dispatch] = useContext(AppContext);
  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;
  const [optionList, setOptionList] = useState(applicationData);
  const [ApplicationData, setApplicationData] = useState(null);
  const [completedSteps, setCompletedSteps] = useState('');
  console.log('ApplicationSteps', 'ApplicationSteps');
  useEffect(() => {
    if (isAdmin) {
      // fetch current user profile information from server
      getApplication();

      console.log('ApplicationSteps', 'ApplicationSteps');
    }
  }, []);

  async function getApplication() {
    let response = await getDetailsAction(
      state?.user?.accessToken,
      item.id,
      'application',
      '',
    );
    console.log('lllllllllll', response);
    // setLoading(false);
    if (response.status == 200) {
      let count = response?.data.completedStepNumber;
      setApplicationData(response?.data);
      getApplicationPreEmployment(response?.data);
      if (Object.keys(response?.data).length != 0) {
        dispatch({
          type: application,
          payload: response?.data,
        });
        // store data in context api.
      }
      setOptionList(
        optionList.map(elm => {
          if (count > 0) {
            count--;
            return {
              ...elm,
              completed: !elm.completed,
            };
          }
          return elm;
        }),
      );

      console.log(response?.data, 'Applications data by application id');
    } else {
      alert(response.data.title);
    }
  }
  async function getApplicationPreEmployment(appdata) {
    let response = await getDetailsAction(
      state?.user?.accessToken,
      item.id,
      'application',
      '/pre-employment-supports',
    );
    console.log('Response', response);

    if (response.status == 200) {
      if (Object.keys(response?.data).length != 0) {
        let value = {...appdata, emp_type: response?.data[0]};
        getApplicationEmpTraining(value);
        console.log(value, 'Applications Employment data by application id');
        dispatch({
          type: application,
          payload: value,
        });
      }
    } else {
      alert(response.data.title);
      setHasError(true);
      setErrorMesssage(response.data.title);
    }
  }
  async function getApplicationEmpTraining(appdata) {
    let response = await getDetailsAction(
      state?.user?.accessToken,
      item.id,
      'application',
      '/job-training-search-logs',
    );
    console.log('Response', response);

    if (response.status == 200) {
      if (Object.keys(response?.data).length != 0) {
        let value = {...appdata, emp_training: response?.data[0]};
        console.log(value, 'Applications Emp Training data by application id');

        dispatch({
          type: application,
          payload: value,
        });
      }
    } else {
      alert(response.data.title);
      setHasError(true);
      setErrorMesssage(response.data.title);
    }
  }

  useEffect(() => {
    if (Object.keys(optionList).length != 0) {
      // store data in context api.
      dispatch({
        type: applicationsData,
        payload: optionList,
      });
    }
  }, [optionList]);

  return (
    <ScrollView style={styles.container}>
      <Header />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 10,
          paddingHorizontal: 20,
        }}>
        <View style={{flex: 1}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 5,
            }}>
            <TouchableOpacity
              onPress={() => props.navigation.pop()}
              style={{
                marginLeft: -5,
                justifyContent: 'center',
              }}>
              <Icon name="arrow-left" size={25} color={green} />
            </TouchableOpacity>
            <Text
              adjustsFontSizeToFit
              style={{marginLeft: 5, fontSize: 20, fontWeight: 'bold'}}>
              Application for Social Assistance
            </Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <Text style={{fontSize: 14, color: 'gray', marginRight: 5}}>
                Start Date:
              </Text>
              <Text style={{fontSize: 14, color: 'gray'}}>
                {' '}
                {moment.utc(application.startedOn).format('YYYY-MM-DD')}
              </Text>
            </View>
            {props.route &&
              props.route.params &&
              props.route?.params?.status == 'in-progress' && (
                <View style={{}}>
                  <View
                    adjustsFontSizeToFit
                    style={{
                      ...styles.statusContainer,
                      backgroundColor: '#FCF0D3',
                    }}>
                    <Text
                      adjustsFontSizeToFit
                      style={{
                        color: '#EFB321',
                        textTransform: 'capitalize',
                        fontSize: 10,
                      }}>
                      In Progress
                    </Text>
                  </View>
                </View>
              )}
          </View>
        </View>
      </View>
      <View style={{paddingHorizontal: 20, paddingVertical: 20}}>
        {optionList.map(elm => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              if (isAdmin) {
                elm.completed
                  ? props.navigation.navigate('ApplicationStack', {
                      screen: elm.nav,
                      item: {item: item},
                    })
                  : // props.navigation.navigate(elm.nav)
                    Toast.show('This step is incompleted ', Toast.LONG);
              } else {
                props.navigation.navigate('cross_check');
              }
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {elm.completed && (
                <Icon
                  name="check-circle-outline"
                  size={25}
                  style={{right: 5}}
                  color={elm.completed ? green : 'black'}
                />
              )}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: elm.completed ? green : 'black',
                }}>
                {elm.name}
              </Text>
            </View>
            <View style={{position: 'absolute', right: 20}}>
              <Icon
                name="chevron-right"
                size={25}
                color={elm.completed ? green : 'black'}
              />
            </View>
          </TouchableOpacity>
        ))}

        {/* <TouchableOpacity
          style={styles.card}
          onPress={() => props.navigation.navigate('pre_employment')}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {ApplicationData.isEiInfoAuthorized && (
              <Icon
                name="check-circle-outline"
                size={25}
                style={{right: 5}}
                color={ApplicationData.isEiInfoAuthorized ? green : 'black'}
              />
            )}
            <Text style={{fontSize: 16, fontWeight: 'bold'}}>
              Pre-Employment Supports
            </Text>
          </View>
          <View style={{position: 'absolute', right: 20}}>
            <Icon
              name="chevron-right"
              size={25}
              color={ApplicationData.isEiInfoAuthorized ? green : 'black'}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => props.navigation.navigate('exempted_income')}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {ApplicationData.isEiInfoAuthorized && (
              <Icon
                name="check-circle-outline"
                size={25}
                style={{right: 5}}
                color={ApplicationData.isEiInfoAuthorized ? green : 'black'}
              />
            )}
            <Text style={{fontSize: 16, fontWeight: 'bold'}}>
              Exempted Income
            </Text>
          </View>
          <View style={{position: 'absolute', right: 20}}>
            <Icon
              name="chevron-right"
              size={25}
              color={ApplicationData.isEiInfoAuthorized ? green : 'black'}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => props.navigation.navigate('other_support')}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {ApplicationData.isEiInfoAuthorized && (
              <Icon
                name="check-circle-outline"
                size={25}
                style={{right: 5}}
                color={ApplicationData.isEiInfoAuthorized ? green : 'black'}
              />
            )}
            <Text style={{fontSize: 16, fontWeight: 'bold'}}>
              Other Supports
            </Text>
          </View>
          <View style={{position: 'absolute', right: 20}}>
            <Icon
              name="chevron-right"
              size={25}
              color={ApplicationData.isEiInfoAuthorized ? green : 'black'}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => props.navigation.navigate('residency_declaration')}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {ApplicationData.isEiInfoAuthorized && (
              <Icon
                name="check-circle-outline"
                size={25}
                style={{right: 5}}
                color={ApplicationData.isEiInfoAuthorized ? green : 'black'}
              />
            )}
            <Text style={{fontSize: 16, fontWeight: 'bold'}}>
              On-Reserve Residence Declaration
            </Text>
          </View>
          <View style={{position: 'absolute', right: 20}}>
            <Icon
              name="chevron-right"
              size={25}
              color={ApplicationData.isEiInfoAuthorized ? green : 'black'}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => props.navigation.navigate('employment_training')}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {ApplicationData.isEiInfoAuthorized && (
              <Icon
                name="check-circle-outline"
                size={25}
                style={{right: 5}}
                color={ApplicationData.isEiInfoAuthorized ? green : 'black'}
              />
            )}
            <Text style={{fontSize: 16, fontWeight: 'bold'}}>
              Employment and Training Search
            </Text>
          </View>
          <View style={{position: 'absolute', right: 20}}>
            <Icon
              name="chevron-right"
              size={25}
              color={ApplicationData.isEiInfoAuthorized ? green : 'black'}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => props.navigation.navigate('employment_separation')}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {ApplicationData.isEiInfoAuthorized && (
              <Icon
                name="check-circle-outline"
                size={25}
                style={{right: 5}}
                color={ApplicationData.isEiInfoAuthorized ? green : 'black'}
              />
            )}
            <Text style={{fontSize: 16, fontWeight: 'bold'}}>
              Unemployability
            </Text>
          </View>
          <View style={{position: 'absolute', right: 20}}>
            <Icon
              name="chevron-right"
              size={25}
              color={ApplicationData.isEiInfoAuthorized ? green : 'black'}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => props.navigation.navigate('client_consent')}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {ApplicationData.isEiInfoAuthorized && (
              <Icon
                name="check-circle-outline"
                size={25}
                style={{right: 5}}
                color={ApplicationData.isEiInfoAuthorized ? green : 'black'}
              />
            )}
            <Text style={{fontSize: 16, fontWeight: 'bold'}}>
              Client Consent Form
            </Text>
          </View>
          <View style={{position: 'absolute', right: 20}}>
            <Icon
              name="chevron-right"
              size={25}
              color={ApplicationData.isEiInfoAuthorized ? green : 'black'}
            />
          </View>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: primaryBGColor},
  card: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    borderRadius: 5,
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 30,
    minHeight: 50,
    borderColor: '#ededed',
    borderWidth: 1,
    marginBottom: 8,
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
    marginBottom: 10,
  },
  statusContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
});

export default ApplicationSteps;
