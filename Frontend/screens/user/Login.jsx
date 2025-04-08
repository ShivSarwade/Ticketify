import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import TicketifyLogo from '../../assets/ticketify.png';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {logIn} from '../../Store/Reducers/user.reducer';
import { loginUser } from '../../API/user.api';

const {width} = Dimensions.get('window'); // Get the screen width
const imageWidth = width * 0.5; // Calculate image width as half of the screen width

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Track login loading state
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (username && password) {
      setLoading(true); // Start loading
      console.log(username,password)
      try {
        const result = await loginUser({email:username,password:password})
        console.log(result)
        if (result.error) {
          alert(result.error);
        } else {
          const {accessToken, ...userData} = result.data;
          dispatch(logIn({...userData, role: 'user'})); // Dispatch login action
          await AsyncStorage.setItem('userAuthToken', accessToken);
        }
      } catch (error) {
        alert('Login failed. Please check your credentials and try again.');
      } finally {
        setLoading(false); // Stop loading
      }
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.negativeContainer}></View>
      <View style={styles.formContainer}>
        {/* Logo Image */}
        <Image source={TicketifyLogo} style={styles.image} />

        {/* Welcome Text */}
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Show loading spinner when logging in */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007bff"
            style={styles.loading}
          />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        )}

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('UserSignUp')}>
            <Text style={styles.registerLink}> Register Here</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.organiserLoginContainer}>
          <Text style={styles.organiserLoginText}>Not a user?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('OrganiserLogin')}>
            <Text style={styles.organiserLoginLink}>
              {' '}
              Go to Organiser Login Page
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  negativeContainer: {
    height: imageWidth / 2,
  },
  container: {
    flexGrow: 1, // Use flexGrow to ensure content expands naturally
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#ff5a22', // orange background
    paddingTop: '5%',
  },
  formContainer: {
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
    backgroundColor: '#fff', // white background
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    alignItems: 'center',
    paddingTop: imageWidth / 2,
    paddingBottom: 20,
  },
  image: {
    position: 'absolute',
    top: -imageWidth / 2, // Position image to overlap the top container
    left: '50%', // Center horizontally
    width: imageWidth,
    height: imageWidth,
    transform: [{translateX: -imageWidth / 2}],
    resizeMode: 'contain',
  },
  title: {
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '90%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: '90%',
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loading: {
    marginVertical: 10,
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  registerText: {
    fontSize: 16,
    color: '#666',
  },
  registerLink: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
  organiserLoginContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  organiserLoginText: {
    fontSize: 16,
    color: '#666',
  },
  organiserLoginLink: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
