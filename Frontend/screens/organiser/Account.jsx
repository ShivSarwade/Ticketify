import React, {useState} from 'react';
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
import {launchImageLibrary} from 'react-native-image-picker';
import {useSelector, useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logOutOrganiser, updateAvatar} from '../../API/organiser.api';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {logOut} from '../../Store/Reducers/user.reducer';
import {useNavigation} from '@react-navigation/native';
const {width} = Dimensions.get('window');

const Account = () => {
  const organiserData = useSelector(state => state.currentUser?.organiser);
  const [profilePic, setProfilePic] = useState(organiserData?.avatar || null);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const OrganiserLogOut = async () => {
    try {
      const organiserAuthToken = await AsyncStorage.getItem(
        'organiserAuthToken',
      );
      if (!organiserAuthToken) {
        ToastAndroid.show(
          'No token found, already logged out.',
          ToastAndroid.LONG,
        );
        return;
      }

      const result = await logOutOrganiser(organiserAuthToken);
      console.log(result);

      if (result?.message === 'success') {
        await AsyncStorage.removeItem('organiserAuthToken');
        dispatch(logOut());
        ToastAndroid.show('Organiser Logged Out', ToastAndroid.LONG);
      } else {
        Alert.alert('Logout Failed', result?.error || 'Something went wrong');
        await AsyncStorage.removeItem('organiserAuthToken'); // Fallback
      }
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message:
            'This app needs access to your gallery to select a profile picture.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleChoosePhoto = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'You need to grant storage permission to select a photo.',
      );
      return;
    }

    launchImageLibrary({mediaType: 'photo', quality: 1}, async response => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }

      if (response.assets?.length) {
        const Img = response.assets[0];
        console.log('Image selected:', Img);

        setProfilePic(Img.uri);
        const organiserToken = await AsyncStorage.getItem('organiserAuthToken');
        console.log('Calling updateAvatar...');

        const result = await updateAvatar(Img, organiserToken);
        console.log('Update Avatar Response:', result);

        if (result?.success) {
          ToastAndroid.show(result.success, ToastAndroid.LONG);
        } else {
          console.log('Image not uploaded');
        }
      }
    });
  };
  const openFacebook = url => {
    Linking.canOpenURL(`fb://` + url)
      .then(supported => {
        if (supported) {
          Linking.openURL(`fb://` + url); // Open in Facebook app
        } else {
          Linking.openURL(`https://www.facebook.com/${url}`); // Open in browser
        }
      })
      .catch(err => console.error('Failed to open Facebook:', err));
  };

  // Function to open Twitter in app or browser
  const openTwitter = url => {
    Linking.canOpenURL(`twitter://` + url)
      .then(supported => {
        if (supported) {
          Linking.openURL(`twitter://` + url); // Open in Twitter app
        } else {
          Linking.openURL(`https://www.twitter.com/${url}`); // Open in browser
        }
      })
      .catch(err => console.error('Failed to open Twitter:', err));
  };

  // Function to open Instagram in app or browser
  const openInstagram = url => {
    Linking.canOpenURL(`instagram://` + url)
      .then(supported => {
        if (supported) {
          Linking.openURL(`instagram://` + url); // Open in Instagram app
        } else {
          Linking.openURL(`https://www.instagram.com/${url}`); // Open in browser
        }
      })
      .catch(err => console.error('Failed to open Instagram:', err));
  };

  // Function to open LinkedIn in app or browser
  const openLinkedIn = url => {
    Linking.canOpenURL(`linkedin://` + url)
      .then(supported => {
        if (supported) {
          Linking.openURL(`linkedin://in/` + url); // Open in LinkedIn app
          console.log('linkedin://' + url);
        } else {
          Linking.openURL(`https://www.linkedin.com/in/${url}`); // Open in browser
        }
      })
      .catch(err => console.error('Failed to open LinkedIn:', err));
  };

  // Function to open YouTube in app or browser
  const openYouTube = url => {
    Linking.canOpenURL(`youtube://` + url)
      .then(supported => {
        if (supported) {
          Linking.openURL(`youtube://@` + url); // Open in YouTube app
        } else {
          Linking.openURL(`https://m.youtube.com/@${url}`); // Open in browser
        }
      })
      .catch(err => console.error('Failed to open YouTube:', err));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Account</Text>

      {/* Profile Section */}
      <View style={styles.profileHeader}>
        {/* Profile Image */}
        <View style={styles.profilePicContainer}>
          <TouchableOpacity onPress={handleChoosePhoto}>
            <Image
              source={
                profilePic
                  ? {uri: profilePic}
                  : require('../../assets/ticketify.png')
              }
              style={styles.profilePic}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.plusIcon} onPress={handleChoosePhoto}>
            <MaterialIcons
              name="add"
              size={16}
              style={styles.icon}
              color={'white'}
            />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.fullName}>
            {organiserData?.fullName || 'Your Name'}
          </Text>
          <Text style={styles.username}>
            @{organiserData?.username || 'username'}
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => {
            navigation.navigate('EditProfile');
          }}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={OrganiserLogOut}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Organizational Details */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionHeading}>Organisational Details</Text>
        <View style={styles.detailsRow}>
          <Text style={styles.label}>Organisation Name</Text>
          <Text style={styles.value}>
            {organiserData?.fullName || 'Not Provided'}
          </Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.label}>Contact Number</Text>
          <Text style={styles.value}>
            {organiserData?.phoneNo || 'Not Provided'}
          </Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>
            {organiserData?.email || 'Not Provided'}
          </Text>
        </View>
      </View>

      {/* Social Links */}
      <View style={styles.socialLinksSection}>
        <Text style={styles.sectionHeading}>Social Links</Text>
        <View style={styles.socialLinkRow}>
          <TouchableOpacity
            style={styles.socialLink}
            onPress={() => {
              /* Handle Twitter link */
              openTwitter(organiserData.socialLinks.twitter);
            }}>
            <FontAwesome
              name="twitter"
              size={24}
              style={styles.socialIcon}
              color="#1DA1F2"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialLink}
            onPress={() => {
              openFacebook(organiserData.socialLinks.facebook);
              /* Handle Facebook link */
            }}>
            <FontAwesome
              name="facebook"
              size={24}
              style={styles.socialIcon}
              color="#4267B2"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialLink}
            onPress={() => {
              openLinkedIn(organiserData.socialLinks.linkedin);
              /* Handle LinkedIn link */
            }}>
            <FontAwesome
              name="linkedin"
              size={24}
              style={styles.socialIcon}
              color="#0077B5"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialLink}
            onPress={() => {
              /* Handle Instagram link */
              openInstagram(organiserData.socialLinks.instagram);
            }}>
            <FontAwesome
              name="instagram"
              size={24}
              style={styles.socialIcon}
              color="#E4405F"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialLink}
            onPress={() => {
              /* Handle YouTube link */
              openYouTube(organiserData.socialLinks.youtube);
            }}>
            <FontAwesome
              name="youtube-play"
              size={24}
              style={styles.socialIcon}
              color="#FF0000"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialLink}
            onPress={() => {
              // Check if the URL is missing 'http://' or 'https://', and prepend if necessary
              const websiteUrl = organiserData.website.startsWith('http')
                ? organiserData.website
                : `http://${organiserData.website}`;

              Linking.openURL(websiteUrl);
            }}>
            <FontAwesome
              name="globe"
              size={24}
              style={styles.socialIcon}
              color="#1DA1F2"
            />
          </TouchableOpacity>
        </View>
      </View>
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

