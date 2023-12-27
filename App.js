/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';

import React, {useContext, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {StyleProvider} from 'native-base';
import getTheme from './src/native-base-theme/components';
import material from './src/native-base-theme/variables/material';
import Login from './src/containers/auth/Login';
import Splash from './src/containers/Splash';
import {AppContext, AppProvider} from './src/context/AppContext';
import Signup from './src/containers/auth/Signup';
import UserProfileTabs from './src/containers/user/profile/UserProfileTabs';
import AddressInfo from './src/containers/user/profile/AddressInfo';
import UploadDocuments from './src/containers/user/profile/UploadDocuments';
import UserTabs from './src/containers/dashboard/user/UserTabs';
import ApplicationSteps from './src/containers/dashboard/user/createApplication/ApplicationSteps';
import ResidencyDeclarationForm from './src/containers/dashboard/user/createApplication/ResidencyDeclarationForm';
import EmploymentSeparationForm from './src/containers/dashboard/user/createApplication/EmploymentSeparationForm';
import CrossCheckAuthorizationForm from './src/containers/dashboard/user/createApplication/CrossCheckAuthorizationForm';
import ClientConsentForm from './src/containers/dashboard/user/createApplication/ClientConsentForm';
import PreEmploymentForm from './src/containers/dashboard/user/createApplication/PreEmploymentForm';
import EmploymentTrainingForm from './src/containers/dashboard/user/createApplication/EmploymentTrainingForm';
import OtherSupportForm from './src/containers/dashboard/user/createApplication/OtherSupportForm';
import ExemptedIncomeForm from './src/containers/dashboard/user/createApplication/ExemptedIncomeForm';
import ResetPassword from './src/containers/auth/ResetPassword';
import VerificationCode from './src/containers/auth/VerificationCode';
import UpdatePassword from './src/containers/auth/UpdatePassword';
import AdminTabs from './src/containers/dashboard/admin/AdminTabs';
import Settings from './src/containers/settings/Settings';
import ApplicationCards from './src/containers/dashboard/user/ApplicationCards';
import ProfileCards from './src/containers/dashboard/admin/ProfileCards';
import AdminProfile from './src/containers/dashboard/admin/AdminProfile';
import Feedback from './src/containers/dashboard/admin/Feedback';
import UserProfileView from './src/containers/dashboard/user/UserProfileView';
import PersonalInfo from './src/containers/user/profile/PersonalInfo';
import EducationalInfo from './src/containers/user/profile/EducationalInfo';
import EmploymentHistory from './src/containers/user/profile/EmploymentHistory';
import BankAccount from './src/containers/user/profile/BankAccount';
import AssetInfo from './src/containers/user/profile/AssetInfo';
import FamilyInfo from './src/containers/user/profile/FamilyInfo';
import UserApplications from './src/containers/dashboard/user/UserApplications';
import {
  AsyncStorage,
  Image,
  ImageBackground,
  StyleSheet,
  View,
} from 'react-native';
import Steps from './src/containers/dashboard/user/createUserApplication/Steps';
import ResidencyDeclaration from './src/containers/dashboard/user/createUserApplication/ResidencyDeclaration';
import EmploymentForm from './src/containers/dashboard/user/createUserApplication/EmploymentForm';
import ElCrossCheck from './src/containers/dashboard/user/createUserApplication/El-CrossCheck';
import PreEmployment from './src/containers/dashboard/user/createUserApplication/PreEmployment';
import TrainingForm from './src/containers/dashboard/user/createUserApplication/TrainingForm';
import SupportForm from './src/containers/dashboard/user/createUserApplication/SupportForm';
import IncomeForm from './src/containers/dashboard/user/createUserApplication/IncomeForm';
import ConsentForm from './src/containers/dashboard/user/createUserApplication/ConsentForm';
import {setUser, primaryBGColor, Routes} from './src/utils/strings';

const Stack = createStackNavigator();
const AppStack = createStackNavigator();
const AuthStack = createStackNavigator();

const ApplicationStack = ({}) => (
  <AppStack.Navigator
    headerMode={'none'}
    initialRouteName={Routes.ADMIN_CROSS_CHECK}>
    <AppStack.Screen
      name={Routes.ADMIN_RESIDENCY_DECLARATION}
      component={ResidencyDeclarationForm}
    />
    <AppStack.Screen
      name={Routes.ADMIN_EMPLOYEMENT_SEPARATION}
      component={EmploymentSeparationForm}
    />
    <AppStack.Screen
      name={Routes.ADMIN_CROSS_CHECK}
      component={CrossCheckAuthorizationForm}
    />
    <AppStack.Screen
      name={Routes.ADMIN_PRE_EMPLOYMENT}
      component={PreEmploymentForm}
    />
    <AppStack.Screen
      name={Routes.ADMIN_EMPLOYMENT_TRAINING}
      component={EmploymentTrainingForm}
    />
    <AppStack.Screen
      name={Routes.ADMIN_OTHER_SUPPORT}
      component={OtherSupportForm}
    />
    <AppStack.Screen
      name={Routes.ADMIN_EXEMPT_INCOME}
      component={ExemptedIncomeForm}
    />
    <AppStack.Screen
      name={Routes.ADMIN_CLIENT_CONSENT}
      component={ClientConsentForm}
    />
  </AppStack.Navigator>
);
const AuthenticationStack = () => (
  <AuthStack.Navigator headerMode={'none'} initialRouteName={Routes.LOGIN}>
    <AuthStack.Screen name={Routes.LOGIN} component={Login} />
    <AuthStack.Screen name={Routes.SIGNUP} component={Signup} />
    <AuthStack.Screen name={Routes.RESET_PASSWORD} component={ResetPassword} />
    <AuthStack.Screen name={Routes.VERIFICATION} component={VerificationCode} />
    <AuthStack.Screen
      name={Routes.UPDATE_PASSWORD}
      component={UpdatePassword}
    />
  </AuthStack.Navigator>
);

const AppNavigator = () => {
  const [state, dispatch] = useContext(AppContext);
  const [isLoginAdmin, setIsLoginAdmin] = useState(false);
  const [isLoginUser, setIsLoginUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(async () => {
      const isAdmin = await AsyncStorage.getItem('admin');

      const isUser = await AsyncStorage.getItem('user');

      console.log(isAdmin);
      if (isAdmin !== null) {
        setIsLoginAdmin(
          JSON.parse(isAdmin).accessToken.length !== '' ? true : false,
        );
        JSON.parse(isAdmin).accessToken.length !== '' &&
          dispatch({
            type: setUser,
            payload: JSON.parse(isAdmin),
          });
        setLoading(false);
      } else if (isUser !== null) {
        setIsLoginUser(
          JSON.parse(isUser).accessToken.length !== '' ? true : false,
        );
        JSON.parse(isUser).accessToken.length !== '' &&
          dispatch({
            type: setUser,
            payload: JSON.parse(isUser),
          });
        setLoading(false);
      } else {
        setLoading(false);
      }
    }, 500);
  }, [loading, dispatch]);

  if (loading) {
    return (
      <View style={styles.container} keyboardShouldPersistTaps={'handled'}>
        <ImageBackground
          source={require('./src/assets/img/header.png')}
          style={styles.bgContainer}
        />
        <Image
          source={require('./src/assets/img/splash_logo.png')}
          resizeMode={'contain'}
          style={styles.logo}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        headerMode="none"
        initialRouteName={
          isLoginAdmin ? Routes.ADMIN_DASHBOARD : Routes.AUTHENTICATE_STACK_NAV
        }>
        <Stack.Screen
          name={Routes.AUTHENTICATE_STACK_NAV}
          component={AuthenticationStack}
        />

        <Stack.Screen
          name={Routes.USER_PROFILE_TABS}
          component={UserProfileTabs}
        />
        <Stack.Screen
          name={Routes.USER_APPLICATIONS}
          component={UserApplications}
        />
        <Stack.Screen name={Routes.USER_DASHBOARD} component={UserTabs} />
        <Stack.Screen
          name={Routes.ADMIN_APPLICATION_STEPS}
          component={ApplicationSteps}
        />
        <Stack.Screen
          name={Routes.ADMIN_APPLICATION_STACK_NAV}
          component={ApplicationStack}
        />

        <Stack.Screen name={Routes.USER_APPLICATION_STEPS} component={Steps} />
        <Stack.Screen
          name={Routes.USER_RESIDENCY_DECLARATION}
          component={ResidencyDeclaration}
        />
        <Stack.Screen
          name={Routes.USER_EMPLOYEMENT_SEPARATION}
          component={EmploymentForm}
        />
        <Stack.Screen name={Routes.USER_CROSS_CHECK} component={ElCrossCheck} />
        <Stack.Screen
          name={Routes.USER_PRE_EMPLOYMENT}
          component={PreEmployment}
        />
        <Stack.Screen
          name={Routes.USER_EMPLOYMENT_TRAINING}
          component={TrainingForm}
        />
        <Stack.Screen
          name={Routes.USER_OTHER_SUPPORT}
          component={SupportForm}
        />
        <Stack.Screen name={Routes.USER_EXEMPT_INCOME} component={IncomeForm} />
        <Stack.Screen
          name={Routes.USER_CLIENT_CONSENT}
          component={ConsentForm}
        />

        <Stack.Screen name={Routes.ADMIN_DASHBOARD} component={AdminTabs} />
        <Stack.Screen
          name={Routes.USER_APPLICATION_CARDS}
          component={ApplicationCards}
        />
        <Stack.Screen
          name={Routes.USER_PROFILE_CARDS}
          component={ProfileCards}
        />
        <Stack.Screen name={Routes.ADMIN_PROFILE} component={AdminProfile} />
        <Stack.Screen name={Routes.ADMIN_FEEDBACK} component={Feedback} />
        <Stack.Screen name={Routes.USER_PROFILE} component={UserProfileView} />
        <Stack.Screen name={Routes.USER_PROFILE_TAB} component={PersonalInfo} />
        <Stack.Screen name={Routes.USER_ADDRESS_TAB} component={AddressInfo} />
        <Stack.Screen
          name={Routes.USER_DOCUMENT_TAB}
          component={UploadDocuments}
        />
        <Stack.Screen
          name={Routes.USER_EDUCATION_TAB}
          component={EducationalInfo}
        />
        <Stack.Screen
          name={Routes.USER_EMPLOYMENT_TAB}
          component={EmploymentHistory}
        />
        <Stack.Screen name={Routes.USER_BANK_TAB} component={BankAccount} />
        <Stack.Screen name={Routes.USER_ASSET_TAB} component={AssetInfo} />
        <Stack.Screen name={Routes.USER_FAMILT_TAB} component={FamilyInfo} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <StyleProvider style={getTheme(material)}>
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </StyleProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primaryBGColor,
    justifyContent: 'center',
  },
  bgContainer: {
    width: '100%',
    height: 130,
    position: 'absolute',
    top: 0,
  },
  logo: {
    width: '100%',
    height: 130,
    alignSelf: 'center',
    justifyContent: 'center',
  },
});

export default App;
// "react-native-fbsdk": "^3.0.0",
// "@react-native-community/google-signin": "^5.0.0",
