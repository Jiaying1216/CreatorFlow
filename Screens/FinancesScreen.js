import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, Platform } from 'react-native';
import { firebase } from '../config';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const FinanceScreen = ({ navigation }) => {
    const [totalProfits, setTotalProfits] = useState(0);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [totalSpending, setTotalSpending] = useState(0);
    const [recentEvents, setRecentEvents] = useState([]);
    const [recentSpending, setRecentSpending] = useState([]);

    const fetchFinanceData = async () => {
        const userId = firebase.auth().currentUser.uid;

        const eventsSnapshot = await firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('events')
            .get();

        const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const earnings = events.reduce((acc, event) => acc + (event.totalEarnings || 0), 0);
        setTotalEarnings(earnings);

        const spendingSnapshot = await firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('spending')
            .orderBy('createdAt', 'desc')
            .get();

        const spendings = spendingSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        const spending = spendings.reduce((acc, spend) => acc + (spend.totalSpending || 0), 0);
        setTotalSpending(spending);

        setTotalProfits(earnings - spending);

        setRecentEvents(events.slice(0, 3));

        setRecentSpending(spendings.slice(0, 3)); 
    };

    useFocusEffect(
        useCallback(() => {
            fetchFinanceData(); 
        }, [])
    );

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
            <Ionicons name="arrow-forward" size={24} color="gray" />
        </TouchableOpacity>
    );
    

    const renderSpending = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('SpendingDetailScreen', { spendingId: item.id })}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.color || '#194569' }]}>
                <Ionicons name="cart" size={24} color="#fff" />
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.itemName}</Text>
                <Text style={styles.itemDetail}>Amount: ${item.totalSpending}</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color="gray" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>Total Profits</Text>
                    <Text style={styles.summaryAmount}>${totalProfits}</Text>
                </View>

                <View style={styles.row}>
                    <View style={styles.summaryBox}>
                        <Text style={styles.summarySubTitle}>Total Earning</Text>
                        <Text style={styles.summarySubAmount}>${totalEarnings}</Text>
                    </View>
                    <View style={styles.summaryBox}>
                        <Text style={styles.summarySubTitle}>Total Spending</Text>
                        <Text style={styles.summarySubAmount}>${totalSpending}</Text>
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Recent Events</Text>
                    <FlatList
                        data={recentEvents}
                        renderItem={renderEvent}
                        keyExtractor={(item) => item.id}
                        ListEmptyComponent={<Text style={styles.noDataText}>No recent events</Text>}
                        scrollEnabled={false} 
                    />
                    <TouchableOpacity onPress={() => navigation.navigate('AllEventsScreen')}>
                        <Text style={styles.seeMoreText}>See More</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Recent Product Spending</Text>
                    <FlatList
                        data={recentSpending}
                        renderItem={renderSpending}
                        keyExtractor={(item) => item.id}
                        ListEmptyComponent={<Text style={styles.noDataText}>No recent spending</Text>}
                        scrollEnabled={false} 
                    />
                    <TouchableOpacity onPress={() => navigation.navigate('AllSpendingScreen')}>
                        <Text style={styles.seeMoreText}>See More</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footerContainer}>
                <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('CreateEventScreen')}>
                    <Text style={styles.footerButtonText}>+ Event</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('CreateSpendingScreen')}>
                    <Text style={styles.footerButtonText}>+ Spending</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default FinanceScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', 
        paddingHorizontal:10,
        paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    },
    summaryContainer: {
        backgroundColor: '#FAFAFA', 
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        alignItems: 'center',
        marginBottom: 20,
    },
    summaryTitle: {
        fontSize: 16,
        color: '#757575', 
    },
    summaryAmount: {
        fontSize: 32,
        fontWeight: '600', 
        color: '#194569', 
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    summaryBox: {
        backgroundColor: '#FAFAFA',
        padding: 15,
        borderRadius: 10,
        width: '48%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        alignItems: 'center',
    },
    summarySubTitle: {
        fontSize: 16,
        color: '#757575',
    },
    summarySubAmount: {
        fontSize: 20,
        fontWeight: '600',
        color: '#194569',
        marginTop: 5,
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#194569',
        marginBottom: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        padding: 15,
        borderRadius: 10,
        marginTop: 5,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 10, 
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
        fontSize: 14,
        marginTop: 4,
    },
    seeMoreText: {
        color: '#194569',
        fontWeight: '600',
        textAlign: 'right',
        marginTop: 10,
    },
    noDataText: {
        textAlign: 'center',
        color: '#757575',
        marginTop: 20,
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
        borderTopWidth: 1, 
        borderTopColor: '#E0E0E0',
        backgroundColor: '#FFFFFF', 
    },
    footerButton: {
        backgroundColor: '#194569',
        paddingVertical: 12,
        borderRadius: 10,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    footerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});