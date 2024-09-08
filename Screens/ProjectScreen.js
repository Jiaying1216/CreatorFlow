import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { firebase } from '../config';
import { useFocusEffect } from '@react-navigation/native';

const ProjectScreen = ({ navigation }) => {
    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);  
    const [searchQuery, setSearchQuery] = useState('');  

    const fetchProjects = async () => {
        setLoadingProjects(true);
        const userId = firebase.auth().currentUser.uid;
        const projectsRef = firebase.firestore().collection('users').doc(userId).collection('projects');
        const snapshot = await projectsRef.get();

        const projectList = await Promise.all(snapshot.docs.map(async doc => {
            const projectData = doc.data();
            const tasksSnapshot = await projectsRef.doc(doc.id).collection('tasks').get();
            const tasksCount = projectData.tasksCount; 
            return { id: doc.id, ...projectData, tasksCount };
        }));

        setProjects(projectList);
        setLoadingProjects(false);
    };

    useFocusEffect(
        useCallback(() => {
            fetchProjects();
        }, [])
    );

    const deleteProject = (projectId) => {
        Alert.alert(
            "Delete Project",
            "Are you sure you want to delete this project? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        const userId = firebase.auth().currentUser.uid;
                        firebase.firestore()
                            .collection('users')
                            .doc(userId)
                            .collection('projects')
                            .doc(projectId)
                            .delete()
                            .then(() => {
                                Alert.alert('Project deleted successfully');
                                setProjects(projects.filter(project => project.id !== projectId));
                            })
                            .catch((error) => {
                                Alert.alert('Error', error.message);
                            });
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const filteredProjects = projects.filter(project =>
        project.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                {isSearching ? (
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChangeText={(text) => setSearchQuery(text)}
                            autoFocus={true} 
                        />
                        <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); }}>
                            <Text style={styles.cancelButton}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(!isEditing)}>
                            <Text style={styles.headerText}>{isEditing ? "Done" : "Edit"}</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>My Projects</Text>
                        <TouchableOpacity onPress={() => setIsSearching(true)}>
                            <FontAwesome name="search" size={24} color="#194569" />
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {loadingProjects ? (
                <ActivityIndicator size="large" color="#194569" style={{ marginVertical: 20 }} />
            ) : (
                <FlatList
                    data={filteredProjects}  
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.projectContainer}
                            onPress={() => navigation.navigate('ProjectDetailScreen', { projectId: item.id })}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                                <FontAwesome name={item.icon || 'folder'} size={24} color="#fff" />
                            </View>
                            <View style={styles.projectInfo}>
                                <Text style={styles.projectTitle}>{item.projectName}</Text>
                                <Text style={styles.projectTasks}>{item.tasksCount ? item.tasksCount : 0} Tasks</Text>
                            </View>
                            {isEditing && (
                                <TouchableOpacity onPress={() => deleteProject(item.id)}>
                                    <FontAwesome name="trash-o" size={24} color="#D32F2F" />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                    )}
                />
            )}

            <View style={styles.footerContainer}>
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateProjectScreen')}>
                    <Text style={styles.addButtonText}>Add New Project</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ProjectScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    editButton: {
        flex: 1,
    },
    headerText: {
        fontSize: 18,
        color: '#194569',
        fontWeight: '500',
    },
    headerTitle: {
        flex: 2,
        fontSize: 22,
        fontWeight: '600',
        color: '#194569',
        textAlign: 'center',
        paddingRight: 55,
    },
    projectContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        backgroundColor: '#194569',
    },
    projectInfo: {
        flex: 1,
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#194569',
    },
    projectTasks: {
        color: '#757575',
        marginTop: 4,
        fontSize: 14,
    },
    footerContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButton: {
        backgroundColor: '#194569',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#F2F2F2',
        paddingHorizontal: 15,
        height: 40,
        borderRadius: 8,
    },
    cancelButton: {
        fontSize: 16,
        color: '#194569',
        marginLeft: 10,
    },
});