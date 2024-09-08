import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { firebase } from '../config';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const EventDetailScreen = ({ route, navigation }) => {
    const { eventId } = route.params;
    const [event, setEvent] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [startingCash, setStartingCash] = useState('');
    const [earningCash, setEarningCash] = useState('');
    const [earningBank, setEarningBank] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchEventDetails = async () => {
        setLoading(true);
        const userId = firebase.auth().currentUser.uid;
        const eventDoc = await firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('events')
            .doc(eventId)
            .get();

        if (eventDoc.exists) {
            const eventData = eventDoc.data();
            setEvent(eventData);
            setStartingCash(eventData.startingCash?.toString() || '');
            setEarningCash(eventData.earningCash?.toString() || '');
            setEarningBank(eventData.earningBank?.toString() || '');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEventDetails(); 
    }, [eventId]);

    useFocusEffect(
        useCallback(() => {
            fetchEventDetails(); 
        }, [eventId])
    );

    const handleSaveEarnings = () => {
        const userId = firebase.auth().currentUser.uid;
        const totalEarnings = parseFloat(earningCash) + parseFloat(earningBank);
        const eventRef = firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('events')
            .doc(eventId);

        const updateData = {
            startingCash: parseFloat(startingCash) || 0,
            earningCash: parseFloat(earningCash) || 0,
            earningBank: parseFloat(earningBank) || 0,
            totalEarnings: totalEarnings || 0,
        };

        if (event.description !== undefined) {
            updateData.description = event.description;
        }

        if (event.notes !== undefined) {
            updateData.notes = event.notes;
        }

        eventRef.update(updateData)
            .then(() => {
                alert('Earnings updated successfully');
                setEditMode(false);
                fetchEventDetails(); 
            })
            .catch(error => {
                alert('Error updating earnings:', error.message);
            });
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#194569" />
                <Text style={styles.loadingText}>Loading event details...</Text>
            </View>
        );
    }

    if (!event) {
        return <Text>No event details found.</Text>;
    }

    const hasFinancialDetails = event.startingCash || event.earningCash || event.earningBank;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inner}>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Text style={styles.backButtonText}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerText}>{event.title}</Text>
                        <Text style={styles.headerDate}>{new Date(event.date).toLocaleDateString('en-GB')}</Text>
                    </View>
                    <ScrollView contentContainerStyle={styles.mainContainer}>
                        {event.description ? (
                            editMode ? (
                                <TextInput
                                    style={styles.input}
                                    value={event.description}
                                    onChangeText={(text) => setEvent({ ...event, description: text })}
                                    placeholder="Description"
                                />
                            ) : (
                                <Text style={styles.description}>{event.description}</Text>
                            )
                        ) : null}
                        {event.notes ? (
                            editMode ? (
                                <TextInput
                                    style={styles.input}
                                    value={event.notes}
                                    onChangeText={(text) => setEvent({ ...event, notes: text })}
                                    placeholder="Notes"
                                />
                            ) : (
                                <Text style={styles.notes}>{event.notes}</Text>
                            )
                        ) : null}
                        <View style={styles.divider} />

                        {hasFinancialDetails || editMode ? (
                            <>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Starting Cash</Text>
                                    {editMode ? (
                                        <TextInput
                                            style={styles.valueInput}
                                            value={startingCash}
                                            onChangeText={setStartingCash}
                                            keyboardType="numeric"
                                        />
                                    ) : (
                                        <Text style={styles.value}>${event.startingCash || '0'}</Text>
                                    )}
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Earning (Cash)</Text>
                                    {editMode ? (
                                        <TextInput
                                            style={styles.valueInput}
                                            value={earningCash}
                                            onChangeText={setEarningCash}
                                            keyboardType="numeric"
                                        />
                                    ) : (
                                        <Text style={styles.value}>${event.earningCash || '0'}</Text>
                                    )}
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Earning (Bank)</Text>
                                    {editMode ? (
                                        <TextInput
                                            style={styles.valueInput}
                                            value={earningBank}
                                            onChangeText={setEarningBank}
                                            keyboardType="numeric"
                                        />
                                    ) : (
                                        <Text style={styles.value}>${event.earningBank || '0'}</Text>
                                    )}
                                </View>
                            </>
                        ) : (
                            <Text style={styles.noFinancialDetailsText}>No financial details</Text>
                        )}

                        <View style={styles.divider} />

                        <View style={styles.row}>
                            <Text style={styles.label}>Total Earning</Text>
                            <Text style={styles.value}>${parseFloat(earningCash) + parseFloat(earningBank)}</Text>
                        </View>

                        {editMode && (
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEarnings}>
                                <Text style={styles.saveButtonText}>Save Earnings</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => setEditMode(!editMode)}
                    >
                        <Ionicons name="pencil" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );

};

export default EventDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
    },
    inner: {
        flex: 1,
        justifyContent: 'space-between',
    },
    backButton: {
        position: 'absolute',
        top: 30,
        left: 10,
        zIndex: 1,
        padding: 10,
    },
    backButtonText: {
        fontSize: 24,
        color: '#fff',
    },
    headerContainer: {
        backgroundColor: '#194569',
        paddingTop: "20%",
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        alignItems: 'center',
    },
    mainContainer: {
        padding: 20,
        flexGrow: 1,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerDate: {
        fontSize: 16,
        color: '#fff',
    },
    description: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    notes: {
        fontSize: 16,
        color: '#888',
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    label: {
        fontSize: 18,
        color: '#333',
    },
    value: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    valueInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        width: 100,
        textAlign: 'right',
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
    noFinancialDetailsText: {
        fontSize: 18,
        color: '#888',
        textAlign: 'center',
        marginVertical: 20,
    },
    editButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#194569',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#194569',
    },
});
