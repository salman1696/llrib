import React from 'react';
import { View, StyleSheet } from 'react-native';
import { green } from '../utils/colors';

const Header = (props) => {
    return (
        <View>
            <View style={styles.greenContainer}>
                
            </View>
            <View style={styles.whiteContainer}>
                <View style={styles.whiteCircle}>

                </View>
                <View style={{width: '50%', height: 100, backgroundColor:'blue', position:'absolute',
            right: 0, bottom: 0}}>

                </View>
            </View>
            {/* <View style={{width: '50%', position: 'absolute', right: -50, top: 60}}>
                <View style={styles.greenCircle}>

                 </View>
            </View> */}
        </View>
    )
}

const styles = StyleSheet.create({
    greenContainer: {
        width: "100%",
        height: 130,
        backgroundColor: green,
    },
    curvedLine: {
        width: "20%",
        height: 100,
        position: "absolute",
        bottom: -10,
        left: "40%",
        borderBottomRightRadius: 35,
        backgroundColor: "white",
        transform: [{ scaleX: 5 }, { scaleY: 1 }],
    },
    whiteContainer: {
        width: '100%',
        height: 100,
        backgroundColor: "white",
        position: 'absolute',
        bottom: -80
    },
    whiteCircle: {
        backgroundColor: 'white',
        width:  "30%",
        height: 100,
        borderRadius: 50,
        position: 'absolute',
        top: -70,
        left: -60,
        transform: [{ rotate: '10.5deg'}, { scaleX: 4.2}, { scaleY: 1.65}],
    },
    greenCircle: {
        backgroundColor: green,
        width:  100,
        height: 100,
        borderRadius: 100,
        position: 'absolute',
        top: -60,
        right: 82,
        transform: [{ rotate: '-62deg'}, { scaleX: 1.9 }, { scaleY: 2.7 }],
    }
})

export default Header;