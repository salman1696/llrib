import React, {useContext, useEffect, useState, useRef} from 'react';
import {
  Dimensions,
  ScrollView,
  Text,
  useWindowDimensions,
  ActivityIndicator,
  View,
} from 'react-native';
import Header from '../../../components/Header';
import {TabView} from 'react-native-tab-view';

import PersonalInfo from './PersonalInfo';
import AddressInfo from './AddressInfo';
import UploadDocuments from './UploadDocuments';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import EntoIcon from 'react-native-vector-icons/Entypo';
import {green, primaryBGColor} from '../../../utils/colors';
import {TouchableOpacity} from 'react-native-gesture-handler';
import EducationalInfo from './EducationalInfo';
import EmploymentHistory from './EmploymentHistory';
import BankAccount from './BankAccount';
import AssetInfo from './AssetInfo';
import Signature from './Signature';
import FamilyInfo from './FamilyInfo';
import {AppContext} from '../../../context/AppContext';
import {fetchUserProfile} from '../../../servercalls/profile';
import {setUserProfile} from '../../../utils/strings';

const renderTabBar = props => {
  var routes = props.navigationState.routes;
  var currentPos = props.navigationState.index;
  console.log('===Current index====', currentPos);
  const scrollRef = useRef();

  setTimeout(() => {
    if (scrollRef.current !== null) {
      scrollRef.current.scrollTo({
        x: (Dimensions.get('window').width / 4) * props.completedSteps,
        animated: true,
      });
      props.setScrollRef(scrollRef);
    }
  }, 500);

  var tabs = routes.map((item, index) => {
    return (
      <View
        key={index}
        style={{
          marginHorizontal: 10,
          borderBottomColor: green,
          borderBottomWidth: currentPos == item.index ? 2 : 0,
        }}>
        <TouchableOpacity
          onPress={() => {
            props.jumpTo(item.key);
          }}
          style={{flexDirection: 'row', alignItems: 'center'}}>
          {item.icon == 'graduation-cap' ? (
            <EntoIcon
              name="graduation-cap"
              size={18}
              color={currentPos == item.index ? green : 'lightgray'}
            />
          ) : item.icon == 'family-restroom' ? (
            <MatIcon
              name="family-restroom"
              size={18}
              color={currentPos == item.index ? green : 'lightgray'}
            />
          ) : (
            <Icon
              name={item.icon}
              color={currentPos == item.index ? green : 'lightgray'}
              size={17}
            />
          )}
          <Text
            style={{
              marginLeft: 5,
              fontSize: 15,
              color: currentPos == item.index ? green : 'lightgray',
            }}>
            {`${item.title}`}
          </Text>
        </TouchableOpacity>
      </View>
    );
  });

  // var tabs = routes.map((item, index) => {
  //   return (
  //     <View
  //       key={index}
  //       style={{
  //         marginHorizontal: 10,
  //         borderBottomColor: green,
  //         borderBottomWidth: currentPos == item.index ? 2 : 0,
  //       }}>
  //       <TouchableOpacity
  //         onPress={() => {
  //           if (props.completedSteps >= index) {
  //             props.jumpTo(item.key);
  //           }
  //         }}
  //         disabled={props.completedSteps >= item.index ? false : true}
  //         style={{flexDirection: 'row', alignItems: 'center'}}>
  //         {item.icon == 'graduation-cap' ? (
  //           <EntoIcon
  //             name="graduation-cap"
  //             size={18}
  //             color={index >= props.completedSteps ? green : 'lightgray'}
  //           />
  //         ) : item.icon == 'family-restroom' ? (
  //           <MatIcon
  //             name="family-restroom"
  //             size={18}
  //             color={index <= props.completedSteps ? green : 'lightgray'}
  //           />
  //         ) : (
  //           <Icon
  //             name={item.icon}
  //             color={index <= props.completedSteps ? green : 'lightgray'}
  //             size={17}
  //           />
  //         )}
  //         <Text
  //           style={{
  //             marginLeft: 5,
  //             fontSize: 15,
  //             color: index <= props.completedSteps ? green : 'lightgray',
  //           }}>
  //           {item.title}
  //         </Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // });

  return (
    <View style={{height: 35, paddingHorizontal: 9}}>
      <ScrollView
        ref={scrollRef}
        horizontal={true}
        showsHorizontalScrollIndicator={false}>
        {tabs}
      </ScrollView>
    </View>
  );
};

