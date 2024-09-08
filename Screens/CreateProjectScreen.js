import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { firebase } from '../config';

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const CreateProjectScreen = ({ navigation }) => {
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [notes, setNotes] = useState('');
    const [projectIcon, setProjectIcon] = useState(null);
    const [setDeadlineSwitch, setDeadlineSwitchState] = useState(false);
    const [deadline, setDeadline] = useState(null);
    const [showPicker, setShowPicker] = useState(false);

    const toggleDatePicker = () => {
        setShowPicker(!showPicker);
    };

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || deadline;
        setShowPicker(Platform.OS === 'ios');
        setDeadline(currentDate);
    };

    const createProject = () => {
        const userId = firebase.auth().currentUser.uid;
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        const randomColor = getRandomColor(); 

        const projectData = {
            projectName,
            description,
            notes,
            deadline: setDeadlineSwitch ? (deadline ? deadline.toISOString() : '') : '',
            color: randomColor, 
            createdAt: timestamp,
        };

        firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('projects')
            .add(projectData)
            .then(() => {
                Alert.alert('Project created successfully');
                navigation.goBack();
            })
            .catch((error) => {
                Alert.alert('Error', error.message);
            });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.innerContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.header}>Create New Project</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Name of the project"
                        value={projectName}
                        onChangeText={(text) => setProjectName(text)}
                        placeholderTextColor="#8E8E93"
                    />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Description"
                        value={description}
                        onChangeText={(text) => setDescription(text)}
                        multiline
                        placeholderTextColor="#8E8E93"
                    />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Notes"
                        value={notes}
                        onChangeText={(text) => setNotes(text)}
                        multiline
                        placeholderTextColor="#8E8E93"
                    />
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchText}>Set Deadlines</Text>
                        <Switch
                            value={setDeadlineSwitch}
                            onValueChange={(value) => setDeadlineSwitchState(value)}
                            trackColor={{ false: "#D1D1D6", true: "#34C759" }}
                            thumbColor={setDeadlineSwitch ? "#fff" : "#f4f3f4"}
                        />
                    </View>
                    {setDeadlineSwitch && (
                        <View style={styles.pickerContainer}>
                            <TouchableOpacity onPress={toggleDatePicker} style={styles.dateButton}>
                                <Text style={styles.dateText}>{deadline ? deadline.toDateString() : 'No Deadline'}</Text>
                            </TouchableOpacity>
                            {showPicker && (
                                <DateTimePicker
                                    mode="date"
                                    display="spinner"
                                    value={deadline || new Date()}
                                    onChange={onChange}
                                    style={styles.datePicker}
                                    testID="date-picker"
                                    
                                />
                            )}
                        </View>
                    )}
                    <TouchableOpacity style={styles.createButton} onPress={createProject}>
                        <Text style={styles.createButtonText}>Create Project</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default CreateProjectScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    innerContainer: {
        flex: 1,
        padding: 20,
    },
    backButton: {
        marginBottom: 20,
    },
    backButtonText: {
        fontSize: 24,
        color: '#194569',
    },
    header: {
        fontSize: 28,
        fontWeight: '600',
        color: '#194569',
        marginBottom: 30,
        textAlign: 'center',
        paddingTop: 30,
    },
    input: {
        height: 50,
        borderColor: '#D1D1D6',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        fontSize: 16,
        color: '#000',
    },
    textArea: {
        height: 100,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    switchText: {
        fontSize: 18,
        color: '#000',
    },
    pickerContainer: {
        marginBottom: 20,
    },
    dateButton: {
        backgroundColor: '#E5E5EA',
        padding: 15,
        borderRadius: 10,
    },
    dateText: {
        fontSize: 16,
        color: '#194569',
    },
    datePicker: {
        marginTop: 10,
    },
    createButton: {
        backgroundColor: '#194569',
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
