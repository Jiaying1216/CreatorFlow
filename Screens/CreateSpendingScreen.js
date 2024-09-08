import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';
import { firebase } from '../config';

const AddSpendingScreen = ({ navigation }) => {
    const [itemName, setItemName] = useState('');
    const [category, setCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [shippingFee, setShippingFee] = useState('');
    const [quantity, setQuantity] = useState('');
    const [totalSpending, setTotalSpending] = useState('');
    const [costPerItem, setCostPerItem] = useState('');

    const calculateTotal = () => {
        const total = parseFloat(costPrice) + parseFloat(shippingFee);
        setTotalSpending(total.toFixed(2));

        if (quantity > 0) {
            const perItemCost = total / parseFloat(quantity);
            setCostPerItem(perItemCost.toFixed(2));
        }
    };

    const createSpendingDetails = () => {
        const userId = firebase.auth().currentUser.uid;
        const spendingData = {
            itemName,
            category: category === 'Other' ? customCategory : category,
            costPrice: parseFloat(costPrice) || 0,
            shippingFee: parseFloat(shippingFee) || 0,
            quantity: parseInt(quantity) || 0,
            totalSpending: parseFloat(totalSpending) || 0,
            costPerItem: parseFloat(costPerItem) || 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('spending')
            .add(spendingData)
            .then(() => {
                alert('Spending added successfully');
                navigation.goBack();
            })
            .catch((error) => {
                alert('Error', error.message);
            });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.innerContainer}>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={24} color="#fff" />
                            <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.header}>Add Spending</Text>
                    </View>

                    <View style={styles.contentContainer}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Item Name"
                                value={itemName}
                                onChangeText={setItemName}
                            />

                            <Text style={styles.label}>Category</Text>
                            <View style={styles.pickerContainer}>
                                <RNPickerSelect
                                    onValueChange={(itemValue) => setCategory(itemValue)}
                                    items={[
                                        { label: 'Booth', value: 'Booth' },
                                        { label: 'Products', value: 'Products' },
                                        { label: 'Marketing', value: 'Marketing' },
                                        { label: 'Other', value: 'Other' },
                                    ]}
                                    style={pickerSelectStyles}
                                    placeholder={{ label: 'Select a category...', value: '' }}
                                    value={category}
                                    useNativeAndroidPickerStyle={false} 
                                />
                            </View>

                            {category === 'Other' && (
                                <TextInput
                                    style={styles.input}
                                    placeholder="Custom Category"
                                    value={customCategory}
                                    onChangeText={setCustomCategory}
                                />
                            )}

                            <TextInput
                                style={styles.input}
                                placeholder="Cost Price"
                                value={costPrice}
                                onChangeText={setCostPrice}
                                keyboardType="numeric"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Shipping Fee"
                                value={shippingFee}
                                onChangeText={setShippingFee}
                                keyboardType="numeric"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Quantity"
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="numeric"
                            />

                            <TouchableOpacity style={styles.calculateButton} onPress={calculateTotal}>
                                <Text style={styles.calculateButtonText}>Calculate</Text>
                            </TouchableOpacity>

                            <View style={styles.resultContainer}>
                                <Text style={styles.resultText}>Total Spending: ${totalSpending}</Text>
                                <Text style={styles.resultText}>Cost Price per Item: ${costPerItem}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.footerContainer}>
                        <TouchableOpacity style={styles.saveButton} onPress={createSpendingDetails}>
                            <Text style={styles.saveButtonText}>Save Spending</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default AddSpendingScreen;

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
    pickerContainer: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        overflow: 'hidden',
    },
    calculateButton: {
        backgroundColor: '#194569',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 20,
    },
    calculateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultContainer: {
        marginBottom: 20,
    },
    resultText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
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

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30, 
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: '#ccc',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30, 
    },
});