const defaultProfileRoutes = [
  {
    index: 0,
    key: 'personal',
    title: 'Personal Information',
    icon: 'account-outline',
  },
  {index: 1, key: 'address', title: 'Address', icon: 'home'},
  {index: 2, key: 'education', title: 'Education', icon: 'graduation-cap'},
  {
    index: 3,
    key: 'employment',
    title: 'Emyployment History',
    icon: 'briefcase',
  },
  {index: 4, key: 'bank', title: 'Bank Account', icon: 'bank'},
  {index: 5, key: 'asset', title: 'Assets', icon: 'currency-usd-circle'},
  {
    index: 6,
    key: 'familyInfo',
    title: 'Family Information',
    icon: 'family-restroom',
  },
  {index: 7, key: 'documents', title: 'Upload Documents', icon: 'upload'},
  // { index: 8, key: 'signature', title: "Signature", icon: "bank" },
];
const singleProfileRoutes = [
  {
    index: 0,
    key: 'personal',
    title: 'Personal Information',
    icon: 'account-outline',
  },
  {index: 1, key: 'address', title: 'Address', icon: 'home'},
  {index: 2, key: 'education', title: 'Education', icon: 'graduation-cap'},
  {
    index: 3,
    key: 'employment',
    title: 'Emyployment History',
    icon: 'briefcase',
  },
  {index: 4, key: 'bank', title: 'Bank Account', icon: 'bank'},
  {index: 5, key: 'asset', title: 'Assets', icon: 'currency-usd-circle'},
  {index: 7, key: 'documents', title: 'Upload Documents', icon: 'upload'},
  // { index: 8, key: 'signature', title: "Signature", icon: "bank" },
];

function UserProfileTabs(props) {
  const layout = useWindowDimensions();

  const completedSteps = props.route.params?.completedSteps;

  const [index, setIndex] = React.useState(0);
  const [state, dispatch] = useContext(AppContext);
  const [scroll, setScroll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = React.useState([]);

  console.log('==========user-detail=======', state?.profile);

  useEffect(() => {
    setTimeout(() => {
      setIndex;
      let steps = props.route.params?.completedSteps;
      if (steps > 7) {
        steps = 7;
      }
      setIndex(steps ?? 0);
    }, 1000);
  }, []);

  const setScrollRef = sc => setScroll(sc);

  const scrollToNext = step => {
    console.log('scrollToNext', scroll);
    if (scroll.current !== null) {
      scroll.current.scrollTo({
        x: (Dimensions.get('window').width / 4) * step,
        animated: true,
      });
    }
  };
  console.log('===================family=========', state?.profile);

  const fetchUserInfo = async () => {
    setLoading(true);
    try {
      const response = await fetchUserProfile(
        state?.user?.id,
        state?.user?.accessToken,
      );
      console.log('==========Profile Info=============', response);
      if (response.status == 200) {
        dispatch({
          type: setUserProfile,
          payload: response?.data,
        });
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state?.profile?.maritalStatus === 'SINGLE') {
      setRoutes(singleProfileRoutes);
    } else {
      setRoutes(defaultProfileRoutes);
    }
  }, [state?.profile?.maritalStatus]);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const _renderScene = ({route, jumpTo}) => {
    // console.log("routes", route.key);
    switch (route.key) {
      case 'personal':
        return (
          <PersonalInfo
            jumpTo={jumpTo}
            scrollToNext={scrollToNext}
            isProfileConfig={true}
          />
        );
      case 'address':
        return (
          <AddressInfo
            jumpTo={jumpTo}
            scrollToNext={scrollToNext}
            isProfileConfig={true}
          />
        );
      case 'education':
        return (
          <EducationalInfo
            jumpTo={jumpTo}
            scrollToNext={scrollToNext}
            isProfileConfig={true}
          />
        );
      case 'employment':
        return (
          <EmploymentHistory
            jumpTo={jumpTo}
            scrollToNext={scrollToNext}
            isProfileConfig={true}
          />
        );
      case 'bank':
        return (
          <BankAccount
            jumpTo={jumpTo}
            scrollToNext={scrollToNext}
            navigation={props.navigation}
            isProfileConfig={true}
          />
        );
      case 'asset':
        return (
          <AssetInfo
            jumpTo={jumpTo}
            scrollToNext={scrollToNext}
            navigation={props.navigation}
            isProfileConfig={true}
          />
        );
      case 'familyInfo':
        return (
          <FamilyInfo
            jumpTo={jumpTo}
            navigation={props.navigation}
            scrollToNext={scrollToNext}
            isProfileConfig={true}
          />
        );
      case 'documents':
        return (
          <UploadDocuments
            jumpTo={jumpTo}
            navigation={props.navigation}
            scrollToNext={scrollToNext}
            isProfileConfig={true}
          />
        );
      // case 'signature':
      //     return <Signature jumpTo={jumpTo} navigation={props.navigation} scrollToNext={scrollToNext} />
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: primaryBGColor}}>
      <Header />
      <View
        style={{
          paddingVertical: 22,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 22,
        }}>
        <Text
          style={{
            fontSize: 24,
            color: green,
            alignSelf: 'flex-start',
          }}>
          User Profile
        </Text>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <Text
            style={{
              fontSize: 18,
              color: green,
              marginHorizontal: 2,
            }}>
            {index < 8 ? index + 1 : index}
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: green,
            }}>
            /{state?.profile?.maritalStatus === 'SINGLE' ? 7 : 8}
          </Text>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={'#006940'} />
      ) : (
        <TabView
          navigationState={{index, routes}}
          renderScene={_renderScene}
          onIndexChange={setIndex}
          renderTabBar={params =>
            renderTabBar({...params, completedSteps, setScrollRef})
          }
          swipeEnabled={false}
          initialLayout={{width: Dimensions.get('screen').width}}
          lazy
        />
      )}
    </View>
  );
}

export default UserProfileTabs;
