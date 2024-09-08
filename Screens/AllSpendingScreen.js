import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firebase } from '../config';

const AllSpendingScreen = ({ navigation }) => {
    const [spendingList, setSpendingList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSpendingData = async () => {
        const userId = firebase.auth().currentUser.uid;

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

        setSpendingList(spendings);
        setLoading(false); 
    };

    useEffect(() => {
        fetchSpendingData();
    }, []);

    const renderSpendingItem = ({ item }) => (
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
                <Text style={styles.itemDetail}>Date: {new Date(item.createdAt.seconds * 1000).toLocaleDateString()}</Text>
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
                <Text style={styles.header}>All Spending</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#194569" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={spendingList}
                    renderItem={renderSpendingItem}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={<Text style={styles.noDataText}>No spending records available</Text>}
                    contentContainerStyle={styles.listContentContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default AllSpendingScreen;

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
        fontSize: 14,
        marginTop: 4,
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
