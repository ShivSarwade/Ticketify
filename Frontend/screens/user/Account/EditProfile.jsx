import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  ToastAndroid
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateAccountDetails } from '../../../API/user.api';

const EditProfile = ({ navigation }) => {
  const userData = useSelector(state => state.currentUser.user);

  const [fullName, setFullName] = useState(userData.fullName || '');
  const [phone, setPhone] = useState(userData.phoneNo || '');
  const [address, setAddress] = useState(userData.address || '');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const updateProfile = async () => {
    try {
      const userAuthToken = await AsyncStorage.getItem("userAuthToken");

      if (!userAuthToken) {
        ToastAndroid.show('Authentication error. Please log in again.', ToastAndroid.LONG);
        return;
      }

      if (!fullName && !address && !phone) {
        ToastAndroid.show('At least one field (Full Name, Address, or Phone) is required.', ToastAndroid.LONG);
        return;
      }

      if (phone && phone.length !== 10) {
        ToastAndroid.show('Phone number must be exactly 10 digits.', ToastAndroid.LONG);
        return;
      }

      const result = await updateAccountDetails(userAuthToken, fullName, address, phone);

      if (result && result.message) {
        ToastAndroid.show(result.message, ToastAndroid.LONG);
        navigation.navigate('AccountHome');
      } else {
        console.log('API Response:', result);
        ToastAndroid.show('Error updating profile.', ToastAndroid.LONG);
      }
    } catch (error) {
      console.log('Update Profile Error:', error);
      ToastAndroid.show(
        error.response?.data?.message || error.message || 'Failed to update profile',
        ToastAndroid.LONG
      );
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Edit Profile</Text>

        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#666"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>
        <View style={styles.inputContainer}>
          <FontAwesome name="phone" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            placeholderTextColor="#666"
            value={String(phone)}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        <View style={styles.inputContainer}>
          <FontAwesome name="map-marker" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Address"
            placeholderTextColor="#666"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={updateProfile}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#ECEFF4',
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  icon: {
    marginRight: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#222',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#F8F9FB',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfile;
