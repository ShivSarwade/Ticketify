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
  TextInput,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { purchaseTicket } from '../../../API/ticket.api';
const Event = ({route}) => {
  const {event} = route.params;
  const [showMore, setShowMore] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);

  // Dummy ticket data
  const totalTickets = event.ticketsAvailable;
  const remainingTickets = event.ticketsAvailable - event.ticketsSold;

  const handlePurchase = async () => {
    if (ticketCount <= 0) {
      Alert.alert("Invalid Quantity", "Please select at least one ticket.");
      return;
    }
  
    if (ticketCount > remainingTickets) {
      setTicketCount(remainingTickets);
      Alert.alert("Limited Availability", `Only ${remainingTickets} tickets left.`);
      return;
    }
  
    try {
      const userAuthToken = await AsyncStorage.getItem("userAuthToken");
      if (!userAuthToken) {
        Alert.alert("Unauthorized", "You must be logged in to purchase tickets.");
        return;
      }
  
      const response = await purchaseTicket(userAuthToken, event._id, ticketCount);
      console.log(response);
  
      if (response?.ticket) {
        Alert.alert("Success", `You purchased ${ticketCount} ticket(s).`);
      } else {
        throw new Error(response?.message || "Purchase failed");
      }
    } catch (error) {
      console.error("Ticket Purchase Error:", error);
      Alert.alert("Error", error.message || "Something went wrong while purchasing tickets.");
    }
  };
  
  

  return (
    <ScrollView style={styles.container}>
      {/* Event Poster */}
      <Image source={{uri: event.poster}} style={styles.poster} />

      <View style={styles.infoContainer}>
        {/* Event Name & Category */}
        <Text style={styles.name}>{event.name}</Text>
        <Text style={styles.category}>{capitalize(event.category)}</Text>

        {/* Organizer Info */}
        <SectionHeading title="Organizer" />
        <View style={styles.organizerContainer}>
          <Image
            source={{uri: event.organizer.avatar}}
            style={styles.organizerAvatar}
          />
          <Text style={styles.organizerName}>{event.organizer.fullName}</Text>
        </View>

        {/* Event Details */}
        <SectionHeading title="Event Details" />
        <InfoRow icon="location-on" color="#D32F2F" text={event.location} />
        <InfoRow
          icon="event"
          color="#1976D2"
          text={`From ${formatDate(event.startingDate)} to ${formatDate(
            event.endingDate,
          )}`}
        />
        <InfoRow
          icon="access-time"
          color="#388E3C"
          text={`${formatTime(event.startingTime)} - ${formatTime(
            event.endingTime,
          )}`}
        />

        {/* Ticket Details */}
        <SectionHeading title="Tickets" />
        <InfoRow
          iconComponent={FontAwesome6}
          icon="indian-rupee-sign"
          color="#7B1FA2"
          text={`₹${event.price}`}
        />
        <InfoRow
          icon="confirmation-number"
          color="#E65100"
          text={`Total Tickets: ${totalTickets}`}
        />
        <InfoRow
          icon="event-seat"
          color="#FF5733"
          text={`Available Tickets: ${remainingTickets}`}
        />

        {/* Description */}
        <SectionHeading title="Description" />
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

        {/* Action Buttons */}
        <SectionHeading title="Actions" />
        <ActionButton
          text="Buy Ticket"
          icon="confirmation-number"
          color="#E65100"
          backgroundColor="#FFEDD6"
          onPress={() => setDrawerOpen(true)}
        />
        <ActionButton
          text="View Location"
          icon="place"
          color="#0D47A1"
          backgroundColor="#D3EBFF"
          onPress={() =>
            event.locationUrl
              ? Linking.openURL(event.locationUrl)
              : Alert.alert('Location URL not available.')
          }
        />
      </View>

      <Modal
        isVisible={isDrawerOpen}
        onBackdropPress={() => setDrawerOpen(false)}
        onSwipeComplete={() => setDrawerOpen(false)}
        swipeDirection="down"
        style={styles.modalContainer}
        onModalWillShow={() => setTicketCount(1)} // Reset ticket count when modal opens
      >
        <View style={styles.drawerContent}>
          {/* Modal Header */}
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Purchase Tickets</Text>
            <TouchableOpacity onPress={() => setDrawerOpen(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Ticket Info */}
          <InfoRow
            icon="confirmation-number"
            color="#FF5733"
            text={`Total Tickets: ${totalTickets}`}
          />
          <InfoRow
            icon="event-seat"
            color="#4A90E2"
            text={`Available Tickets: ${remainingTickets}`}
          />

          {/* Ticket Input */}
          <Text style={styles.drawerText}>Enter Number of Tickets</Text>
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={[
                styles.adjustButton,
                ticketCount <= 1 && styles.disabledButton,
              ]}
              onPress={() => setTicketCount(Math.max(1, ticketCount - 1))}
              disabled={ticketCount <= 1}>
              <Icon name="remove" size={20} color="#FFF" />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={ticketCount.toString()}
              onChangeText={value => {
                let num = parseInt(value);
                if (isNaN(num) || num < 1) num = 1;
                else if (num > remainingTickets) num = remainingTickets;
                setTicketCount(num);
              }}
              textAlign="center"
            />

            <TouchableOpacity
              style={[
                styles.adjustButton,
                ticketCount >= remainingTickets && styles.disabledButton,
              ]}
              onPress={() =>
                setTicketCount(Math.min(remainingTickets, ticketCount + 1))
              }
              disabled={ticketCount >= remainingTickets}>
              <Icon name="add" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.drawerButton,
              {
                backgroundColor:
                  remainingTickets === 0 ? '#FCE4EC80' : '#FCE4EC',
                opacity: remainingTickets === 0 ? 0.5 : 1,
              },
            ]}
            onPress={handlePurchase}
            disabled={remainingTickets === 0}>
            <View style={styles.drawerButtonContent}>
              <Icon name="confirmation-number" size={20} color="#D81B60" />
              <Text style={[styles.drawerButtonText, {color: '#D81B60'}]}>
                Confirm Purchase
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

