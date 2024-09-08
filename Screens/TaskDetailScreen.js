import { View, Text, StyleSheet, TextInput,  Pressable} from "react-native";
import React, { useState} from 'react'
import { firebase } from '../config';
import { FontAwesome  } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const Detail = ({route}) => {
    const todoRef = firebase.firestore().collection('todos');
    const [textHeading, onChangeHeadingText] = useState(route.params.item.name);
    const navifation = useNavigation();

    const updateTodo = () =>{
        if (textHeading && textHeading.length > 0) {
            todoRef
            .doc(route.params.item.id)
            .update({
                heading: textHeading
            }).then (() =>{
                NavigationPreloadManager.navigate('Home')
            }).catch((error) => {
                alert(error,message)
            })
        }
    }
    return (
        <View style={StyleSheet.container}>
            <TextInput
                style = {styles.textField}
                onChangeText={onChangeHeadingText}
                value={textHeading}
                placeholder="updateTodo"
             />
             <Pressable 
                style = {styles.buttonUpdate}
                onPress={() => {updateTodo()}}
             >
                <Text>Update To-Do</Text>
             </Pressable>
            <Text>Details</Text>
        </View>
    )
}

export default Detail

const styles = StyleSheet.create({
    container:{
        marginTop: 80, 
        marginLeft: 15, 
        marginRight: 15
    },
    textField: {
        marginbottom: 10,
        padding: 10, 
        fontsize: 15,
        color: '#000000',
        backgroundColor: '#e0e0e0',
        borderRadius: 5
    },
    buttonUpdate: {
        marginTop: 25, 
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32, 
        borderRadius: 4,
        elevation: 10,
        backgroundColor: '#0de065',
    }
})