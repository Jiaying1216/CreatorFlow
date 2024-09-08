import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FIREBASE_AUTH, FIREBASE_DB, FIREBASE_STORAGE } from '../firebase';
import { getDoc, doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../config';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [eventsJoined, setEventsJoined] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const userId = FIREBASE_AUTH.currentUser.uid;

  useEffect(() => {
    const fetchData = async () => {
      const userDoc = await getDoc(doc(FIREBASE_DB, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.username || '');
        setProfileImage(userData.profilePhotoURL || null);
      }
  
      const tasksQuery = query(collection(FIREBASE_DB, 'users', userId, 'tasks'), where('status', '==', 'Done'));
      const tasksSnapshot = await getDocs(tasksQuery);
      setTasksCompleted(tasksSnapshot.size);
  
      const eventsSnapshot = await getDocs(collection(FIREBASE_DB, 'users', userId, 'events'));
      setEventsJoined(eventsSnapshot.size);
  
      const currentDate = new Date();
  
      const upcoming = eventsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(event => {
          const eventDate = new Date(event.date); 
          console.log(eventDate);
          return eventDate >= currentDate; 
        })
        .slice(0, 3); 
  
      setUpcomingEvents(upcoming);
      console.log("Upcoming events: ", upcoming);
    };
  
    fetchData();
  }, [userId]);
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(FIREBASE_STORAGE, `profilePhotos/${userId}.jpg`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      setProfileImage(downloadURL);

      await setDoc(doc(FIREBASE_DB, 'users', userId), { profilePhotoURL: downloadURL }, { merge: true });

      alert('Profile image updated successfully!');
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderEvent = ({ item }) => (
    <View style={styles.eventItem}>
      <Ionicons name="calendar" size={24} color="#194569" style={styles.eventIcon} />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
      </View>
    </View>
  );

  const handleLogout = async () => {
    try {
      await firebase.auth().signOut(); 
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.iconContainer}>
              <Ionicons name="person-outline" size={60} color="#194569" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.bodyContainer}>
        <Text style={styles.username}>{userName}</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Tasks Completed</Text>
          <Text style={styles.infoValue}>{tasksCompleted}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Events Joined</Text>
          <Text style={styles.infoValue}>{eventsJoined}</Text>
        </View>

        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <FlatList
            data={upcomingEvents}
            keyExtractor={(item) => item.id}
            renderItem={renderEvent}
            ListEmptyComponent={<Text style={styles.noEventText}>No upcoming events</Text>}
          />
        </View>
      </View>

      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    backgroundColor: '#194569',
    height: 200, 
    justifyContent: 'flex-end', 
    alignItems: 'center',
    paddingBottom: 40, 
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#194569',
    borderWidth: 2,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#194569',
  },
  bodyContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -30, 
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#194569',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  infoTitle: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  eventsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  eventIcon: {
    marginRight: 15,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  eventDate: {
    color: '#757575',
    fontSize: 14,
    marginTop: 2,
  },
  noEventText: {
    textAlign: 'center',
    color: '#757575',
    fontSize: 16,
    marginTop: 20,
  },
  footerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  logoutButton: {
    backgroundColor: '#194569',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Profile;