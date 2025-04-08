import axios from 'axios';
import {API_URL} from '@env';

const registerUser = async function (userCredentials) {
  const Api_URL = API_URL + '/user/register';
  try {
    if (!userCredentials) {
      return {error: 'userCredentials was not received'};
    } else {
      if (
        !userCredentials.email ||
        !userCredentials.fullName ||
        !userCredentials.username ||
        !userCredentials.password ||
        !userCredentials.confirmPassword
      ) {
        return {error: 'Please Send Complete Credentials'};
      } else {
        if (userCredentials.password !== userCredentials.confirmPassword) {
          return {error: 'Password and Confirm Password doesnt match'};
        } else {
          const result = await axios.post(Api_URL, userCredentials);
          if (result.data.data._id) {
            console.log('user', result.data);
            const loginResult = loginUser(userCredentials);
            return loginResult;
          } else {
            console.log(error);
            return {error};
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    return {
      error: 'user could not be registered due to some unexpected reasons',
    };
  } finally {
    console.log('registerUser Function Completed');
  }
};

const loginUser = async function (userCredentials) {
  const Api_URL = API_URL + '/user/login';
  try {
    if (!userCredentials) {
      console.log(userCredentials);
      return {error: 'userCredentials was not received'};
    } else {
      if (!userCredentials.email || !userCredentials.password) {
        return {error: 'userCredentials was not completely received'};
      } else {
        console.log("here")
        const result = await axios.post(Api_URL, userCredentials);
        if (result.data.data.user._id) {
          console.log('user', result.data);
          return result.data;
        } else {
          console.log(error);
          return {error};
        }
      }
    }
  } catch (error) {
    console.log(error);
    return {
      error: 'user could not be LOGGED IN due to some unexpected reasons',
    };
  } finally {
    console.log('loginUser Function Completed');
  }
};

const getCurrentUserData = async function (userAuthToken) {
  const Api_URL = API_URL + '/user/get-current-user';
  console.log(Api_URL);
  console.log(userAuthToken);
  try {
    if (!userAuthToken) {
      return {
        status: '400',
        message: 'userAuthToken is Not Provided',
      };
    }
    const body = {accessToken: userAuthToken};
    const result = await axios.post(Api_URL, body);
    console.log(result.data.statusCode);
    if (result.data.statusCode == 200) {
      console.log(result.data);
      return result.data;
    } else {
      return {error: 'invalid userAuthToken Received'};
    }
  } catch (error) {
    console.log('getCurrentUserData function has returned an error', error);
  } finally {
    console.log('getCurrentUserData function Complete');
  }
};

const logOutUser = async function (userAuthToken) {
  const Api_URL = API_URL + '/user/logout';
  try {
    if (!userAuthToken) {
      console.log('UserAuthToken not received');
      return {error: 'userAuthToken not received'};
    } else {
      const body = {accessToken: userAuthToken};
      const result = await axios.post(Api_URL, body);
      if (result.data.statusCode == 200) {
        return {message: 'success'};
      } else {
        return {error: 'user Could not be logged out'};
      }
    }
  } catch (error) {
    console.log(error);
    return {
      error: 'user could not be LOGGED OUT due to some unexpected reasons',
    };
  } finally {
    console.log('logOutUser function completed');
  }
};
const updateAccountDetails = async function (
  userAuthToken,
  fullName,
  address,
  phoneNo,
) {
  const Api_URL = API_URL + '/user/update-account-details';

  try {
    if (!userAuthToken || !fullName || !address || !phoneNo) {
      console.log(userAuthToken, fullName, address, phoneNo);
      return {error: 'Missing authentication token or required update data'};
    } else {
      const updatedData = {
        fullName: fullName,
        address: address,
        phoneNo: phoneNo,
        accessToken: userAuthToken,
      };

      const result = await axios.post(Api_URL, updatedData);

      if (result.data.user._id) {
        console.log('Updated User:', result.data);
        return result.data;
      } else {
        console.log('Error:', result.data);
        return {error: 'User update failed'};
      }
    }
  } catch (error) {
    console.log(error);
    return {
      error: 'User details could not be updated due to some unexpected reasons',
    };
  } finally {
    console.log('updateAccountDetails Function Completed');
  }
};
const Api_URL = API_URL + '/user/update-avatar'; // Change PORT to your backend port

const updateUserAvatar = async (Image, userAuthToken) => {
  try {
    console.log('Uploading User Image:', Image);
    // Convert Image to Proper File Format
    const formData = new FormData();
    formData.append('avatar', {
      uri: Image.uri,
      name: 'profile.jpg', // Change name as needed
      type: Image.type || 'image/jpeg', // Set proper MIME type
    });

    formData.append('accessToken', userAuthToken);

    console.log('User FormData:', formData);

    // Make Axios POST Request with Headers
    const response = await axios.post(Api_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    console.log('User Upload Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Update user avatar function returned an error:', error);
    return {error: 'Error uploading the image'};
  } finally {
    console.log('updateUserAvatar Function Completed');
  }
};
const getEventsByLocation = async (location) => {
  const Api_URL = API_URL + "/events/get-events-by-location";
  try {
    console.log("📤 Sending location:", location);

    const response = await axios.post(Api_URL, { location });

    console.log("📥 Received response:", response.data);

    return response.data.data; // Assuming API returns { events: [...] }
  } catch (error) {
    console.log("❌ Error fetching events:", error.response?.data || error.message);
    return [];
  }
};

const getAllFutureEvents = async () => {
  const Api_URL = API_URL + "/events/get-all-future-events";
  try {
    console.log("📤 Fetching all future events...");

    const response = await axios.post(Api_URL);

    console.log("📥 Received response:", response.data);

    return response.data.data; // Assuming API returns { events: [...] }
  } catch (error) {
    console.log("❌ Error fetching future events:", error.response?.data || error.message);
    return [];
  }
};

const searchEventsByNameOrLocation = async (searchText) => {
  const Api_URL = API_URL+"/events/search-events-by-name-or-location"
  try {
    console.log(searchText)
    const response = await axios.post(Api_URL, {
      searchText:searchText,
    });
    console.log(response.data.data)
    return response.data.data; // Assuming API response contains { events: [...] }
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};



export {
  registerUser,
  loginUser,
  getCurrentUserData,
  logOutUser,
  updateAccountDetails,
  updateUserAvatar,
  getEventsByLocation,
  searchEventsByNameOrLocation,
  getAllFutureEvents,
};
