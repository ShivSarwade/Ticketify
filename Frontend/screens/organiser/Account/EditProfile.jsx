import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert,
  ToastAndroid
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { editProfile } from '../../../API/organiser.api';
const EditProfile = ({ navigation }) => {
  const organiserData = useSelector(state => state.currentUser.organiser);
  console.log(organiserData.phoneNo)
  // Set initial state values to the data from organiserData or default to an empty string if undefined
  const [fullName, setFullName] = useState(organiserData.fullName || '');
  const [username, setUsername] = useState(organiserData.username || '');
  const [phone, setPhone] = useState(organiserData.phoneNo || '');
  const [address, setAddress] = useState(organiserData.address || '');
  const [website, setWebsite] = useState(organiserData.website || '');
  const [facebook, setFacebook] = useState(organiserData.socialLinks?.facebook || '');
  const [twitter, setTwitter] = useState(organiserData.socialLinks?.twitter || '');
  const [instagram, setInstagram] = useState(organiserData.socialLinks?.instagram || '');
  const [linkedIn, setLinkedIn] = useState(organiserData.socialLinks?.linkedin || '');
  const [youtube, setYoutube] = useState(organiserData.socialLinks?.youtube || '');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);


const updateProfile = async () => {
  const organiserAuthToken = await AsyncStorage.getItem("organiserAuthToken");
  
  if (!fullName || !username || !phone) {
    ToastAndroid.show('Full Name, Username, and Phone Number are required fields.', ToastAndroid.LONG);
    return;
  }

  try {
    const result = await editProfile(
      fullName,
      username,
      phone,
      address,
      website,
      facebook,
      twitter,
      instagram,
      linkedIn,
      youtube,
      organiserAuthToken, // Make sure to provide accessToken or remove it if unnecessary
    );

    if (result && result.success) {
      ToastAndroid.show(result.success, ToastAndroid.LONG);  // Show success message as Toast
      navigation.navigate('AccountHome');
    } else {
      ToastAndroid.show('An error occurred during profile update.', ToastAndroid.LONG);  // Show generic error
    }
  } catch (error) {
    // Display error message from the API response or catch block
    ToastAndroid.show(
      error.response?.data?.message || error.message || 'Failed to update profile',
      ToastAndroid.LONG
    );
  }
};


  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Organisation Details</Text>

        {/* Full Name */}
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

        {/* Username */}
        <View style={styles.inputContainer}>
          <FontAwesome name="user-circle" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#666"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        {/* Phone */}
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

        {/* Address */}
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

        {/* Website */}
        <View style={styles.inputContainer}>
          <FontAwesome name="globe" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Website"
            placeholderTextColor="#666"
            value={website}
            onChangeText={setWebsite}
          />
        </View>

        {/* Social Media Fields */}
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Social Media</Text>
        </View>

        <View style={[styles.inputContainer, styles.facebook]}>
          <FontAwesome name="facebook" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Facebook"
            placeholderTextColor="#444"
            value={facebook}
            onChangeText={setFacebook}
          />
        </View>

        <View style={[styles.inputContainer, styles.twitter]}>
          <FontAwesome name="twitter" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Twitter"
            placeholderTextColor="#444"
            value={twitter}
            onChangeText={setTwitter}
          />
        </View>

        <View style={[styles.inputContainer, styles.instagram]}>
          <FontAwesome name="instagram" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Instagram"
            placeholderTextColor="#444"
            value={instagram}
            onChangeText={setInstagram}
          />
        </View>

        <View style={[styles.inputContainer, styles.linkedin]}>
          <FontAwesome name="linkedin" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="LinkedIn"
            placeholderTextColor="#444"
            value={linkedIn}
            onChangeText={setLinkedIn}
          />
        </View>

        <View style={[styles.inputContainer, styles.youtube]}>
          <FontAwesome name="youtube-play" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="YouTube"
            placeholderTextColor="#444"
            value={youtube}
            onChangeText={setYoutube}
          />
        </View>

        {/* Save Button */}
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
  sectionTitleContainer: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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
  facebook: {
    backgroundColor: '#E8F4FF',
  },
  twitter: {
    backgroundColor: '#E5F7FE',
  },
  instagram: {
    backgroundColor: '#FCE7F3',
  },
  linkedin: {
    backgroundColor: '#E6F3FE',
  },
  youtube: {
    backgroundColor: '#FCE8E6',
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
