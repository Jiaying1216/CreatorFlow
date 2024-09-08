import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Alert, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { firebase } from '../config';

const CreateEventScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date());
    const [allDay, setAllDay] = useState(false);
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    const toggleDatePicker = () => {
        setShowDatePicker(!showDatePicker);
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const onTimeChange = (event, selectedTime, setTime) => {
        const currentTime = selectedTime || new Date();
        setTime(currentTime);
    };

    const createEvent = () => {
        if (!title.trim()) {
            Alert.alert('Validation Error', 'Title is required.');
            return;
        }
    
        const userId = firebase.auth().currentUser.uid;
    
        const setDate = date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).split('/').reverse().join('-');
    
        const eventData = {
            title,
            description,
            allDay,
            date: setDate,
            startDate: allDay ? null : startTime.toISOString(),
            endDate: allDay ? null : endTime.toISOString(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
    
        firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('events')
            .add(eventData)
            .then(() => {
                Alert.alert('Event created successfully');
                navigation.goBack();
            })
            .catch((error) => {
                Alert.alert('Error', error.message);
            });
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.innerContainer}>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                            <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.header}>Create New Event</Text>
                    </View>

                    <View style={styles.contentContainer}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Event Title"
                                value={title}
                                onChangeText={setTitle}
                            />
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Description"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                            />
                        </View>

                        <View style={styles.dateContainer}>
                            <Text style={styles.label}>Event Date</Text>
                            <TouchableOpacity onPress={toggleDatePicker} style={styles.dateButton}>
                                <Text style={styles.dateText}>{date ? date.toDateString() : 'Select Date'}</Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="spinner"
                                    onChange={onDateChange}
                                />
                            )}
                        </View>

                        <View style={styles.switchContainer}>
                            <Text style={styles.label}>All Day Event</Text>
                            <Switch
                                value={allDay}
                                onValueChange={setAllDay}
                                trackColor={{ false: '#ccc', true: '#194569' }}
                                thumbColor={allDay ? '#194569' : '#f4f3f4'}
                            />
                        </View>

                        {!allDay && (
                            <>
                                <View style={styles.timePickerContainer}>
                                    <Text style={styles.label}>Start Time</Text>
                                    <TouchableOpacity onPress={() => setShowStartTimePicker(true)} style={styles.dateButton}>
                                        <Text style={styles.dateText}>{startTime.toLocaleTimeString()}</Text>
                                    </TouchableOpacity>
                                    {showStartTimePicker && (
                                        <DateTimePicker
                                            value={startTime}
                                            mode="time"
                                            is24Hour={false}
                                            display="spinner"
                                            onChange={(event, selectedTime) => {
                                                setShowStartTimePicker(Platform.OS === 'ios');
                                                onTimeChange(event, selectedTime, setStartTime);
                                            }}
                                        />
                                    )}
                                </View>

                                <View style={styles.timePickerContainer}>
                                    <Text style={styles.label}>End Time</Text>
                                    <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={styles.dateButton}>
                                        <Text style={styles.dateText}>{endTime.toLocaleTimeString()}</Text>
                                    </TouchableOpacity>
                                    {showEndTimePicker && (
                                        <DateTimePicker
                                            value={endTime}
                                            mode="time"
                                            is24Hour={false}
                                            display="spinner"
                                            onChange={(event, selectedTime) => {
                                                setShowEndTimePicker(Platform.OS === 'ios');
                                                onTimeChange(event, selectedTime, setEndTime);
                                            }}
                                        />
                                    )}
                                </View>
                            </>
                        )}
                    </View>

                    <View style={styles.footerContainer}>
                        <TouchableOpacity style={styles.saveButton} onPress={createEvent}>
                            <Text style={styles.saveButtonText}>Save Event</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default CreateEventScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 85,
        backgroundColor: '#194569',
        zIndex: 1000,
        paddingTop: Platform.OS === 'ios' ? 30 : 0,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    backButton: {
        position: 'absolute',
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 30 : 0,
    },
    backButtonText: {
        fontSize: 16,
        color: '#fff',
        marginLeft: 5,
    },
    header: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    contentContainer: {
        flex: 1,
        paddingTop: 100, 
        paddingHorizontal: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        height: 48,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 10,
    },
    label: {
        fontSize: 16,
        color: '#194569',
        marginBottom: 5,
    },
    dateContainer: {
        marginBottom: 20,
    },
    dateButton: {
        height: 48,
        justifyContent: 'center',
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    dateText: {
        fontSize: 16,
        color: '#000',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    timePickerContainer: {
        marginBottom: 20,
    },
    footerContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#f7f7f7',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    saveButton: {
        backgroundColor: '#194569',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
