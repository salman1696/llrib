import React from 'react';
import { StyleSheet, View } from 'react-native';

const Card = (props) => {

    const card= {
        marginVertical: props.marginVertical ? props.marginVertical : 30,
        marginHorizontal: props.marginHorizontal ? props.marginHorizontal : 30,
        paddingHorizontal: 25,
        paddingTop: 20,
        paddingBottom: props.paddingBottom ? props.paddingBottom : 50,
        backgroundColor: 'white',
        borderColor: "lightgray",
        borderWidth: 1,
        borderRadius: 12,
        shadowColor: 'lightgray',
        shadowOffset: { width: 2, height: 10 },
        shadowOpacity: 0.3,
        elevation: 15,
        shadowRadius: 3.0,
    }

    return (
        <View style={card}>
            {props.children}
        </View>
    )
}

// const styles = StyleSheet.create({
//     card: {
//         marginVertical: 30,
//         marginHorizontal: 30,
//         paddingHorizontal: 25,
//         paddingTop: 20,
//         paddingBottom: props.paddingBottom ? props.paddingBottom : 50,
//         backgroundColor: 'white',
//         borderColor: "lightgray",
//         borderWidth: 1,
//         borderRadius: 15,
//         shadowColor: 'gray',
//         shadowOffset: { width: 2, height: 10 },
//         shadowOpacity: 0.5,
//         elevation: 20,
//         shadowRadius: 3.84,
//     },
// });

export default Card;