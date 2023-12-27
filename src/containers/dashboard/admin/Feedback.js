import React, {useContext, useEffect} from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  Switch,
  View,
  TextInput,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {green, primaryBGColor, textFieldBorder} from '../../../utils/colors';
import {Container, Picker} from 'native-base';
import {useState} from 'react';
import Header from '../../../components/Header';
import {AppContext} from '../../../context/AppContext';
import {useMemo} from 'react';
import {createCommnet, getDetailsAction} from '../../../servercalls/admin';
import Toast from 'react-native-simple-toast';
import BannerNotification from '../../../components/BannerNotification';

const Feedback = props => {
  const item = props.route.params.item;
  const isUserProfile =
    props.route.params.route === 'user-profile' ? true : false;

  console.log(item, 'item parmas');
  const [state, dispatch] = useContext(AppContext);
  const isAdmin = state.user.role === 'ROLE_ADMIN' ? true : false;

  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  let commentFor = isUserProfile ? {id: item?.id} : {id: item?.userProfile.id};
  let commentBy = {id: state?.user?.id};
  let applicationFor = isUserProfile ? '' : {id: item?.id};

  useEffect(() => {
    fetchComment(commentFor);
  }, []);

  async function submitComment(comment) {
    let response = await createCommnet(
      state?.user?.accessToken,
      comment,
      new Date(),
      'PROFILE',
      commentFor,
      commentBy,
      applicationFor,
    );
    console.log('Response', response);
    // setLoading(false);
    if (response.status == 200) {
      // Store the complete data object for future use.
      // AsyncStorage.setItem('users', response.data);
      setComment('');
      fetchComment(commentFor);
      Toast.show('Comment submitted successfully ', Toast.LONG);
      console.log(response.data, 'Comment response');
    } else {
      // alert(response.data.title);
      BannerNotification.show('', response?.data?.title, 'error');
    }
  }
  async function fetchComment(id) {
    let response = await getDetailsAction(
      state?.user?.accessToken,
      item.id,
      isUserProfile ? 'user-profile' : 'application',
      '/comments',
    );
    console.log('Response', response);
    // setLoading(false);
    if (response.status == 200) {
      // Store the complete data object for future use.
      // AsyncStorage.setItem('users', response.data);
      setComments(response.data);

      console.log(response.data, 'fetch Comments response');
    } else {
      alert(response.data.title);
      setHasError(true);
      setErrorMesssage(response.data.title);
    }
  }

  return (
    <>
      <Container>
        <Header />
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => props.navigation.pop()}
            style={{width: 50, marginLeft: -15, justifyContent: 'center'}}>
            <Icon name="chevron-left" size={40} color={'black'} />
          </TouchableOpacity>
          <View
            style={{
              marginVertical: 20,
              flexDirection: 'row',
              alignItems: 'flex-end',
            }}>
            <Text style={{flex: 1, fontWeight: 'bold', fontSize: 22}}>
              Feedback
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 10,
              }}>
              <Icon name="account-circle" size={30} color={'lightgray'} />
              <Text style={{color: 'black'}}>
                {item?.firstName !== null && item?.userProfile === undefined
                  ? item?.firstName
                  : item?.userProfile === undefined && 'John Doe'}
                {item?.userProfile !== undefined &&
                  (item?.userProfile.firstName !== null
                    ? `${item?.userProfile.firstName}`
                    : 'John Doe')}
              </Text>
            </View>
          </View>
          <View style={styles.card}>
            <Text style={{color: 'black', fontWeight: 'bold'}}>Comments</Text>
            <ScrollView>
              <View style={{minHeight: 30}}>
                {comments?.map(item => (
                  <View style={{marginBottom: 10, flex: 1}}>
                    <Text style={{color: green, fontSize: 14}}>Admin</Text>
                    <Text style={{fontSize: 10}}>{item?.comment}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            <View
              style={{
                backgroundColor: '#EBEFF2',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 15,
                borderRadius: 5,
              }}>
              <TextInput
                style={{flex: 1}}
                placeholder={'Write a comment'}
                value={comment}
                onChangeText={text => {
                  setComment(text);
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  if (comment != '') {
                    submitComment(comment);

                    // var items = [...comments];
                    // items.push(comment);
                    // setComment('');
                    // setComments(items);
                  }
                }}
                style={{
                  padding: 7,
                  justifyContent: 'flex-end',
                  alignSelf: 'flex-end',
                }}>
                <Icon name="send" size={26} color={green} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Container>
    </>
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
    minHeight: '10%',
    maxHeight: '60%',
    paddingVertical: 10,
    paddingHorizontal: 15,
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
  textArea: {
    borderColor: textFieldBorder,
    borderWidth: 1,
    marginTop: 7,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 5,
    height: 100,
    textAlignVertical: 'top',
  },
  cardHeading: {
    flex: 0.85,
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileType: {flex: 0.2, fontSize: 12, color: 'lightgray', paddingBottom: 3},
  description: {
    fontSize: 12,
    marginTop: 3,
  },
  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    flexDirection: 'row',
    height: 60,
    // width: '100%',
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
    borderColor: textFieldBorder,
    borderWidth: 1,
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 5,
  },
});

export default Feedback;
