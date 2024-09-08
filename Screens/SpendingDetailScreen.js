import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firebase } from '../config';

const SpendingDetailScreen = ({ route, navigation }) => {
    const { spendingId } = route.params;
    const [spendingDetails, setSpendingDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSpendingDetails = async () => {
        const userId = firebase.auth().currentUser.uid;
        const spendingRef = firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('spending')
            .doc(spendingId);

        const doc = await spendingRef.get();
        if (doc.exists) {
            setSpendingDetails(doc.data());
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSpendingDetails();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#194569" />
            </View>
        );
    }

    if (!spendingDetails) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Unable to load spending details.</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
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
                <Text style={styles.headerTitle}>{spendingDetails.itemName}</Text>
            </View>

            <View style={styles.cardContainer}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Item Name:</Text>
                    <Text style={styles.detailText}>{spendingDetails.itemName || 'N/A'}</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Spending:</Text>
                    <Text style={styles.detailText}>${spendingDetails.totalSpending || 'N/A'}</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailText}>
                        {new Date(spendingDetails.createdAt.seconds * 1000).toLocaleDateString() || 'N/A'}
                    </Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category:</Text>
                    <Text style={styles.detailText}>{spendingDetails.category || 'N/A'}</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Notes:</Text>
                    <Text style={styles.detailText}>{spendingDetails.notes || 'No notes available.'}</Text>
                </View>
            </View>
        </View>
    );
};

export default SpendingDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA', 
    },
    headerContainer: {
        backgroundColor: '#194569',
        paddingTop: Platform.OS === 'ios' ? 100 : 100,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 16,
        color: '#fff',
        marginLeft: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    cardContainer: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#194569',
    },
    detailText: {
        fontSize: 16,
        color: '#333333',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#D32F2F', 
        fontSize: 18,
        marginBottom: 20,
    },
});
