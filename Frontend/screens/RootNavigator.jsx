import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserLogin,
  User,
  Organiser,
  LoadingScreen,
  SignUp,
  UserSignup,
  OrganiserLogin,
  OrganiserSignup,
} from '.'; // Make sure SignUp is imported
import {getCurrentOrganiserData} from '../API/organiser.api';
import {getCurrentUserData} from '../API/user.api';
import {logIn} from '../Store/Reducers/user.reducer';
import {createStackNavigator} from '@react-navigation/stack';

const RootNavigator = () => {
  const [userAuthToken, setUserAuthToken] = useState(null);
  const [organiserAuthToken, setOrganiserAuthToken] = useState(null);
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState(''); // For error messages
  const currentUser = useSelector(state => state.currentUser);
  const dispatch = useDispatch();
  const Stack = createStackNavigator();

  useEffect(() => {
    const fetchAuthTokens = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userAuthToken');
        const organiserToken = await AsyncStorage.getItem('organiserAuthToken');
        console.log(userToken);
        console.log(organiserToken);
        setUserAuthToken(userToken);
        setOrganiserAuthToken(organiserToken);

        if (userToken) {
          if (currentUser.accessToken === userToken) {
            // User already logged in
            console.log("present")
          } else {
            const result = await getCurrentUserData(userToken);
            console.log(result);
            if (result.error) {
              setError(result.error);
              await AsyncStorage.removeItem('userAuthToken');
              setUserAuthToken(null);
              console.log(error);
            } else {
              dispatch(logIn(result.data));
              setLoading(false);
            }
          }
        } else if (organiserToken) {
          if (currentUser.accessToken === organiserToken) {
            // Organiser already logged in
            console.log("present")
          } else {
            console.log("trying to get things up")
            const result = await getCurrentOrganiserData(organiserToken);
            console.log(result)
            if (result.error) {
              setError(result.error);
              await AsyncStorage.removeItem('organiserAuthToken');
              setOrganiserAuthToken(null);
            } else {
              console.log(result.data)
              dispatch(logIn({organiser:result.data,accessToken:organiserAuthToken,refreshToken:result.data.refreshToken}));
              console.log('ok')
              setLoading(false)
            }
          }
        }
      } catch (fetchError) {
        console.error('Error fetching tokens from AsyncStorage:', fetchError);
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchAuthTokens();
  }, [currentUser]);

  if (loading) {
    // Show loading screen while fetching tokens
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userAuthToken ? (
          <Stack.Screen 
            name="User" 
            component={User} 
            options={{ headerShown: false }} // Ensure header is disabled
          />
        ) : organiserAuthToken ? (
          <Stack.Screen 
            name="Organiser" 
            component={Organiser} 
            options={{ headerShown: false }} 
          />
        ) : (
          <>
            <Stack.Screen 
              name="UserLogin" 
              component={UserLogin} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="UserSignUp" 
              component={UserSignup} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="OrganiserLogin" 
              component={OrganiserLogin} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="OrganiserSignUp" 
              component={OrganiserSignup} 
              options={{ headerShown: false }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
  
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  errorBar: {
    backgroundColor: '#ffcccc',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#cc0000',
    fontSize: 14,
  },
});

export default RootNavigator;
