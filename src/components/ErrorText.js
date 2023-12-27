import React from 'react';
import { StyleSheet, Text } from 'react-native';

const ErrorText = (props) => {
    return (
        <Text style={styles.error}>{props.error}</Text>
    )
}

const styles = StyleSheet.create({
    error: {
        color: 'red',
        fontSize: 14
    }
})

export default ErrorText;