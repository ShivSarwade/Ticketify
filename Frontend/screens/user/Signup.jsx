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
import {registerUser} from '../../API/user.api';
import {useDispatch} from 'react-redux';
import {logIn} from '../../Store/Reducers/user.reducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
const {width} = Dimensions.get('window'); // Get the screen width
const imageWidth = width * 0.5; // Calculate image width as half of the screen width

const SignUp = () => {
  const [name, setName] = useState(''); // State for name
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false); // Track signup loading state
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.currentUser);

  const validateInputs = () => {
    if (!name.trim()) return 'Name is required.';
    if (!username.trim()) return 'Username is required.';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email))
      return 'Enter a valid email.';
    if (!password.trim() || password.length < 6)
      return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSignUp = async () => {
    const validationError = validateInputs();
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      setLoading(true);
      const result = await registerUser({
        fullName: name,
        username,
        email,
        password,
        confirmPassword,
      });

      if (result.error) {
        alert(result.error);
      } else {
        const {accessToken, ...userData} = result.data;
        dispatch(logIn({...userData, role: 'user'})); // Dispatch login action
        await AsyncStorage.setItem('userAuthToken', accessToken);
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.negativeContainer}></View>
      <View style={styles.formContainer}>
        {/* Logo Image */}
        <Image source={TicketifyLogo} style={styles.image} />

        {/* Conditionally Render Welcome Text */}
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* Show loading spinner when signing up */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007bff"
            style={styles.loading}
          />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        )}

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('UserLogin')}>
            <Text style={styles.loginLink}> Login Here</Text>
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
  loginContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
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

export default SignUp;
