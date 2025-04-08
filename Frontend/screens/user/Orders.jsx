import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Modal, ScrollView 
} from 'react-native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import { getMyTickets, returnTicket } from '../../API/ticket.api';
import { useFocusEffect } from '@react-navigation/native';

const Orders = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const userData = useSelector(state => state.currentUser?.user);
  const today = new Date();

  useFocusEffect(
    useCallback(() => {
      const fetchTickets = async () => {
        try {
          const token = await AsyncStorage.getItem('userAuthToken');
          if (!token) return;

          const fetchedTickets = await getMyTickets(token);
          if (fetchedTickets.error) {
            console.error('Error fetching tickets:', fetchedTickets.error);
            setTickets([]);
          } else {
            setTickets(fetchedTickets.tickets || []);
          }
        } catch (error) {
          console.error('Unexpected error fetching tickets:', error);
          setTickets([]);
        } finally {
          setLoading(false);
        }
      };

      fetchTickets();
    }, [])
  );

  // Function to format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toDateString();
  };

  // Split tickets into Past, Today, and Future
  const pastEvents = tickets.filter(ticket => new Date(ticket.eventDetails.startingDate) < today);
  const todayEvents = tickets.filter(ticket => 
    new Date(ticket.eventDetails.startingDate).toDateString() === today.toDateString()
  );
  const futureEvents = tickets.filter(ticket => new Date(ticket.eventDetails.startingDate) > today);

  // Function to handle ticket return
  const handleReturnTicket = async (ticketId) => {
    try {
      const token = await AsyncStorage.getItem('userAuthToken');
      if (!token) return;

      const response = await returnTicket(token, ticketId);
      console.log(response)
      if (response.message) {
        setTickets(prevTickets => prevTickets.filter(ticket => ticket.ticket._id !== ticketId));
        setSelectedTicket(null);
      } else {
        console.error('Error returning ticket:', response.error);
      }
    } catch (error) {
      console.error('Unexpected error returning ticket:', error);
    }
  };

  // Render Ticket Card
  const renderTicketCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelectedTicket(item)}>
      <Image source={{ uri: item.eventDetails.poster }} style={styles.poster} />
      <View style={styles.cardContent}>
        <Text style={styles.eventName}>{item.eventDetails.name}</Text>
        <Text style={styles.eventDate}>📅 {formatDate(item.eventDetails.startingDate)}</Text>
        <Text style={styles.eventLocation}>📍 {item.eventDetails.location}</Text>
        <Text style={styles.eventLocation}>💺 {item.ticket.quantity}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render Ticket Details Modal
  const renderTicketDetails = () => (
    <Modal visible={!!selectedTicket} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => setSelectedTicket(null)} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
  
          {selectedTicket && (
            <>
              {/* Event Poster */}
              <Image source={{ uri: selectedTicket.eventDetails.poster }} style={styles.modalPoster} />
              <Text style={styles.modalEventName}>{selectedTicket.eventDetails.name}</Text>
              <Text style={styles.modalDate}>📅 {formatDate(selectedTicket.eventDetails.startingDate)}</Text>
              <Text style={styles.modalLocation}>📍 {selectedTicket.eventDetails.location}</Text>
              <Text style={styles.modalPrice}>💲 Price: {selectedTicket.ticket.totalPrice} INR</Text>
              <Text style={styles.modalPrice}>🎫 ticket quantity: {selectedTicket.ticket.quantity} tickets</Text>
  
              {/* QR Code */}
              <View style={styles.qrContainer}>
                <QRCode value={selectedTicket.ticket._id} size={150} />
              </View>
  
              {/* 🔥 New Organized By Section */}
              <View style={styles.organizerContainer}>
                <Image 
                  source={{ uri: selectedTicket.eventDetails.organizerDetails.avatar }} 
                  style={styles.organizerAvatar} 
                />
                <Text style={styles.organizerName}>{selectedTicket.eventDetails.organizerDetails.fullName}</Text>
              </View>
  
              {/* Show "Return Ticket" button ONLY for future events */}
              {new Date(selectedTicket.eventDetails.startingDate) > today && (
                <TouchableOpacity 
                  style={styles.returnButton} 
                  onPress={() => {console.log(selectedTicket.ticket._id)
                    handleReturnTicket(selectedTicket.ticket._id)}}
                >
                  <Text style={styles.returnButtonText}>Return Ticket</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
  
  if (loading) {
    return <ActivityIndicator size="large" color="#222" style={styles.loader} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>🎟 My Tickets</Text>

      {pastEvents.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>📅 Past Events</Text>
          <FlatList data={pastEvents} keyExtractor={item => item.ticket._id} renderItem={renderTicketCard} />
        </>
      )}

      {todayEvents.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>📍 Today's Events</Text>
          <FlatList data={todayEvents} keyExtractor={item => item.ticket._id} renderItem={renderTicketCard} />
        </>
      )}

      {futureEvents.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>🚀 Upcoming Events</Text>
          <FlatList data={futureEvents} keyExtractor={item => item.ticket._id} renderItem={renderTicketCard} />
        </>
      )}

      {tickets.length === 0 && <Text style={styles.noTicketsText}>No Tickets Found</Text>}

      {renderTicketDetails()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  mainTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  card: { backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 10, flexDirection: 'row' },
  poster: { width: 100, height: 100, borderRadius: 8 },
  cardContent: { padding: 10, flex: 1 },
  eventName: { fontSize: 16, fontWeight: 'bold' },
  eventDate: { fontSize: 14, color: '#555' },
  eventLocation: { fontSize: 14, color: '#777' },
  loader: { marginTop: 50 },
  noTicketsText: { textAlign: 'center', fontSize: 18, marginTop: 50, color: '#777' },

  // Modal Styles
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '90%', backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' },
  closeButton: { position: 'absolute', top: 10, right: 10, zIndex: 10 },
  closeText: { fontSize: 24, color: '#555' },
  modalPoster: { width: '100%', height: 180, borderRadius: 8, marginBottom: 10 },
  returnButton: { backgroundColor: 'red', padding: 10, borderRadius: 5, marginTop: 10 },
  returnButtonText: { color: 'white', fontWeight: 'bold' },
  organizerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    padding: 8,
    borderRadius: 8,
    marginTop: 15,
    width: "90%",
    alignSelf: "center",
  },
  organizerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  organizerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
  },
});

export default Orders;
