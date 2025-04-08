import React, {useEffect, useState} from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getSecuredEventsByOrganiserId} from '../../API/organiser.api';
import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {Dimensions} from 'react-native';
const {width, height} = Dimensions.get('window');
import {getAllTickets} from '../../API/ticket.api';

// Sample data

const Home = ({navigation}) => {
  const [events, setEvents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTransactions,setTotalTransactions] = useState(0)
  const [totalTicketsSold,setTotalTicketsSold] = useState(0)
  useFocusEffect(
    useCallback(() => {
      const getOrganiserEvents = async () => {
        const organiserAuthToken = await AsyncStorage.getItem(
          'organiserAuthToken',
        );
        try {
          const response = await getSecuredEventsByOrganiserId(
            organiserAuthToken,
          );
          if (response.error) {
            console.log('Error fetching events');
          } else {
            console.log('Fetched events:', response);
            setEvents(response);
          }
        } catch (error) {
          console.log('Error occurred:', error);
        }
      };
      const getalltransactions = async () => {
        try {
          const res = await getAllTickets();
          console.log(res); // Set only the tickets array

          if (res && res.tickets) {
            setTransactions(res.tickets);
            setTotalRevenue(res.totalRevenue)
            setTotalTransactions(res.tickets.length)
            setTotalTicketsSold(res.totalTickets)
          } else {
            console.log('Invalid response format', res);
          }
        } catch (error) {
          console.log('Error fetching transactions:', error);
        }
      };

      getalltransactions();
      getOrganiserEvents();
    }, []),
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Organizer Dashboard</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statTitle}>Transactions</Text>
          <Text style={styles.statValue}>{totalTransactions}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statTitle}>Tickets Sold</Text>
          <Text style={styles.statValue}>{totalTicketsSold}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statTitle}>Revenue</Text>
          <Text style={styles.statValue}>{totalRevenue}</Text>
        </View>
      </View>

      {/* Top 5 Events Section */}
      <View style={styles.eventsSection}>
        <Text style={styles.sectionTitle}>Top 5 Events</Text>
        {events.map(event => {
          console.log(event);
          return (
            <View key={event._id} style={styles.eventItem}>
              <Image source={{uri: event.poster}} style={styles.eventImage} />
              <Text style={styles.eventName}>{event.name}</Text>
              <Text style={styles.eventDate}>
                Date: {new Date(event.startingDate).toDateString()}
              </Text>
              <Text style={styles.eventCost}>Price: ₹{event.price}</Text>
              <View style={styles.eventButtons}>
                <TouchableOpacity style={styles.button} onPress={()=>{navigation.navigate("Manage",event._id  )}}>
                  <Text style={styles.buttonText}>Manage</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    navigation.navigate('Event', {event});
                  }}>
                  <Text style={styles.buttonText}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {/* Transaction List */}
      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.map(transaction => (
          <View key={transaction._id} style={styles.transactionItem}>
            {/* User Avatar and Name */}
            <View style={styles.userInfo}>
              <Image
                source={{uri: transaction.userAvatar}}
                style={styles.avatar}
              />
              <Text style={styles.userName}>{transaction.fullName}</Text>
            </View>

            {/* Transaction Details */}
            <Text style={styles.transactionAmount}>
              ₹{transaction.totalPrice}
            </Text>
            <Text style={styles.transactionDate}>
              {new Date(transaction.eventDate).toDateString()}
            </Text>
            <Text style={styles.transactionEvent}>{transaction.eventName}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  statBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '30%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#888',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0070f3',
    marginTop: 5,
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
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
  eventDate: {
    fontSize: 14,
    color: '#888',
  },
  eventCost: {
    fontSize: 16,
    color: '#0070f3',
    marginTop: 5,
  },
  eventButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
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
  transactionsSection: {
    marginTop: 24,
  },
  transactionItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0070f3',
  },
  transactionDate: {
    fontSize: 14,
    color: '#888',
  },
  manageButton: {
    marginTop: 10,
    backgroundColor: '#0070f3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  manageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  transactionsSection: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  transactionItem: {
    backgroundColor: "#f1f1f1",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  transactionDate: {
    fontSize: 14,
    color: "#666",
  },
  transactionEvent: {
    fontSize: 14,
    fontWeight: "500",
    color: "#007BFF",
  },
  manageButton: {
    marginTop: 10,
    backgroundColor: "#007BFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  manageButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Home;
