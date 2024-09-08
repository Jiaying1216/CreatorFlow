import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import * as Progress from 'react-native-progress';
import { FontAwesome } from '@expo/vector-icons';
import { firebase } from '../config';
import { Ionicons } from '@expo/vector-icons';

const ProjectDetailScreen = ({ route, navigation }) => {
    const { projectId } = route.params;
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const fetchProjectAndTasks = async () => {
            const userId = firebase.auth().currentUser.uid;
            const projectRef = firebase.firestore().collection('users').doc(userId).collection('projects').doc(projectId);

            const projectDoc = await projectRef.get();
            if (projectDoc.exists) {
                setProject(projectDoc.data());

                const tasksRef = firebase.firestore().collection('users').doc(userId).collection('tasks').where('projectId', '==', projectId);
                const tasksSnapshot = await tasksRef.get();

                const taskList = tasksSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setTasks(taskList);

                const completedTasks = taskList.filter(task => task.status === 'Done').length;
                const totalTasks = taskList.length;
                setProgress(totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0);
            }
        };

        fetchProjectAndTasks();
    }, [projectId]);

    const closeProject = () => {
        Alert.alert('Project closed successfully');
        navigation.goBack();
    };

    const toggleTaskStatus = (task) => {
        const userId = firebase.auth().currentUser.uid;
        const taskRef = firebase.firestore().collection('users').doc(userId).collection('tasks').doc(task.id);
        const newStatus = task.status === 'Done' ? 'New' : 'Done';

        taskRef.update({ status: newStatus }).then(() => {
            const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
            setTasks(updatedTasks);

            const completedTasks = updatedTasks.filter(t => t.status === 'Done').length;
            const totalTasks = updatedTasks.length;
            setProgress(totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0);
        });
    };

    if (!project) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Loading all the projects</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <View style={styles.headerRow}>
                    <Text style={styles.headerText}>{project.projectName}</Text>
                    <Text style={styles.headerDate}>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No Due Date'}</Text>
                </View>
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.sectionTitle}>Project Description:</Text>
                <Text style={styles.descriptionText}>{project.description || 'No description available.'}</Text>

                <Text style={styles.sectionTitle}>Tasks:</Text>
                <FlatList
                    data={tasks}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.taskContainer}>
                            <TouchableOpacity onPress={() => toggleTaskStatus(item)}>
                                <FontAwesome name={item.status === 'Done' ? 'check-square' : 'square-o'} size={24} color="#000" />
                            </TouchableOpacity>
                            <View style={styles.taskInfo}>
                                <Text style={styles.taskTitle}>{item.taskName}</Text>
                                <Text style={styles.taskSubtitle}>{item.projectName || 'No Project'}</Text>
                                {item.dueDate && (
                                    <Text style={styles.taskSubtitle}>By {new Date(item.dueDate).toLocaleDateString()}</Text>
                                )}
                            </View>
                        </View>
                    )}
                />

                <Text style={styles.sectionTitle}>Progress:</Text>
                <View style={styles.progressContainer}>
                    <Progress.Bar styleAttr="Horizontal" color="#194569" indeterminate={false} progress={progress / 100} width={null}/>
                    <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
                </View>
            </View>
            <View style={styles.footerContainer}>
                <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('CreateTaskScreen', { projectId })}>
                    <Text style={styles.footerButtonText}>Add Tasks</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButton} onPress={closeProject}>
                    <Text style={styles.footerButtonText}>Close Project</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ProjectDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff', 
    },
    headerContainer: {
        backgroundColor: '#194569', 
        paddingTop: Platform.OS === 'ios' ? '15%' : '10%',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 15, 
        borderBottomRightRadius: 15,
        alignItems: 'center',
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
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingTop: 15,
    },
    headerDate: {
        fontSize: 14,
        color: '#B0BEC5', 
        textAlign: 'left',
    },
    headerText: {
        fontSize: 22, 
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'right',
    },
    contentContainer: {
        padding: 15, 
    },
    sectionTitle: {
        paddingTop: 10,
        fontSize: 16,
        fontWeight: '600', 
        color: '#333',
        marginBottom: 8, 
    },
    descriptionText: {
        fontSize: 14, 
        color: '#616161', 
        marginBottom: 16,
    },
    taskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8, 
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    taskInfo: {
        marginLeft: 10,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#424242', 
    },
    taskSubtitle: {
        fontSize: 14,
        color: '#757575', 
    },
    progressContainer: {
        marginTop: 10,
    },
    progressText: {
        marginTop: 5,
        fontSize: 14,
        color: '#757575',
    },
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 15,
        backgroundColor: '#FAFAFA', 
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    footerButton: {
        backgroundColor: '#ffffff', 
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 20,
        height: 45, 
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    footerButtonText: {
        color: '#194569',
        fontSize: 16,
        fontWeight: '500', 
    },
});
