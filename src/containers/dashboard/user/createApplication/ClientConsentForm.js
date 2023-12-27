import React, {useContext, useState} from 'react';
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
import {useEffect} from 'react/cjs/react.development';
import Toast from 'react-native-simple-toast';
import moment from 'moment';

const ClientConsentForm = props => {
  const [state, dispatch] = useContext(AppContext);
  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;
  const user_name =
    state.application.userProfile === null ||
    state.application.userProfile.firstName === null
      ? 'John Doe'
      : state.application.userProfile.firstName;

  const step = 8;
  let mApplication = '';
  useEffect(() => {
    setConsent(state?.application?.isConsented);
    state.applicationData.map(elm => {
      if (elm.step_id === step) {
        mApplication = elm;
      }
    });
    // console.log(mApplication);
  }, []);

  const [consent, setConsent] = useState(false);

  return (
    <Container>
      <ScrollView
        keyboardShouldPersistTaps={'handled'}
        contentContainerStyle={{}}>
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
              <Icon name="arrow-left" size={25} color={green} />
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                marginLeft: 5,
                fontWeight: 'bold',
                fontSize: 22,
              }}>
              Client Consent Form
            </Text>
          </View>
          <View>
            <Text
              style={{
                marginVertical: 10,
                fontSize: 14,
                lineHeight: 25,
                textAlign: 'justify',
              }}>
              I give my consent to authorize Lac La Ronge Indian Band Social
              Development department to obtain any information from any person,
              agency or organization to determine and/or verify my eligibility
              for benefits or service under the Income Assistance Program. I
              understand that this authorization includes information such as
              source and amount of my needs, income, financial resources,
              assets, employment records, marital status, medical records, and
              living arrangements of myself or family members sand amount of
              benefits or my entitlement to benefits under other programs. I
              understand examples include, but are not restricted to,
              information or documents from: Maintenance Enforcement, Human
              Resources and Skill Development Canada (Employment Insurance),
              Workers' Compensation Board, Saskatchewan Government Insurance,
              Saskatchewan Social Services, Provincial Training Allowance, any
              bank, credit union or other financial institution, any landlord
              and current and past employers.
            </Text>
          </View>
          <View
            style={{flexDirection: 'row', marginVertical: 20, marginRight: 30}}>
            <CheckBox
              color={green}
              checked={consent}
              onPress={() => {
                setConsent(!consent);
              }}
              style={styles.checkbox}
            />
            <Text style={{lineHeight: 25, fontSize: 14, textAlign: 'justify'}}>
              I also understand that it is my responsibility to inform the Lac
              La Ronge Indian Band Social Development immediately of any changes
              whatsoever in the information provided. I understand that it is a
              serious matter to provide fake information and/or fail to report
              any changes in the information provided. I declare that all the
              information provided is true and complete and I make this solemn
              declaration believing it to be true and knowing that it is of the
              same force and effect as if made by any oath. I understand that I
              have the right to appeal any decision made with respect to my
              application for income assistance.
            </Text>
          </View>
          <View style={{flexDirection: 'row', marginBottom: 10}}>
            <Text style={{fontWeight: 'bold', fontSize: 16, marginRight: 10}}>
              Name:
            </Text>
            <Text style={{fontWeight: 'bold', fontSize: 16}}>{user_name}</Text>
          </View>
          <View style={{flexDirection: 'row', marginBottom: 20}}>
            <Text style={{fontWeight: 'bold', fontSize: 16, marginRight: 20}}>
              Date:
            </Text>
            <Text style={{fontWeight: 'bold', fontSize: 16}}>
              {moment.utc(state?.application.startedOn).format('YYYY-MM-DD')}
            </Text>
          </View>
          <View style={{marginVertical: 10}}>
            <TouchableOpacity style={styles.addButton} onPress={() => {}}>
              <Text style={styles.addbutton_text}>
                {!isAdmin ? 'Add Signature' : 'Signature'}
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() =>
                  props.navigation.navigate(
                    state.applicationData[step - 1]?.back_nav,
                  )
                }
                style={{
                  width: Dimensions.get('screen').width / 2.3,
                  marginRight: 12,
                  borderRadius: 50,
                }}>
                <LinearGradient
                  colors={['#0B7E51', '#006940']}
                  style={styles.linearGradient}>
                  <Text
                    style={{fontSize: 18, color: 'white', fontWeight: 'bold'}}>
                    Back
                  </Text>
                  <View style={{position: 'absolute', left: 20}}>
                    <Icon name={'chevron-left'} size={25} color="white" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              {!isAdmin && (
                <TouchableOpacity
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
                      Submit
                    </Text>
                    <View style={{position: 'absolute', right: 20}}>
                      <Icon name={'chevron-right'} size={25} color="white" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
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

export default ClientConsentForm;
