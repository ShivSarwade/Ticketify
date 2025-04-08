import React, { useState, useEffect } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { searchEventsByNameOrLocation, getEventsByLocation, getAllFutureEvents } from '../../API/user.api';

const { width } = Dimensions.get('window');

const Home = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [localEvents, setLocalEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);

  const userData = useSelector(state => state.currentUser?.user);
  const userCity = userData?.address || '';

  useEffect(() => {
    const fetchEvents = async () => {
      if (searchText.trim() === '') {
        setFilteredEvents([]);
        return;
      }

      try {
        const events = await searchEventsByNameOrLocation(searchText);
        console.log(events);
        setFilteredEvents(events ? events : []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setFilteredEvents([]);
      }
    };

    fetchEvents();
  }, [searchText]);

  useEffect(() => {
    const fetchLocalEvents = async () => {
      if (userCity) {
        try {
          const events = await getEventsByLocation(userCity);
          console.log(events);
          setLocalEvents(events);
        } catch (error) {
          console.error('Error fetching local events:', error);
          setLocalEvents([]);
        }
      }
    };

    fetchLocalEvents();
  }, [userCity]);

  useEffect(() => {
    const fetchRecommendedEvents = async () => {
      try {
        const events = await getAllFutureEvents();
        console.log(events);
        setRecommendedEvents(events);
      } catch (error) {
        console.error('Error fetching recommended events:', error);
        setRecommendedEvents([]);
      }
    };

    fetchRecommendedEvents();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore Events</Text>
        <Text style={styles.subtitle}>Find events near you</Text>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or location..."
        placeholderTextColor="#666"
        value={searchText}
        onChangeText={text => setSearchText(text)}
      />

      {/* Events List */}
      <View style={styles.eventsSection}>
        {searchText.length !== 0 && <Text style={styles.sectionTitle}>Available Events</Text>}
        {searchText.length > 0 && filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <EventCard key={event._id} event={event} navigation={navigation} />
          ))
        ) : searchText.length > 0 ? (
          <Text style={styles.noResults}>No events found</Text>
        ) : null}
      </View>

      {/* Events in Your City */}
      {userCity && localEvents.length > 0 && (
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Events in {userCity} city</Text>
          {localEvents.map(event => (
            <EventCard key={event._id} event={event} navigation={navigation} />
          ))}
        </View>
      )}

      {/* Recommended Events (All Future Events) */}
      {recommendedEvents.length > 0 && (
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Recommended Events</Text>
          {recommendedEvents.map(event => (
            <EventCard key={event._id} event={event} navigation={navigation} />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const EventCard = ({ event, navigation }) => (
  <View style={styles.eventItem}>
    <Image source={{ uri: event.poster }} style={styles.eventImage} />
    <Text style={styles.eventName}>{event.name}</Text>
    <Text style={styles.eventLocation}>📍 {event.location}</Text>
    <Text style={styles.eventDate}>Date: {new Date(event.startingDate).toDateString()}</Text>
    <Text style={styles.eventCost}>Price: ₹{event.price}</Text>
    <View style={styles.eventButtons}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Event', { event })}>
        <Text style={styles.buttonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 40,
    marginBottom: 24,
    textAlign: 'center',
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  searchInput: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  eventsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  eventItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  eventLocation: {
    fontSize: 14,
    color: '#555',
  },
  eventDate: {
    fontSize: 14,
    color: '#888',
  },
  eventCost: {
    fontSize: 16,
    color: '#0070f3',
    marginTop: 5,
  },
  noResults: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 10,
  },
  eventButtons: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#0070f3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
