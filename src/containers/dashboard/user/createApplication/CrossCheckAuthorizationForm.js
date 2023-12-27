import React, {useContext, useEffect, useState} from 'react';
import {Dimensions, ScrollView, StyleSheet, Text, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {green, primaryBGColor, textFieldBorder} from '../../../../utils/colors';
import Header from '../../../../components/Header';
import {Container, Content, Picker} from 'native-base';
// import CheckBox from '@react-native-community/checkbox';
import {CheckBox} from 'native-base';
import {AppContext} from '../../../../context/AppContext';
import Toast from 'react-native-simple-toast';
import {AlertMessages, DocumentType} from '../../../../utils/strings';
import {
  getDocumentsById,
  getDocumentsByUserId,
} from '../../../../servercalls/profile';
import {submitElCrossCheck} from '../../../../servercalls/userApplication';
import BannerNotification from '../../../../components/BannerNotification';

const CrossCheckAuthorizationForm = props => {
  const [state, dispatch] = useContext(AppContext);

  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;

  const step = 1;
  let mApplication = '';
  let nextCompleted = false;
  useEffect(() => {
    state.applicationData.map(elm => {
      console.log(elm);
      if (elm.step_id === step) {
        mApplication = elm;
      }
      if (elm.step_id === step + 1) {
        nextCompleted = elm.completed;
      }
    });
    // console.log(nextCompleted);
  }, []);

  const [consent, setConsent] = useState(false);
  const [signature, setSignature] = useState(null);
  const [signatureId, setSignatureId] = useState(null);
  const [user, setUser] = useState(state?.user?.displayName ?? '');

  // useEffect(() => {
  //   fetchDocuments();
  // }, []);

  // const fetchDocuments = async () => {
  //   let response = await getDocumentsByUserId(
  //     state?.user?.id,
  //     state?.user?.accessToken,
  //   );
  //   if (response.status === 200) {
  //     // get document one by one and store it in the respective states.
  //     response.data.map(item => {
  //       if (item.type === DocumentType.SIGNATURE) {
  //         setSignatureId(item.id);
  //       }
  //     });
  //   }
  // };

 

  // const fetchSignature = async () => {
  //   let response = await getDocumentsById(
  //     signatureId,
  //     state?.user?.accessToken,
  //   );
  //   if (response.status === 200) {
  //     // get document one by one and store it in the respective states.
  //     if (response.data) {
  //       setSignature(response.data.bytes);
  //     }
  //   }
  // };

  const createRecord = async () => {
    if (consent == false) {
      BannerNotification.show('', AlertMessages.CONSENT_VALIDATION, 'error');
    } else if (signature == null) {
      BannerNotification.show('', AlertMessages.SIGNATURE_VALIDATION, 'error');
    } else {
      const payload = {
        completedStepNumber: 1,
        isEiInfoAuthorized: true,
        userProfile: {
          id: state?.user?.id,
        },
      };
      let response = await submitElCrossCheck(
        payload,
        state?.user?.accessToken,
      );
      if (response.status === 200) {
        props.navigation.pop();
      } else {
        // alert('Unable to submit the form, please try again.');
        BannerNotification.show(
          '',
          'Unable to submit the form, please try again.',
          'error',
        );
      }
    }
  };

  return (
    <Container>
      <ScrollView keyboardShouldPersistTaps={'handled'}>
        <Header />
        <View style={styles.container}>
          <View
            style={{
              marginBottom: 25,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => props.navigation.pop()}
              style={{
                justifyContent: 'center',
              }}>
              <Icon name="arrow-left" size={30} color={green} />
            </TouchableOpacity>
            <Text style={{fontWeight: 'bold', fontSize: 22, marginLeft: 8}}>
              El Cross Check Authorization
            </Text>
          </View>
          <View style={{marginBottom: 25, marginTop: 13}}>
            <Text
              style={{
                color: green,
                fontSize: 20,
                textTransform: 'uppercase',
                lineHeight: 25,
              }}>
              Specific Authorization to exchange, obtain or release information.
            </Text>
          </View>
          <View>
            <Text style={{textAlign: 'justify', lineHeight: 25}}>
              I{' '}
              <Text
                style={{
                  textDecorationLine: 'underline',
                  paddingHorizontal: 20,
                }}>
                {' '}
                {state?.application?.userProfile === null ||
                state.application?.userProfile?.firstName === null
                  ? 'John Doe'
                  : state.application?.userProfile?.firstName}{' '}
              </Text>{' '}
              {
                'hereby authorize Lac la Ronge Indian Band Social Development to contact Service Canada at\n W-T-PPSB-STP-EI-AE-SERVICES-PRESTATIONS-DE-SERVICE-GD@servicecanada.gc.ca'
              }
            </Text>
            <Text
              style={{fontWeight: 'bold', marginVertical: 20, lineHeight: 25}}>
              To be used to determine my eligibility and/or entitlement for
              social assistance.
            </Text>
            <Text style={{marginVertical: 10, lineHeight: 25}}>
              With regard to my application or re-application for social
              assistance submitted to Social Development office, Box 480, La
              Ronge,SK. S0J 1L0
            </Text>
          </View>
          <View
            style={{flexDirection: 'row', marginVertical: 20, marginRight: 30}}>
            <CheckBox
              color={green}
              checked={isAdmin ? state.application.isEiInfoAuthorized : consent}
              onPress={() => {
                !isAdmin && mApplication.isCompleted && setConsent(!consent);
              }}
              style={styles.checkbox}
            />
            <Text style={{lineHeight: 25, textAlign: 'justify'}}>
              I understand the information transmitted or received will be
              treated as strictly confidential. Nothing in this release form
              authorizes a second party receiving information to release it or
              exchange it further without my specific permissions.{' '}
            </Text>
          </View>
          {!isAdmin && (
            <View style={{marginVertical: 10}}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={fetchSignature}>
                <Text style={styles.addbutton_text}>Add Signature</Text>
              </TouchableOpacity>
            </View>
          )}
          {
            <View
              style={{
                alignSelf: 'flex-end',
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 10,
              }}>
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                  onPress={() => props.navigation.goBack()}
                  style={{
                    width: Dimensions.get('screen').width / 2.3,
                    marginRight: 12,
                    borderRadius: 50,
                  }}>
                  <LinearGradient
                    colors={['#0B7E51', '#006940']}
                    style={styles.linearGradient}>
                    <Text
                      style={{
                        fontSize: 18,
                        color: 'white',
                        fontWeight: 'bold',
                      }}>
                      Back
                    </Text>
                    <View style={{position: 'absolute', left: 20}}>
                      <Icon name={'chevron-left'} size={25} color="white" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    state.applicationData[step].completed
                      ? props.navigation.navigate(
                          state.applicationData[step - 1].next_nav,
                        )
                      : Toast.show('Next step is incompleted ', Toast.LONG)
                  }
                  style={{
                    width: Dimensions.get('screen').width / 2.3,
                    borderRadius: 50,
                  }}>
                  <LinearGradient
                    colors={['#0B7E51', '#006940']}
                    style={styles.linearGradient}>
                    <Text
                      style={{
                        fontSize: 18,
                        color: 'white',
                        fontWeight: 'bold',
                      }}>
                      Next
                    </Text>
                    <View style={{position: 'absolute', right: 20}}>
                      <Icon name={'chevron-right'} size={25} color="white" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          }
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primaryBGColor,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: 'white',
    justifyContent: 'center',
    borderRadius: 5,
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    height: 150,
    borderColor: '#ededed',
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  cardHeading: {
    flex: 0.6,
    fontSize: 18,
    fontWeight: 'bold',
  },
  fileType: {flex: 0.4, fontSize: 12, color: 'lightgray', paddingBottom: 3},
  description: {
    fontSize: 12,
    marginTop: 3,
  },
  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    flexDirection: 'row',
    height: 55,
    width: '100%',
  },
  group: {
    marginTop: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dropdown: {
    height: 50,
    borderColor: textFieldBorder,
    borderWidth: 1,
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 5,
  },
  checkbox: {
    borderRadius: 5,
    marginLeft: -6,
    marginRight: 15,
    paddingLeft: -20,
    marginTop: 4,
  },
  addButton: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderColor: green,
    borderWidth: 1,
    borderRadius: 5,
  },
  addbutton_text: {
    fontSize: 18,
    color: green,
  },
});

export default CrossCheckAuthorizationForm;
