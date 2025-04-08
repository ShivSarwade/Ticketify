import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {deleteEvent} from '../../../API/organiser.api';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const Event = ({route, navigation}) => {
  const {event} = route.params;
  const [showMore, setShowMore] = useState(false);

  const DeleteEvent = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this event?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const organiserAccessToken = await AsyncStorage.getItem('organiserAuthToken');
              if (!organiserAccessToken) {
                throw new Error('No access token found');
              }
    
              const response = await deleteEvent(organiserAccessToken, event._id);
              if (response) {
                Alert.alert('Success', 'Event deleted successfully', [
                  { text: 'OK', onPress: () => navigation.goBack() },
                ]);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete event. Please try again.');
            }
          },
        },
      ]
    );
  };
  

  return (
    <ScrollView style={styles.container}>
      {/* Event Poster */}
      <Image source={{uri: event.poster}} style={styles.poster} />

      {/* Event Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{event.name}</Text>
        <Text style={styles.category}>{capitalize(event.category)}</Text>

        {/* Location */}
        <InfoRow icon="location-on" color="#D32F2F" text={event.location} />
        {/* Deep Red (700) */}

        {/* Date & Time */}
        <InfoRow
          icon="event"
          color="#1976D2"
          text={formatDate(event.startingDate)}
        />
        {/* Bright Blue (700) */}
        <InfoRow
          icon="access-time"
          color="#388E3C"
          text={`${formatTime(event.startingTime)} - ${formatTime(
            event.endingTime,
          )}`}
        />
        {/* Vibrant Green (700) */}

        {/* Tickets & Price */}
        <InfoRow
          icon="confirmation-number"
          color="#FFA000"
          text={`${event.ticketsAvailable} Tickets Left`}
        />
        {/* Amber (700) */}
        <InfoRow
          iconComponent={FontAwesome6}
          icon="indian-rupee-sign"
          color="#7B1FA2"
          text={`₹${event.price}`}
        />

        {/* Purple (700) */}

        {/* Event Description */}
        <Text style={styles.descriptionHeading}>Description</Text>
        <Text
          style={styles.description}
          numberOfLines={showMore ? undefined : 3}>
          {event.description}
        </Text>
        <TouchableOpacity onPress={() => setShowMore(!showMore)}>
          <Text style={styles.showMoreText}>
            {showMore ? 'Show Less' : 'Show More'}
          </Text>
        </TouchableOpacity>

        {/* Buttons */}
        <ActionButton
          text="Edit Event"
          icon="edit"
          color="#E65100"
          backgroundColor="#FFEDD6"
          onPress={() => {
            new Date(event.ticketSellingDate).getTime() > Date.now()
              ? navigation.navigate('EditEvent', {event})
              : Alert.alert('Cannot edit event after ticket selling date.');
          }}
        />

        <ActionButton
          text="Delete Event"
          icon="delete"
          color="#B71C1C"
          backgroundColor="#FFCDD2"
          onPress={DeleteEvent}
        />

        <ActionButton
          text="View Location"
          icon="place"
          color="#0D47A1"
          backgroundColor="#D3EBFF"
          onPress={() => {
            event.locationUrl
              ? Linking.openURL(event.locationUrl)
              : Alert.alert('Location URL not available.');
          }}
        />
      </View>
    </ScrollView>
  );
};

// **Reusable Component for Info Rows**
const InfoRow = ({icon, color, text, iconComponent: IconComponent = Icon}) => (
  <View style={styles.metaRow}>
    <View style={[styles.iconContainer, {backgroundColor: `${color}20`}]}>
      <IconComponent name={icon} size={20} color={color} />
    </View>
    <Text style={styles.metaText}>{text}</Text>
  </View>
);

// **Reusable Component for Buttons**
const ActionButton = ({text, icon, color, backgroundColor, onPress}) => (
  <TouchableOpacity
    style={[styles.button, {backgroundColor}]}
    onPress={onPress}>
    <View style={styles.buttonContent}>
      <Icon name={icon} size={20} color={color} />
      <Text style={[styles.buttonText, {color}]}>{text}</Text>
    </View>
  </TouchableOpacity>
);

// **Helper Functions**
const formatDate = dateStr => new Date(dateStr).toDateString();
const formatTime = timeStr =>
  new Date(timeStr).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

// **Styles**
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F6F7FB'},
  poster: {
    width: '100%',
    height: 280,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  infoContainer: {padding: 20},
  name: {fontSize: 24, fontWeight: 'bold', color: '#1A1A1A'},
  category: {fontSize: 16, color: '#6C757D', marginVertical: 5},
  metaRow: {flexDirection: 'row', alignItems: 'center', marginVertical: 5},
  metaText: {fontSize: 16, color: '#343A40', marginLeft: 10},
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 10,
  },
  description: {fontSize: 16, color: '#555', marginVertical: 10},
  showMoreText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonContent: {flexDirection: 'row', alignItems: 'center', gap: 8},
  buttonText: {fontSize: 16, fontWeight: 'bold'},
});

export default Event;
