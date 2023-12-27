import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ErrorToast = (props) => {
    return (
        <View style={styles.container}>
            <Text style={styles.error}>{props.error}</Text>
            <TouchableOpacity style={{}} onPress={props.onDismiss}>
                <Icon name="close" color="white" size={25} />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: 'red',
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center'
    },
    error: {
        color: 'white',
        fontSize: 14,
        flex: 1
    },
    close: {
        position: 'absolute',
        right: 10,
        top: 10,
        bottom: 0
    }
})

export default ErrorToast;
