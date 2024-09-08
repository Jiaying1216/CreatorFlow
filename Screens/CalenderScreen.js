import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { firebase } from '../config';
import { Ionicons } from '@expo/vector-icons';

const CalendarScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); 
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const userId = firebase.auth().currentUser.uid;
    const eventsRef = firebase.firestore().collection('users').doc(userId).collection('events');

    const unsubscribe = eventsRef.onSnapshot((snapshot) => {
      const eventList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventList);
    });

    return () => unsubscribe();
  }, []);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const renderEvent = ({ item }) => (
    <View style={styles.eventContainer}>
      <View style={[styles.iconContainer, { backgroundColor: item.color || '#194569' }]}>
        <Ionicons name="calendar" size={24} color="#fff" />
      </View>
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventTime}>
          {item.allDay ? 'All Day' : `${new Date(item.startDate).toLocaleTimeString()} - ${new Date(item.endDate).toLocaleTimeString()}`}
        </Text>
      </View>
    </View>
  );

  const markedDates = events.reduce((acc, event) => {
    acc[event.date] = {
      marked: true,
      dotColor: event.color || '#194569',
      ...(event.date === selectedDate && { selected: true, selectedColor: '#194569' }),
    };
    return acc;
  }, {});

  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: '#194569',
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Today</Text>
        <Text style={styles.headerDate}>{new Date(selectedDate).toDateString()}</Text>
      </View>

      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: '#194569',
          arrowColor: '#194569',
        }}
        style={styles.calendar}
      />

      <FlatList
        data={events.filter(event => event.date === selectedDate)}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.noEventText}>No events for this day</Text>}
      />

      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('CreateEventScreen')}>
          <Text style={styles.footerButtonText}>New Event</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('CreateTaskScreen')}>
          <Text style={styles.footerButtonText}>Add Tasks</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
  },
  headerContainer: {
    backgroundColor: '#194569',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: '600', 
    color: '#FFFFFF', 
  },
  headerDate: {
    fontSize: 16,
    color: '#B0BEC5', 
    marginTop: 5,
  },
  calendar: {
    marginVertical: 20,
    borderRadius: 10, 
    overflow: 'hidden', 
  },
  eventContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA', 
    padding: 15,
    borderRadius: 12, 
    marginBottom: 10,
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
  },
  eventIcon: {
    fontSize: 24, 
    color: '#FFFFFF',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333', 
  },
  eventTime: {
    color: '#757575',
    marginTop: 5,
    fontSize: 14,
  },
  noEventText: {
    textAlign: 'center',
    color: '#757575',
    marginTop: 20,
    fontSize: 16,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1, 
    borderTopColor: '#E0E0E0', 
  },
  footerButton: {
    backgroundColor: '#194569', 
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
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