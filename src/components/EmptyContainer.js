import React from 'react';
import {Dimensions, Image, StyleSheet, Text, View} from 'react-native';
import GlobalStyles from '../GlobalStyles';
import StyleConfig from '../StyleConfig';

const EmptyContainer = props => {
  return (
    <View
      style={[
        GlobalStyles.flexOne,
        GlobalStyles.justifyContentCenter,
        GlobalStyles.alignItemsCenter,
        {
          height: Dimensions.get('window').height / 1.4,
        },
      ]}>
      <Image
        source={require('../assets/img/No_Record_Found.png')}
        style={styles.emptyImage}
      />
      <Text style={styles.labelNoRecord}>No Record Found</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyImage: {
    width: 144,
    height: 144,
    marginBottom: StyleConfig.dimensions.margin * 0.75,
  },
  labelNoRecord: {
    fontSize: StyleConfig.fontSize.medium,
    color: StyleConfig.colors.green,
    fontWeight: 'bold',
  },
});

export default EmptyContainer;