// **Reusable Components**
const InfoRow = ({icon, color, text, iconComponent: IconComponent = Icon}) => (
  <View style={styles.metaRow}>
    <View style={[styles.iconContainer, {backgroundColor: `${color}20`}]}>
      <IconComponent name={icon} size={20} color={color} />
    </View>
    <Text style={styles.metaText}>{text}</Text>
  </View>
);

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

const SectionHeading = ({title}) => (
  <Text style={styles.sectionHeading}>{title}</Text>
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
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 15,
  },

  metaRow: {flexDirection: 'row', alignItems: 'center', marginVertical: 5},
  metaText: {fontSize: 16, color: '#343A40', marginLeft: 10},
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  description: {fontSize: 16, color: '#555', marginVertical: 10},
  showMoreText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
    marginVertical: 5,
  },

  button: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonContent: {flexDirection: 'row', alignItems: 'center', gap: 8},
  buttonText: {fontSize: 16, fontWeight: 'bold'},

  modalContainer: {justifyContent: 'flex-end', margin: 0},
  drawerContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerTitle: {fontSize: 20, fontWeight: 'bold'},
  drawerButton: {
    backgroundColor: '#FFEDD6', // Same as "Buy Ticket" button background
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },

  drawerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  drawerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100', // Same as "Buy Ticket" text color
  },

  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  organizerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  organizerName: {fontSize: 16, fontWeight: '600', color: '#333'},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E65100',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 8,
  },

  adjustButton: {
    backgroundColor: '#E65100', // 🔥 Custom color for contrast
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    backgroundColor: '#BDBDBD', // Gray when disabled
  },
});

export default Event;
