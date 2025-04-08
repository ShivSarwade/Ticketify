import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ToastAndroid,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {launchImageLibrary} from 'react-native-image-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {PermissionsAndroid, Platform} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {createOrUpdateEvent, getEventById} from '../../API/organiser.api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { Dimensions } from 'react-native';

const {width}= Dimensions.get('window');
const CreateOrUpdateEvent = ({route,navigation}) => {
  const {event} = route.params || '';
  console.log(event)
  const minTicketSellingDate = new Date();
  minTicketSellingDate.setDate(minTicketSellingDate.getDate() + 1);

  const minEventStartDate = new Date();
  minEventStartDate.setDate(minEventStartDate.getDate() + 3);

  const [eventImage, setEventImage] = useState(event ? event.poster : null);
  const [eventImageFile, setEventImageFile] = useState(null);
  // Store file for upload
  const [eventName, setEventName] = useState(event ? event.name : '');
  const [eventDescription, setEventDescription] = useState(
    event ? event.description : '',
  );
  const [eventStartDate, setEventStartDate] = useState(
    event ? new Date(event.startingDate) : minEventStartDate,
  );
  const [eventStartTime, setEventStartTime] = useState(
    event ? new Date(event.startingTime) : new Date(),
  );
  const [eventEndDate, setEventEndDate] = useState(
    event ? new Date(event.endingDate) : eventStartDate,
  );
  const [eventEndTime, setEventEndTime] = useState(
    event ? new Date(event.endingTime) : new Date(),
  );
  const [eventLocation, setEventLocation] = useState(
    event ? event.location : '',
  );
  const [eventLocationUrl, setEventLocationUrl] = useState(
    event ? event.locationUrl : '',
  );
  const [ticketPrice, setTicketPrice] = useState(
    event ? String(event.price) : 50,
  );
  const [ticketsAvailable, setTicketsAvailable] = useState(
    event ? String(event.ticketsAvailable) : 50,
  );
  const [ticketSellingDate, setTicketSellingDate] = useState(
    event ? new Date(event.ticketSellingDate) : minTicketSellingDate,
  );
  const [category, setCategory] = useState(
    event ? event.category : 'Select A Category',
  );
  const [tags, setTags] = useState(event ? event.tags : '');

  const [descriptionHeight, setDescriptionHeight] = useState(40);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showSellingDatePicker, setShowSellingDatePicker] = useState(false);

  const eventCategories = [
    {label: 'Tech', value: 'tech'},
    {label: 'Sports', value: 'sports'},
    {label: 'Business', value: 'business'},
    {label: 'Music', value: 'music'},
    {label: 'Art', value: 'art'},
    {label: 'Education', value: 'education'},
    {label: 'Entertainment', value: 'entertainment'},
    {label: 'Health & Wellness', value: 'health_wellness'},
    {label: 'Food & Drink', value: 'food_drink'},
    {label: 'Fashion', value: 'fashion'},
    {label: 'Travel', value: 'travel'},
    {label: 'Science', value: 'science'},
    {label: 'Literature', value: 'literature'},
    {label: 'Spirituality', value: 'spirituality'},
    {label: 'Gaming', value: 'gaming'},
    {label: 'Politics', value: 'politics'},
    {label: 'Networking', value: 'networking'},
    {label: 'Social', value: 'social'},
    {label: 'Charity', value: 'charity'},
  ];

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

  useEffect(() => {
    const downloadFile = async () => {
      try {
        const fileName = event.poster.split('/').pop(); // Extract filename from URL
        const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`; // Save in document directory

        const downloadResult = await RNFS.downloadFile({
          fromUrl: event.poster,
          toFile: filePath,
        }).promise;

        if (downloadResult.statusCode === 200) {
          const fileStat = await RNFS.stat(filePath); // Get file details
          const fileData = await RNFS.readFile(filePath, 'base64'); // Read file as base64

          const fileInfo = {
            originalPath: filePath, // Path where file is stored
            type: 'image/jpeg', // Assuming JPEG, change if needed
            height: null, // You need an image library to get actual dimensions
            width: null,
            fileName: fileName,
            fileSize: fileStat.size, // File size in bytes
            uri: `file://${filePath}`, // File URI
          };

          console.log(fileInfo);
          setEventImageFile(fileInfo); // Set file object instead of base64

          return fileInfo;
        } else {
          throw new Error('Download failed');
        }
      } catch (error) {
        console.error('Error downloading file:', error);
        return null;
      }
    };

    const checkPermissions = async () => {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'You need to grant storage permission to select a photo.',
        );
      }
    };

    const getEventData = async eventId => {
      try {
        const response = await getEventById(eventId);
        if (response.error) {
          Alert.alert('getEventById returned error');
        } else {
        }
      } catch (error) {
        console.log('getEventData have returned error');
      }
    };

    checkPermissions();
    if (event) {
      downloadFile();
      getEventData(event._id);
    }
  }, []);

  const pickImage = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      return;
    }

    launchImageLibrary({mediaType: 'photo', quality: 1}, response => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }

      if (response.assets?.length) {
        const Img = response.assets[0];
        console.log('Image selected:', Img);
        setEventImage(Img.uri);
        setEventImageFile(Img);
      }
    });
  };

  const handleCreateOrUpdateEvent = async () => {
    try {
      if (
        !eventImage ||
        !eventName.trim() ||
        !eventDescription.trim() ||
        !eventStartDate ||
        !eventStartTime ||
        !eventEndDate ||
        !eventEndTime ||
        !eventLocation.trim() ||
        !ticketPrice ||
        !ticketsAvailable ||
        !ticketSellingDate ||
        category === 'Select A Category'
      ) {
        Alert.alert('Validation Error', 'Please fill all required fields.');
        return;
      }

      if (ticketPrice <= 50) {
        Alert.alert('Validation Error', 'Price should be greater than 50');
        return;
      }
      if (ticketsAvailable <= 10) {
        Alert.alert('Validation Error', 'Total tickets should be more than 10');
        return;
      }

      const organiserAccessToken = await AsyncStorage.getItem(
        'organiserAuthToken',
      );

      console.log(eventImageFile);

      // Include eventId only if the event exists
      const eventId = event?._id ? event._id : null;
      console.log(eventId)
      const response = await createOrUpdateEvent(
        eventName,
        eventDescription,
        eventStartDate,
        eventEndDate,
        eventStartTime,
        eventEndTime,
        eventLocation,
        eventLocationUrl,
        ticketPrice,
        ticketsAvailable,
        ticketSellingDate,
        tags,
        category,
        organiserAccessToken,
        eventImageFile,
        eventId, // Pass only if event exists
      );

      console.log('response', response);
      Alert.alert('Success', 'Event created or updated successfully', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (error) {
      console.log('handleCreateOrUpdateEvent returned error');
      Alert.alert('Unexpected Error', error.message);
    } finally {
      console.log('handleCreateOrUpdateEvent has finished execution');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {event ? 'Update Event' : 'Create Event'}
      </Text>
      {/* Event Image Section */}
      <View style={styles.imageSection}>
        {eventImage ? (
          <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
            <Image source={{uri: eventImage}} style={styles.image} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={pickImage} style={styles.imagePlaceholder}>
            <Text style={styles.uploadText}>Upload Image of 16/9</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Event Name */}
      <Text style={styles.heading}>Event Name</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="file-text" size={20} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Event Name"
          value={eventName}
          onChangeText={setEventName}
          placeholderTextColor="#666"
        />
      </View>
      {/* Event Description */}
      <Text style={styles.heading}>Event Description</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="info-circle" size={20} style={styles.icon} />
        <TextInput
          style={[styles.input, {minHeight: 100}, {height: descriptionHeight}]}
          placeholder="Event Description"
          value={eventDescription}
          onChangeText={setEventDescription}
          multiline
          textAlignVertical="top"
          onContentSizeChange={({
            nativeEvent: {
              contentSize: {height},
            },
          }) => {
            setDescriptionHeight(height);
          }}
          placeholderTextColor="#666"
        />
      </View>
      {/* Event Date */}
      <Text style={styles.heading}>Start Date & Time</Text>
      <View style={styles.combinedContainer}>
        <TouchableOpacity
          onPress={() => setShowStartDatePicker(true)}
          style={styles.inputContainer}>
          <FontAwesome name="calendar" size={20} style={styles.icon} />

          <TextInput
            style={styles.input}
            value={eventStartDate.toDateString()}
            editable={false}
          />
          {showStartDatePicker && (
            <DateTimePicker
              style={styles.inputContainer}
              value={eventStartDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartDatePicker(false);
                if (selectedDate) setEventStartDate(selectedDate);
              }}
              minimumDate={minEventStartDate}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowEndTimePicker(true)}
          style={styles.inputContainer}>
          <FontAwesome name="clock-o" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            value={eventStartTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
            editable={false}
          />
          {showStartTimePicker && (
            <DateTimePicker
              value={eventStartTime}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowStartTimePicker(false);
                if (selectedTime) setEventStartTime(selectedTime);
              }}
            />
          )}
        </TouchableOpacity>
      </View>
      .<Text style={styles.heading}>End Date & Time</Text>
      <View style={styles.combinedContainer}>
        <TouchableOpacity
          onPress={() => setShowEndDatePicker(true)}
          style={styles.inputContainer}>
          <FontAwesome name="calendar" size={20} style={styles.icon} />

          <TextInput
            style={styles.input}
            value={eventEndDate.toDateString()}
            editable={false}
          />
          {showEndDatePicker && (
            <DateTimePicker
              style={styles.inputContainer}
              value={eventEndDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndDatePicker(false);
                if (selectedDate) setEventEndDate(selectedDate);
              }}
              minimumDate={eventStartDate}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowEndTimePicker(true)}
          style={styles.inputContainer}>
          <FontAwesome name="clock-o" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            value={eventEndTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
            editable={false}
          />
          {showEndTimePicker && (
            <DateTimePicker
              value={eventEndTime}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowEndTimePicker(false);
                if (selectedTime) setEventEndTime(selectedTime);
              }}
            />
          )}
        </TouchableOpacity>
      </View>
      {/* Category Picker */}
      <Text style={styles.heading}>Event Category</Text>
      <View style={styles.inputContainer}>
        <FontAwesome
          name="list-alt"
          size={20}
          style={[styles.icon, {marginTop: 16}]}
        />
        <Picker
          selectedValue={category}
          onValueChange={setCategory}
          style={styles.input}>
          <Picker.Item label="Select a category..." value="" />
          {eventCategories.map((item, index) => (
            <Picker.Item key={index} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
      <Text style={styles.heading}>Event Location</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="map-marker" size={20} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Event Location"
          value={eventLocation}
          onChangeText={setEventLocation}
          placeholderTextColor="#666"
        />
      </View>
      <Text style={styles.heading}>Event Location URL</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="external-link" size={20} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Event Location URL"
          value={eventLocationUrl}
          onChangeText={setEventLocationUrl}
          placeholderTextColor="#666"
        />
      </View>
      <Text style={styles.heading}>Total tickets</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="ticket" size={20} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter total number of tickets"
          value={ticketsAvailable}
          onChangeText={setTicketsAvailable}
          placeholderTextColor="#666"
          keyboardType="numeric"
        />
      </View>
      <Text style={styles.heading}>Price of Ticket</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="rupee" size={20} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter the Price of ticket"
          value={ticketPrice}
          onChangeText={setTicketPrice}
          placeholderTextColor="#666"
          keyboardType="numeric"
        />
      </View>
      <Text style={styles.heading}>Event Ticket Selling Date</Text>
      <TouchableOpacity
        onPress={() => setShowSellingDatePicker(true)}
        style={styles.inputContainer}>
        <FontAwesome name="calendar" size={20} style={styles.icon} />

        <TextInput
          style={styles.input}
          value={ticketSellingDate.toDateString()}
          editable={false}
        />
        {showSellingDatePicker && (
          <DateTimePicker
            style={styles.inputContainer}
            value={ticketSellingDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowSellingDatePicker(false);
              if (selectedDate) setTicketSellingDate(selectedDate);
            }}
            minimumDate={minTicketSellingDate}
          />
        )}
      </TouchableOpacity>
      <Text style={styles.heading}>Event Tags</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="hashtag" size={20} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter tags ex. tech,sports,cash "
          value={tags}
          onChangeText={setTags}
          placeholderTextColor="#666"
        />
      </View>
      {/* Create Event Button */}
      <TouchableOpacity
        onPress={handleCreateOrUpdateEvent}
        style={styles.button}>
        <Text style={styles.buttonText}>{event?'Update Event':'Create Event'} </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateOrUpdateEvent;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: width*0.07,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
    textAlign: 'left',
  },
  imageSection: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ECEFF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 12,
  },
  uploadText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 8,
    backgroundColor: '#ECEFF4',
    paddingHorizontal: 15,
    height: 'auto',
    marginBottom: 12,
    color: '#222',
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  icon: {
    marginRight: 10,
    marginTop: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#222',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 60,
  },
  buttonText: {
    color: '#F8F9FB',
    fontSize: 16,
    fontWeight: '600',
  },
  combinedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  heading: {
    paddingBottom: 6,
    fontSize: 16,
  },
});
