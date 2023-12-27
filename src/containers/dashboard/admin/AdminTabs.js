import React from 'react';
import {Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import UserApplications from '../user/UserApplications';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import UserLogout from '../user/UserLogout';
import AdminHome from './AdminHome';
import MembersList from './MembersList';
import {green} from '../../../utils/colors';
import ApplicationList from './ApplicationList';
import AdminNotification from './AdminNotification';
import Settings from '../../settings/Settings';

const Tab = createBottomTabNavigator();

const AdminTabs = props => {
  return (
    <Tab.Navigator
      initialRouteName="AdminHome"
      tabBarOptions={{
        activeTintColor: green,
        style: {
          borderTopRightRadius: 25,
          borderTopLeftRadius: 25,
        },
      }}>
      <Tab.Screen
        name="user_applications"
        component={AdminHome}
        options={{
          title: 'Home',
          tabBarLabel: ({focused, color}) => (
            <Text style={{fontSize: 10, marginTop: -8, paddingBottom: 3}}>
              Home
            </Text>
          ),
          tabBarIcon: ({color, size}) => {
            return <Icon name="home" color={color} size={25} style={{}} />;
          },
        }}
      />
      <Tab.Screen
        name="member_list"
        component={MembersList}
        options={{
          title: 'Members List',
          tabBarLabel: ({focused, color}) => (
            <Text style={{fontSize: 10, marginTop: -8, paddingBottom: 3}}>
              Members
            </Text>
          ),
          tabBarIcon: ({color, size}) => {
            return (
              <Icon
                name="account-multiple-outline"
                color={color}
                size={25}
                style={{scaleX: -1}}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="applications"
        component={ApplicationList}
        options={{
          title: 'Applications',
          tabBarLabel: ({focused, color}) => (
            <Text style={{fontSize: 10, marginTop: -8, paddingBottom: 3}}>
              Applications
            </Text>
          ),
          tabBarIcon: ({color, size}) => {
            return <Icon name="format-list-checkbox" color={color} size={25} />;
          },
        }}
      />
      <Tab.Screen
        name="user_notifications"
        component={AdminNotification}
        options={{
          title: 'Home',
          tabBarLabel: ({focused, color}) => (
            <Text style={{fontSize: 10, marginTop: -8, paddingBottom: 3}}>
              Notifications
            </Text>
          ),
          tabBarIcon: ({color, size}) => {
            return <Icon name="bell" color={color} size={25} style={{}} />;
          },
        }}
      />
      <Tab.Screen
        name="admin_settings"
        component={Settings}
        options={{
          title: 'Settings',
          tabBarLabel: ({focused, color}) => (
            <Text style={{fontSize: 10, marginTop: -8, paddingBottom: 3}}>
              Settings
            </Text>
          ),
          tabBarIcon: ({color, size}) => {
            return <Icon name="cog" color={color} size={25} style={{}} />;
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
            return <Icon name="logout" color={'red'} size={25} style={{}} />;
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabs;
