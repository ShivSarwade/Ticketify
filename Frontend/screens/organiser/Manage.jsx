import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {getTicketsByEventId} from '../../API/ticket.api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Manage = ({route, navigation}) => {
  const eventId = route.params;
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleScanTicket = async () => {
    if (eventData.transactions.length === 0) {
      Alert.alert(
        'No Tickets Sold',
        'Scan of tickets is not practically possible.',
      );
    } else {
      navigation.navigate('ScanTickets', eventData);
    }
  };

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('organiserAuthToken');

      const response = await getTicketsByEventId(token, eventId);
      console.log('API Response:', response);

      if (response.error) {
        setEventData(null);
      } else {
        setEventData({
          ...response,
          transactions: response.transactions || [],
        });
        
      }
      setLoading(false);
    };

    fetchTickets();
  }, [eventId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!eventData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No transaction has been made yet</Text>
      </View>
    );
  }

  const scannedTickets = eventData.transactions.filter(
    ticket => ticket.scanned,
  );
  console.log(scannedTickets);
  const notScannedTickets = eventData.transactions.filter(
    ticket => !ticket.scanned,
  );
  console.log(notScannedTickets);
  return (
    <View style={styles.container}>
      {/* Event Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.eventName}>Report</Text>
        <Text style={styles.eventName}>{eventData.eventName}</Text>
        <Text style={styles.eventDetail}>
          📅 {new Date(eventData.eventDate).toLocaleString()}
        </Text>
        <Text style={styles.summaryText}>
          💰 Total Revenue: ₹{eventData.totalRevenue}
        </Text>
        <Text style={styles.summaryText}>
          🎟️ Tickets Sold: {eventData.totalTicketsSold}
        </Text>
        <Text style={styles.summaryText}>
          🟢 Remaining Tickets: {eventData.remainingTickets}
        </Text>
      </View>

      {/* Scanned Tickets */}
      <Text style={styles.sectionHeader}>
        ✅ Scanned Tickets ({scannedTickets.length})
      </Text>
      <FlatList
        data={scannedTickets}
        keyExtractor={item => item._id}
        renderItem={({item}) => (
          <View style={styles.transactionItem}>
            <Image source={{uri: item.userAvatar}} style={styles.avatar} />
            <View>
              <Text style={styles.userName}>{item.fullName}</Text>
              <Text style={styles.phoneNo}>{item.phoneNo}</Text>
              <Text style={styles.amount}>
                Quantity: {item.quantity} | ₹{item.totalPrice}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Not Scanned Tickets */}
      <Text style={styles.sectionHeader}>
        ❌ Not Scanned Tickets ({notScannedTickets.length})
      </Text>
      <FlatList
        data={notScannedTickets}
        keyExtractor={item => item._id}
        renderItem={({item}) => (
          <View style={styles.transactionItem}>
            <Image source={{uri: item.userAvatar}} style={styles.avatar} />
            <View>
              <Text style={styles.userName}>{item.fullName}</Text>
              <Text style={styles.phoneNo}>{item.phoneNo}</Text>
              <Text style={styles.amount}>
                Quantity: {item.quantity} | ₹{item.totalPrice}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Scan Button */}
      <TouchableOpacity style={styles.scanButton} onPress={handleScanTicket}>
        <Text style={styles.scanButtonText}>Scan Ticket</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Manage;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 15, backgroundColor: '#F5F5F5'},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {fontSize: 18, fontWeight: 'bold', color: '#333'},
  summaryBox: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  eventName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  eventDetail: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  summaryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  avatar: {width: 40, height: 40, borderRadius: 20, marginRight: 10},
  userName: {fontSize: 16, fontWeight: 'bold'},
  amount: {fontSize: 14, fontWeight: 'bold', color: '#333'},
  scanButton: {
    backgroundColor: '#28A745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  scanButtonText: {color: '#FFF', fontSize: 16, fontWeight: 'bold'},
});
