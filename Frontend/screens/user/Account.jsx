import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  PermissionsAndroid,
  Platform,
  ToastAndroid,
  Linking,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logOutUser, updateUserAvatar } from '../../API/user.api';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { logOut } from '../../Store/Reducers/user.reducer';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Account = () => {
  const userData = useSelector(state => state.currentUser?.user);
  const [profilePic, setProfilePic] = useState(userData?.avatar || null);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      const userAuthToken = await AsyncStorage.getItem('userAuthToken');
      if (!userAuthToken) {
        ToastAndroid.show('Already logged out.', ToastAndroid.LONG);
        return;
      }
      await AsyncStorage.removeItem('userAuthToken'); // Fallback

      const result = await logOutUser(userAuthToken);
      if (result?.message === 'success') {
        await AsyncStorage.removeItem('userAuthToken');
        dispatch(logOut());
        ToastAndroid.show('Logged Out Successfully', ToastAndroid.LONG);
      } else {
        Alert.alert('Logout Failed', result?.error || 'Something went wrong');
        await AsyncStorage.removeItem('userAuthToken'); // Fallback
      }
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // Ensure the app has an active Activity before requesting permissions
        const hasActivity = PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        if (!hasActivity) {
          console.warn('Permissions API called when not attached to an Activity.');
          return false;
        }
  
        const granted = await PermissionsAndroid.request(
          Platform.Version >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'App needs access to your photos to upload a profile picture.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
  
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission request error:', err);
        return false;
      }
    }
    return true;
  };
  
  

  const handleChoosePhoto = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'You need to grant storage permission to select a photo.');
      return;
    }
  
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
      },
      async response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
          return;
        }
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Something went wrong.');
          return;
        }
        if (response.assets?.length) {
          const Img = response.assets[0];
          setProfilePic(Img.uri);
          const userToken = await AsyncStorage.getItem('userAuthToken');
  
          const result = await updateUserAvatar(Img, userToken);
          if (result) {
            console.log("wjhayt")
            ToastAndroid.show("Profile picture updated", ToastAndroid.LONG);
          } else {
            console.log('Image upload failed');
          }
        }
      }
    );
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Account</Text>

      {/* Profile Section */}
      <View style={styles.profileHeader}>
        <View style={styles.profilePicContainer}>
          <TouchableOpacity onPress={handleChoosePhoto}>
            <Image
              source={profilePic ? { uri: profilePic } : require('../../assets/ticketify.png')}
              style={styles.profilePic}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.plusIcon} onPress={handleChoosePhoto}>
            <MaterialIcons name="add" size={16} style={styles.icon} color={'white'} />
          </TouchableOpacity>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.fullName}>{userData?.fullName || 'Your Name'}</Text>
          <Text style={styles.username}>@{userData?.username || 'username'}</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* User Details */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionHeading}>Personal Details</Text>
        <View style={styles.detailsRow}>
          <Text style={styles.label}>Full Name</Text>
          <Text style={styles.value}>{userData?.fullName || 'Not Provided'}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{userData?.email || 'Not Provided'}</Text>
        </View>
      </View>

      {/* Social Links */}
   
    </View>
  );
};

export default Account;
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F9F9F9',
      padding: 20,
    },
    heading: {
      fontSize: width * 0.07,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#333',
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderColor: '#ddd',
      marginBottom: 20,
    },
    profilePicContainer: {
      position: 'relative',
    },
    profilePic: {
      width: width * 0.18,
      height: width * 0.18,
      borderRadius: width * 0.09,
      borderWidth: 2,
      borderColor: '#0095F6',
      backgroundColor: '#f0f0f0',
    },
    plusIcon: {
      position: 'absolute',
      bottom: -5,
      right: -5,
      backgroundColor: '#0095F6',
      width: 35,
      height: 35,
      borderRadius: 17.5,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#fff',
    },
    icon: {
      textAlign: 'center',
    },
    userInfo: {
      marginLeft: 20,
    },
    fullName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#333',
    },
    username: {
      fontSize: 16,
      color: '#777',
    },
    buttonRow: {
      flexDirection: 'row',
      width: '100%',
      marginTop: 30,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    editButton: {
      backgroundColor: '#0095F6',
      marginRight: 10,
    },
    logoutButton: {
      backgroundColor: '#FF3B30',
      marginLeft: 10,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    detailsSection: {
      marginTop: 30,
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 20,
    },
    sectionHeading: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#333',
    },
    detailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    label: {
      fontSize: 16,
      color: '#777',
    },
    value: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
    socialLinksSection: {
      marginTop: 30,
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 20,
    },
    socialLinkRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    socialLink: {
      width: 50,
      height: 50,
      backgroundColor: '#f0f0f0',
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
    },
    socialIcon: {
      textAlign: 'center',
    },
  });
  
