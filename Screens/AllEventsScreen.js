import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firebase } from '../config';

const AllEventsScreen = ({ navigation }) => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            const userId = firebase.auth().currentUser.uid;
            const eventsRef = firebase.firestore().collection('users').doc(userId).collection('events').orderBy('createdAt', 'desc');
            const snapshot = await eventsRef.get();
            const eventList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setEvents(eventList);
        };

        fetchEvents();
    }, []);

    const renderEvent = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('EventDetailScreen', { eventId: item.id })}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.color || '#194569' }]}>
                <Ionicons name="calendar" size={24} color="#fff" />
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDetail}>Earnings:</Text>
                <Text style={styles.earningTotal}>Total: ${item.totalEarnings || '0'}</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color="#757575" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.header}>All Events</Text>
            </View>
            
            <FlatList
                data={events}
                renderItem={renderEvent}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text style={styles.noDataText}>No recent events</Text>}
                contentContainerStyle={styles.listContentContainer}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default AllEventsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7', 
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
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA', 
        padding: 15,
        borderRadius: 12, 
        marginHorizontal: 20, 
        marginVertical: 5, 
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
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333', 
    },
    itemDetail: {
        color: '#757575', 
        marginTop: 4,
        fontSize: 14,
    },
    earningTotal: {
        fontWeight: '600',
        color: '#333333',
        marginTop: 4,
        fontSize: 16,
    },
    noDataText: {
        textAlign: 'center',
        color: '#757575',
        fontSize: 16,
        marginTop: 20,
    },
    listContentContainer: {
        paddingTop: 100, 
        paddingBottom: 20, 
    },
});
