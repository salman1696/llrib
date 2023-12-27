import React from 'react';
import {Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import UserApplications from './UserApplications';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import UserLogout from './UserLogout';
import UserNotification from './UserNotification';
import Settings from '../../settings/Settings';
import {green} from '../../../utils/colors';
import {useContext} from 'react';
import {AppContext} from '../../../context/AppContext';
import {SettingView} from '../../../utils/strings';

const Tab = createBottomTabNavigator();

const UserTabs = props => {
  const [state, dispatch] = useContext(AppContext);

  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: green,
        style: {
          borderTopRightRadius: 25,
          borderTopLeftRadius: 25,
        },
      }}
      lazy>
      <Tab.Screen
        name="user_applications"
        component={UserApplications}
        options={{
          title: 'Home',
          tabBarLabel: ({focused, color}) => (
            <Text style={{fontSize: 10, marginTop: -8, paddingBottom: 3}}>
              Home
            </Text>
          ),
          tabBarIcon: ({color, size}) => {
            return <Icon name="home" color={color} size={26} style={{}} />;
          },
        }}
      />
      <Tab.Screen
        name="user_notifications"
        component={UserNotification}
        options={{
          title: 'Home',
          tabBarLabel: ({focused, color}) => (
            <Text style={{fontSize: 10, marginTop: -8, paddingBottom: 3}}>
              Notifications
            </Text>
          ),
          tabBarIcon: ({color, size}) => {
            return <Icon name="bell" color={color} size={26} style={{}} />;
          },
        }}
      />
      <Tab.Screen
        name="user_settings"
        component={Settings}
        options={{
          title: 'Home',
          tabBarLabel: ({focused, color}) => (
            <Text style={{fontSize: 10, marginTop: -8, paddingBottom: 3}}>
              Settings
            </Text>
          ),
          tabBarIcon: ({color, size}) => {
            return <Icon name="cog" color={color} size={26} style={{}} />;
          },
        }}
      />
      <Tab.Screen
        name="user_logout"
        component={UserLogout}
        options={{
          title: 'Home',
          tabBarLabel: ({focused, color}) => (
            <Text style={{fontSize: 10, marginTop: -8, paddingBottom: 3}}>
              Logout
            </Text>
          ),
          tabBarIcon: ({color, size}) => {
            return <Icon name="logout" color={'red'} size={26} style={{}} />;
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default UserTabs;
