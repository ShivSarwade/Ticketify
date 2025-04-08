import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator, // Import ActivityIndicator for loading spinner
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import TicketifyLogo from '../../assets/ticketify.png';
import {useDispatch} from 'react-redux';
import { logIn } from '../../Store/Reducers/user.reducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginOrganiser } from '../../API/organiser.api';
import Organiser from './Organiser';

const {width} = Dimensions.get('window'); // Get the screen width
const imageWidth = width * 0.5; // Calculate image width as half of the screen width

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Track login loading state
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const handleLogin = async () => {
    if (username && password) {
      setLoading(true);
      try {
        const result = await loginOrganiser({email: username, password: password});
        console.log(result)
        if (result.error) {
          alert(result.error);
        } else {
          const {accessToken} = result.data;
          dispatch(logIn({organiser:result.data.organiser,role:'organiser',accessToken:accessToken}));
          console.log("error")
          console.log("errpr is here")
          await AsyncStorage.setItem('organiserAuthToken',accessToken);
        }
      } catch (error) {
        alert('Login failed. Please check your credentials and try again.');
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please enter valid credentials');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.negativeContainer}></View>
      <View style={styles.formContainer}>
        {/* Logo Image */}
        <Image source={TicketifyLogo} style={styles.image} />

        {/* Conditionally Render Welcome Text */}
        <Text style={styles.title}>Welcome Organiser</Text>
        <Text style={styles.subtitle}>Login to manage events</Text>

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
          <TouchableOpacity
            onPress={() => navigation.navigate('OrganiserSignUp')}>
            <Text style={styles.registerLink}> Register Here</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.userLoginContainer}>
          <Text style={styles.userLoginText}>Not an organiser?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('UserLogin')}>
            <Text style={styles.userLoginLink}> Go to User Login Page</Text>
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
    width: imageWidth, // Dynamically set width as half the screen width
    height: imageWidth, // Use equal height to make it square
    transform: [{translateX: -imageWidth / 2}], // Shift left to center the image
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
  userLoginContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  userLoginText: {
    fontSize: 16,
    color: '#666',
  },
  userLoginLink: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
});

export default Login;
