import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Keyboard, Pressable, Platform } from "react-native";
import { firebase } from '../config';
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons'; 

const Home = () => {
    const [todos, setTodos] = useState([]);
    const todoRef = firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('tasks');
    const [selectedStatus, setSelectedStatus] = useState('New');
    const navigation = useNavigation();

    useEffect(() => {
        const fetchTasks = async () => {
            todoRef.onSnapshot(querySnapshot => {
                const todos = [];
                querySnapshot.forEach(doc => {
                    const { taskName, status, project, dueDate, priority } = doc.data();
                    todos.push({
                        id: doc.id,
                        taskName,
                        status,
                        project,
                        dueDate,
                        priority, 
                    });
                });
                setTodos(todos);
            });
        };
        fetchTasks();
    }, []);

    const getCurrentDate = () => {
        const date = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    };

    const filteredTodos = todos
        .filter(todo => todo.status === selectedStatus)
        .sort((a, b) => b.priority - a.priority); 

    const markAsDone = (todo) => {
        todoRef
            .doc(todo.id)
            .update({ status: 'Done' })
            .then(() => {
                alert("Task marked as done successfully");
            })
            .catch(error => {
                alert(error);
            });
    }

    const renderItem = ({ item }) => {
        const handleCheck = () => {
            markAsDone(item);
        };
    
        return (
            <View style={[styles.taskContainer, item.priority && styles.priorityTaskContainer]}>
                <TouchableOpacity
                    style={styles.checkBox}
                    onPress={handleCheck}
                >
                    {item.status === 'Done' && (
                        <Text style={styles.checkBoxText}>✔</Text>
                    )}
                </TouchableOpacity>
                <View style={styles.innerContainer}>
                    <Text style={styles.itemHeading}>
                        {item.taskName ? item.taskName[0].toUpperCase() + item.taskName.slice(1) : 'Untitled Task'}
                    </Text>
                    {item.project && <Text style={styles.projectText}>Project: {item.project}</Text>}
                    {item.dueDate && <Text style={styles.dueDateText}>Due: {new Date(item.dueDate).toDateString()}</Text>}
                    {item.priority && <Text style={styles.priorityText}>Priority</Text>}
                </View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Today</Text>
                <Text style={styles.dateText}>{getCurrentDate()}</Text>
            </View>
            <View style={styles.filterContainer}>
                {['New', 'On-going', 'Overdue', 'Done'].map(status => (
                    <TouchableOpacity
                        key={status}
                        style={[styles.filterButton, selectedStatus === status && styles.selectedFilterButton]}
                        onPress={() => setSelectedStatus(status)}
                    >
                        <Text style={[styles.filterButtonText, selectedStatus === status && styles.selectedFilterButtonText]}>{status}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <FlatList
                data={filteredTodos}
                numColumns={1}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
            {/* Circular + Button */}
            <TouchableOpacity
                style={styles.circularButton}
                onPress={() => navigation.navigate('CreateTaskScreen')}
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
        </View>
    );
}

export default Home;

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#194569',
        paddingTop: Platform.OS === 'ios' ? 80 : 60, 
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        alignItems: 'center',
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    headerText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    dateText: {
        fontSize: 16,
        color: '#fff',
        marginTop: 5, 
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        marginTop: 10, 
    },
    filterButton: {
        backgroundColor: '#F3F3F3',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    selectedFilterButton: {
        backgroundColor: '#194569',
    },
    filterButtonText: {
        color: '#7A7A7A',
        fontWeight: 'bold',
    },
    selectedFilterButtonText: {
        color: '#fff',
    },
    taskContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff', 
        padding: 15,
        borderRadius: 15,
        margin: 5,
        marginHorizontal: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e5e5', 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, 
        shadowRadius: 3,
        elevation: 1,
    },
    priorityTaskContainer: {
        borderColor: '#F3B456', 
        borderWidth: 2,
    },
    checkBox: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkBoxText: {
        color: '#194569',
    },
    innerContainer: {
        flexDirection: 'column',
        marginLeft: 15,
        flex: 1,
    },
    itemHeading: {
        fontWeight: 'bold',
        fontSize: 18,
        marginRight: 22,
        color: '#194569',
    },
    projectText: {
        color: '#888',
        fontSize: 14,
    },
    dueDateText: {
        color: '#888',
        fontSize: 14,
    },
    priorityText: {
        color: '#d9534f', 
        fontSize: 14,
        fontWeight: 'bold',
    },
    circularButton: {
        backgroundColor: '#194569',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 20,
        bottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
});
