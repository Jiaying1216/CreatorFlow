import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Alert, Platform, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, ScrollView } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import { firebase } from '../config';
import { Ionicons } from '@expo/vector-icons';

const CreateTaskScreen = ({ navigation }) => {
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskNotes, setTaskNotes] = useState('');
    const [priority, setPriority] = useState(false);
    const [project, setProject] = useState('');
    const [projects, setProjects] = useState([]);
    const [dueDate, setDueDate] = useState(null);
    const [showPicker, setShowPicker] = useState(false);
    const [setDueDateSwitch, setDueDateSwitchState] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            const userId = firebase.auth().currentUser.uid;
            const projectsRef = firebase.firestore().collection('users').doc(userId).collection('projects');
            const snapshot = await projectsRef.get();
            if (snapshot.empty) {
                setProjects([{ label: 'No Project', value: 'None' }]);
            } else {
                const projectList = snapshot.docs.map(doc => ({
                    label: doc.data().projectName,
                    value: doc.id,
                }));
                setProjects(projectList);
            }
        };

        fetchProjects();
        updateTaskStatuses();
    }, []);

    const updateTaskStatuses = async () => {
        const userId = firebase.auth().currentUser.uid;
        const tasksRef = firebase.firestore().collection('users').doc(userId).collection('tasks');
        const snapshot = await tasksRef.get();

        snapshot.forEach(async doc => {
            const task = doc.data();
            const now = new Date();
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;

            if (dueDate && dueDate < now) {
                await doc.ref.update({ status: 'Overdue' });
            }
        });
    };

    const toggleDatePicker = () => {
        setShowPicker(!showPicker);
    };

    const onChange = (event, selectedDate) => {
        if (event.type === "set") {
            const currentDate = selectedDate || new Date();
            setDueDate(currentDate);
        }
        toggleDatePicker();
    };

    const addTask = async () => {
        const userId = firebase.auth().currentUser.uid;
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        const currentDate = new Date().toISOString().split('T')[0];
        const taskData = {
            taskName,
            taskDescription,
            taskNotes,
            priority,
            projectId: project,
            dueDate: setDueDateSwitch ? (dueDate ? dueDate.toISOString() : '') : '',
            status: 'New',
            createdAt: timestamp,
            createdDate: currentDate,
        };

        try {
            const docRef = await firebase.firestore()
                .collection('users')
                .doc(userId)
                .collection('tasks')
                .add(taskData);

            if (project) {
                const projectRef = firebase.firestore()
                    .collection('users')
                    .doc(userId)
                    .collection('projects')
                    .doc(project);

                const projectDoc = await projectRef.get();
                if (projectDoc.exists) {
                    await projectRef.update({
                        tasks: firebase.firestore.FieldValue.arrayUnion({
                            taskId: docRef.id,
                            taskName: taskData.taskName,
                            status: taskData.status,
                            dueDate: taskData.dueDate
                        }),
                        tasksCount: firebase.firestore.FieldValue.increment(1),
                    });
                    Alert.alert('Task added and project updated successfully');
                } else {
                    Alert.alert('Error', 'Project not found.');
                }
            } else {
                Alert.alert('Task added successfully');
            }

            updateTaskStatuses();
            navigation.goBack();

        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                            <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.header}>Create New Task</Text>
                    </View>
                    <View style={styles.bodyContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Task Name"
                            value={taskName}
                            onChangeText={(text) => setTaskName(text)}
                            placeholderTextColor="#8E8E93"
                        />
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Task Description"
                            value={taskDescription}
                            onChangeText={(text) => setTaskDescription(text)}
                            multiline
                            placeholderTextColor="#8E8E93"
                        />
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Notes"
                            value={taskNotes}
                            onChangeText={(text) => setTaskNotes(text)}
                            multiline
                            placeholderTextColor="#8E8E93"
                        />

                        <View style={styles.pickerContainer}>
                            <Text style={styles.label}>Project</Text>
                            <RNPickerSelect
                                onValueChange={(value) => setProject(value)}
                                items={projects}
                                style={pickerSelectStyles}
                                placeholder={{ label: 'Select a project...', value: '' }}
                            />
                        </View>
                        <View style={styles.switchContainer}>
                            <Text style={styles.label}>Priority</Text>
                            <Switch
                                value={priority}
                                onValueChange={(value) => setPriority(value)}
                                trackColor={{ false: "#D1D1D6", true: "#34C759" }}
                                thumbColor={priority ? "#fff" : "#f4f3f4"}
                            />
                        </View>
                        <View style={styles.switchContainer}>
                            <Text style={styles.switchText}>Set Deadlines</Text>
                            <Switch
                                value={setDueDateSwitch}
                                onValueChange={(value) => setDueDateSwitchState(value)}
                                trackColor={{ false: "#D1D1D6", true: "#34C759" }}
                                thumbColor={setDueDateSwitch ? "#fff" : "#f4f3f4"}
                            />
                        </View>
                        {setDueDateSwitch && (
                            <View style={styles.pickerContainer}>
                                <TouchableOpacity onPress={toggleDatePicker} style={styles.dateButton}>
                                    <Text style={styles.dateText}>{dueDate ? dueDate.toDateString() : 'No Deadline'}</Text>
                                </TouchableOpacity>
                                {showPicker && (
                                    <DateTimePicker
                                        mode="date"
                                        display="spinner"
                                        value={dueDate || new Date()}
                                        onChange={onChange}
                                        style={styles.datePicker}
                                    />
                                )}
                            </View>
                        )}
                    </View>
                </ScrollView>

                <View style={styles.fixedFooter}>
                    <TouchableOpacity style={styles.addButton} onPress={addTask}>
                        <Text style={styles.addButtonText}>Add Task</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

export default CreateTaskScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7', 
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 130, 
        paddingTop: 100,
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
    bodyContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
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
        textAlignVertical: 'top', 
    },
    pickerContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16, 
        color: '#000',
        marginBottom: 5,
    },
    addButton: {
        backgroundColor: '#194569', 
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: "100%",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3, 
    },
    addButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    fixedFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 10,
        alignItems: 'center',
        backgroundColor: '#F2F2F7', 
        borderTopWidth: 1,
        borderTopColor: '#D1D1D6', 
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    switchText: {
        fontSize: 16,
        color: '#000',
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
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        height: 50,
        borderColor: '#D1D1D6',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        color: '#000',
        marginTop: 10,
        backgroundColor: '#fff',
    },
    inputAndroid: {
        height: 50,
        borderColor: '#D1D1D6',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        color: '#000',
        marginTop: 10,
        backgroundColor: '#fff',
    },
});