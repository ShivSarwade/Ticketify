import React, {useEffect, useRef} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Home from './Home';
import Account from './Account';
import EditProfile from './Account/EditProfile';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import CreateOrUpdateEvent from './CreateEvent';
import Event from './Home/Event';
import Manage from './Manage';
import ScanTickets from './ScanTickets';
// Get the device width and height
const {width, height} = Dimensions.get('window');

const Stack = createStackNavigator();

const AccountStackScreen = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AccountHome"
      component={Account}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="EditProfile"
      component={EditProfile}
      options={{title: 'Edit Profile'}}
    />
  </Stack.Navigator>
);
const HomeStackScreen = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeMain"
      component={Home}
      options={{headerShown: false}}
    />
    <Stack.Screen name="Event" component={Event} option={{title: 'Event'}} />
    <Stack.Screen name="Manage" component={Manage} options={{title:"Manage Event"}}/>
    <Stack.Screen name="ScanTickets" component={ScanTickets} options={{title:"Scan Ticekts"}}/>
    <Stack.Screen
      name="EditEvent"
      component={CreateOrUpdateEvent}
      option={{title: 'Edit Event'}}
    />
  </Stack.Navigator>
);

const Tab = createBottomTabNavigator();
const Organiser = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        keyboardHidesTabBar: true,
        headerShown: false,
        tabBarIcon: ({focused}) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Account') iconName = 'account-circle';
          else if (route.name === 'Create') iconName = 'add';

          // Animated width for background expansion
          const bgWidth = useRef(
            new Animated.Value(focused ? width / 6 : 0),
          ).current;

          useEffect(() => {
            Animated.spring(bgWidth, {
              toValue: focused ? width / 6 : 0,
              speed: 1,
              bounciness: 12,
              useNativeDriver: false, // Width animation needs false
            }).start();
          }, [focused]);

          return (
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: focused ? '#fdd1c3' : 'transparent',
                  width: bgWidth, // Apply animated width
                },
              ]}>
              <MaterialIcons
                style={{position: 'absolute'}}
                name={iconName}
                size={height * 0.03}
                color={focused ? '#ff4000' : 'black'}
              />
            </Animated.View>
          );
        },
        tabBarLabel: ({focused, color}) => (
          <Text style={[styles.tabLabel, {color: focused ? 'black' : color}]}>
            {route.name}
          </Text>
        ),
        tabBarStyle: {
          height: height * 0.1,
          paddingTop: 5,
          backgroundColor: 'white',
        },
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
        tabBarIconStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          height: 'auto',
        },
        tabBarButton: props => <TouchableOpacity {...props} />, // Prevent ripple effect
      })}>
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Create" component={CreateOrUpdateEvent} />
      <Tab.Screen name="Account" component={AccountStackScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    borderRadius: 20,
    width: '100%',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 5,
  },
});

export default Organiser;
