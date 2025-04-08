import {API_URL} from '@env';
import axios from 'axios';

const registerOrganiser = async function (organiserCredentials) {
  const Api_URL = API_URL + '/organiser/register';
  try {
    if (!organiserCredentials) {
      console.log('organiserCredentials not received');
      return {error: 'organiserCredentials not received'};
    } else {
      if (
        !organiserCredentials.email ||
        !organiserCredentials.username ||
        !organiserCredentials.fullName ||
        !organiserCredentials.password ||
        !organiserCredentials.confirmPassword
      ) {
        return {error: 'Please Send Complete Credentials'};
      } else {
        if (
          organiserCredentials.password !== organiserCredentials.confirmPassword
        ) {
          return {error: 'Password and Confirm Password doesnt match'};
        } else {
          const result = await axios.post(Api_URL, organiserCredentials);
          console.log(result.data.data);
          if (result.data.data._id) {
            console.log('organiser', result.data);
            const loginResult = loginOrganiser(organiserCredentials);
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
      error: 'organiser could not be registered due to some unexpected reasons',
    };
  } finally {
    console.log('registerOrganiser function complete');
  }
};

const loginOrganiser = async function (organiserCredentials) {
  const Api_URL = API_URL + '/organiser/login';
  try {
    if (!organiserCredentials) {
      console.log(!organiserCredentials);
      return {error: 'organiserCredentials was not received'};
    } else {
      if (!organiserCredentials.email || !organiserCredentials.password) {
        return {error: 'organiserCredentials was not completely received'};
      } else {
        console.log('hello');
        const result = await axios.post(Api_URL, organiserCredentials);
        console.log(result);
        if (result.data.data.organiser._id) {
          console.log('organiser', result.data);
          return result.data;
        } else {
          console.log('login return error');
          return {error: 'login backend returned error'};
        }
      }
    }
  } catch (error) {
    console.log(error);
    return {
      error: 'organiser could not be Logged In due to some unexpected reasons',
    };
  } finally {
    console.log('loginOrganiser Function Completed');
  }
};

const getCurrentOrganiserData = async function (organiserAuthToken) {
  const Api_URL = API_URL + '/organiser/get-current-organiser';
  console.log(Api_URL);
  console.log(organiserAuthToken);
  try {
    if (!organiserAuthToken) {
      return {
        status: '400',
        message: 'organiserAuthToken is Not Provided',
      };
    }
    const body = {accessToken: organiserAuthToken};
    const result = await axios.post(Api_URL, body);
    console.log(result.data.statusCode);
    if (result.data.statusCode == 200) {
      console.log(result.data);
      return result.data;
    } else {
      return {error: 'invalid organiserAuthToken Received'};
    }
  } catch (error) {
    console.log(
      'getCurrentOrganiserData function has returned an error',
      error,
    );
    return {"error": "occured some error" }
  } finally {
    console.log('getCurrentOrganiserData function Complete');
  }
};

const logOutOrganiser = async function (organiserAuthToken) {
  const Api_URL = API_URL + '/organiser/logout';
  try {
    if (!organiserAuthToken) {
      console.log('organiserAuthToken not received');
      return {error: 'organiserAuthToken not received'};
    } else {
      const body = {accessToken: organiserAuthToken};
      const result = await axios.post(Api_URL, body);
      console.log(result);
      if (result.data.statusCode == 200) {
        return {message: 'success'};
      } else {
        return {error: 'organiser Could not be logged out'};
      }
    }
  } catch (error) {
    console.log(error);
    return {
      error: 'orgnaiser could not be LOGGED OUT due to some unexpected reasons',
    };
  } finally {
    console.log('logOutOrganiser function completed');
  }
};

const updateAvatar = async function (Image, organiserAuthToken) {
  const Api_URL = API_URL + '/organiser/update-avatar'; // Change PORT to your backend port

  try {
    console.log('Uploading Image:', Image);

    // Convert Image to Proper File Format
    const formData = new FormData();
    formData.append('avatar', {
      uri: Image.uri,
      name: 'profile.jpg', // Change name as needed
      type: Image.type || 'image/jpeg', // Set proper MIME type
    });

    formData.append('accessToken', organiserAuthToken);

    console.log('FormData:', formData);

    // Make Axios POST Request with Headers
    const response = await axios.post(Api_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    console.log('Upload Response:', response.data);
  } catch (error) {
    console.error('Update avatar function returned an error:', error);
    return {error: 'Error uploading the image'};
  } finally {
    console.log('updateAvatar Function Completed');
  }
};

const editProfile = async function (
  fullName,
  username,
  phoneNo,
  address,
  website,
  facebook,
  twitter,
  instagram,
  linkedin,
  youtube,
  accessToken,
) {
  const url = API_URL + '/organiser/update-account-details'; // Add the appropriate URL for your backend

  if (!fullName || !username || !phoneNo) {
    alert('Full Name, Username, and Phone Number are required fields.');
    return; // Exit if any of the major fields are missing
  }
  const data = {
    fullName,
    username,
    phoneNo,
    address: address || '', // If not provided, set it as empty string
    website: website || '', // If not provided, set it as empty string
    socialLinks: {},
    accessToken, // Initialize socialLinks as empty object
  };

  if (facebook) data.socialLinks.facebook = facebook;
  if (twitter) data.socialLinks.twitter = twitter;
  if (instagram) data.socialLinks.instagram = instagram;
  if (linkedin) data.socialLinks.linkedin = linkedin;
  if (youtube) data.socialLinks.youtube = youtube; // Add YouTube if provided

  try {
    const response = await axios.post(url, data);
    console.log(response);
    if (response.data.statusCode != 200) {
      // Handle server-side errors (e.g., 400, 500)
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }
    return {success: 'Profile Updated Successfully'};
  } catch (error) {
    console.log('organiser edit profile function has returned error');
    return {error: error.message};
  } finally {
    console.log('edit profile fucntion completed');
  }
};

const createOrUpdateEvent = async function (
  name,
  description,
  startingDate,
  endingDate,
  startingTime,
  endingTime,
  location,
  locationUrl,
  price,
  ticketsAvailable,
  ticketSellingDate,
  tags,
  category,
  accessToken,
  poster,
  eventId // Added eventId parameter
) {
  let Api = API_URL + '/events/create-or-update-event';
  try {
    const requiredParams = {
      name,
      description,
      startingDate,
      endingDate,
      startingTime,
      endingTime,
      location,
      price,
      ticketsAvailable,
      ticketSellingDate,
      category,
      accessToken,
      poster,
    };

    // Check if any required parameter is missing
    for (const [key, value] of Object.entries(requiredParams)) {
      if (value === undefined || value === null || value === '') {
        return { error: `Missing or invalid parameter: ${key}` };
      }
    }

    // Convert numeric values
    price = Number(price);
    ticketsAvailable = Number(ticketsAvailable);

    if (isNaN(price) || isNaN(ticketsAvailable)) {
      return { error: 'Invalid numeric value for price or ticketsAvailable' };
    }

    const formData = new FormData();
    console.log(poster);
    if (poster) {
      formData.append('poster', {
        uri: poster.uri,
        name: poster.name || 'poster.jpg',
        type: poster.type || 'image/jpeg',
      });
    } else {
      return { error: 'Invalid poster data' };
    }
    
    console.log(accessToken);

    // Append other form data
    formData.append('name', name);
    formData.append('description', description);
    formData.append('startingDate', startingDate.toISOString());
    formData.append('endingDate', endingDate.toISOString());
    formData.append('startingTime', startingTime.toISOString());
    formData.append('endingTime', endingTime.toISOString());
    formData.append('location', location);
    formData.append('locationUrl', locationUrl);
    formData.append('price', price);
    formData.append('ticketsAvailable', ticketsAvailable);
    formData.append('ticketSellingDate', ticketSellingDate.toISOString());
    formData.append('tags', JSON.stringify(tags)); // Ensure array/string is properly handled
    formData.append('category', category);
    formData.append('accessToken', accessToken);

    // Add eventId only if it's provided
    if (eventId) {
      formData.append('eventId', eventId);
    }

    console.log('All parameters are valid, proceeding with event creation...');
    console.log('FormData:', formData);

    // Return the formData (or send it via API)
    const response = await axios.post(Api, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
    console.log(response);
    return response;
  } catch (error) {
    console.log('createEvent function encountered an error:', error);
    return { error: error.message || 'Unknown error' };
  } finally {
    console.log('createEvent function execution complete.');
  }
};


const getEventById = async function (eventId, organiserAuthToken) {};
const getEventsByOrganiserId = async function (
  organiserId,
  organiserAuthToken,
) {};
const getSecuredEventsByOrganiserId = async function (organiserAuthToken) {
  const Api = API_URL + '/events/get-secured-events-by-organiser-id';
  try {
    if (!organiserAuthToken) {
      return {
        error: 'organiserAuthToken is Not Provided',
      };
    }
    console.log(organiserAuthToken);
    const body = {accessToken: organiserAuthToken};
    const result = await axios.post(Api, body);
    if (result.data.statusCode == 200) {
      console.log(result.data);
      return result.data.data;
    } else {
      return {error: 'invalid organiserAuthToken Received'};
    }
  } catch (error) {
    console.log('getsecuredEvents function has returned an error', error);
    return {error: error.message};
  } finally {
    console.log('getsecuredEvents function Complete');
  }
};
const deleteEvent = async function (organiserAuthToken, EventId) {
  const url = API_URL+"/events/delete-event"
  console.log(organiserAuthToken)
  try {
    if (!organiserAuthToken || !EventId) {
      return { error: "the organiserAuthToken or EventId is not received"}
    }
    const response = await axios.post(url,{
      accessToken:organiserAuthToken,
      eventId:EventId
    })
    console.log(response)
    return response
  } catch (error) {
    console.log("deleteEvent funtion have returned error",error)
  } finally{
    console.log("delete Event function completed")
  }
};
export {
  registerOrganiser,
  loginOrganiser,
  getCurrentOrganiserData,
  logOutOrganiser,
  updateAvatar,
  editProfile,
  createOrUpdateEvent,
  getEventById,
  getEventsByOrganiserId,
  getSecuredEventsByOrganiserId,
  deleteEvent
};


