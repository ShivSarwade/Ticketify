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
import {registerOrganiser} from '../../API/organiser.api';
import {useDispatch} from 'react-redux';
import {logIn} from '../../Store/Reducers/user.reducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';

const {width} = Dimensions.get('window');
const imageWidth = width * 0.5;

const SignUp = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const organiser = useSelector(state => state.cuurentUser);

  const validateInputs = () => {
    if (!name.trim()) return 'Name is required.';
    if (!username.trim()) return 'Username is required.';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email))
      return 'Enter a valid email.';
    if (!phoneNo.trim() || !/^\d{10}$/.test(phoneNo))
      return 'Enter a valid 10-digit phone number.';
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
      const result = await registerOrganiser({
        fullName: name,
        username,
        email,
        phoneNo, // Included phoneNo in the API request
        password,
        confirmPassword,
      });
      if (result.error) {
        alert(result.error);
      } else {
        const {accessToken, ...organiserData} = result.data;
        dispatch(logIn({...organiserData, role: 'organiser'}));
        await AsyncStorage.setItem('organiserAuthToken', accessToken);
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
        <Image source={TicketifyLogo} style={styles.image} />
        <Text style={styles.title}>Create Organiser Account</Text>
        <Text style={styles.subtitle}>Sign up to manage events</Text>
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
          placeholder="Phone Number"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          value={phoneNo}
          onChangeText={setPhoneNo}
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
          <TouchableOpacity
            onPress={() => navigation.navigate('OrganiserLogin')}>
            <Text style={styles.loginLink}> Login Here</Text>
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
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#ff5a22',
    paddingTop: '5%',
  },
  formContainer: {
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    alignItems: 'center',
    paddingTop: imageWidth / 2,
    paddingBottom: 20,
  },
  image: {
    position: 'absolute',
    top: -imageWidth / 2,
    left: '50%',
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

export default SignUp;
