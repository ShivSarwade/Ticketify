import axios from 'axios';
import {API_URL} from '@env';

// user tickets functions

const purchaseTicket = async (userAuthToken, eventId, quantity) => {
  const Api_URL = `${API_URL}/tickets/purchase-ticket`; // Ensure correct URL format
  if (!userAuthToken || !eventId || !quantity) {
    return {
      error: 'Missing required fields: accessToken, eventId, or quantity',
    };
  }

  try {
    const response = await axios.post(Api_URL, {
      accessToken: userAuthToken, // Sending token in body
      eventId,
      quantity,
    });
    console.log('hello', response);
    return response.data; // Successfully purchased ticket
  } catch (error) {
    console.error(
      'Error purchasing ticket:',
      error?.response?.data?.error || error.message,
    );
    return {
      error:
        error?.response?.data?.error ||
        'purchaseTicket function encountered an error',
    };
  }
};

const getMyTickets = async userAuthToken => {
  const Api_URL = `${API_URL}/tickets/get-my-tickets`; // Ensure correct URL format

  if (!userAuthToken) {
    return {error: 'Missing required field: accessToken'};
  }
  console.log('i tried');
  try {
    const response = await axios.post(Api_URL, {accessToken: userAuthToken});
    console.log(response);
    return response.data; // Successfully retrieved tickets
  } catch (error) {
    console.error(
      'Error fetching tickets:',
      error?.response?.data?.error || error.message,
    );
    return {
      error:
        error?.response?.data?.error ||
        'getMyTickets function encountered an error',
    };
  }
};

const returnTicket = async (userAuthToken, ticketId) => {
  const Api_URL = `${API_URL}/tickets/return-ticket`;

  if (!userAuthToken || !ticketId) {
    return {error: 'Missing required field: accesstoken'};
  }
  console.log('i tries always', userAuthToken, ticketId);
  try {
    const response = await axios.post(Api_URL, {
      accessToken: userAuthToken,
      ticketId,
    });
    console.log(response);
    return response.data;
  } catch (error) {
    console.error(
      'Error fetching tickets:',
      error?.response?.data?.error || error.message,
    );
    return {
      error:
        error?.response?.data?.error ||
        'getMyTickets function encountered an error',
    };
  }
};

// organizer tickets function
const getAllTickets = async (userAuthToken, ticketId) => {
  const Api_URL = `${API_URL}/tickets/get-all-tickets`;
  try {
    const response = await axios.post(Api_URL);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error(
      'Error fetching tickets:',
      error?.response?.data?.error || error.message,
    );
    return {
      error:
        error?.response?.data?.error ||
        'getMyTickets function encountered an error',
    };
  }
};
const getTicketsByEventId = async (organiserAuthToken, eventId) => {
  const Api_URL = `${API_URL}/tickets/get-tickets-by-event-id`;
  console.log("i ma trying")
  try {
    const response = await axios.post(Api_URL, {
      accessToken:organiserAuthToken, // Sending auth token in body
      eventId,       // Sending eventId in body
    });

    console.log("Tickets fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching tickets:",
      error?.response?.data?.error || error.message
    );
    return {
      error:
        error?.response?.data?.error ||
        "getTicketsByEventId function encountered an error",
    };
  }
};
const scanTicketApi = async (Image, organizerAuthToken) => {
  console.log("trying to work")
  console.log(Image,organizerAuthToken)
  const Api_URL = API_URL+"/tickets/scan-ticket"
  try {
    console.log("Uploading QR Code Image:", Image);
    console.log(Image)
    // Convert Image to Proper File Format
    const formData = new FormData();
    formData.append("ticket", {
      uri: Image.uri,
      name: `${Date.now()}_ticket.jpg`, // Change name as needed
      type: Image.type || "image/jpeg", // Set proper MIME type
    });

    formData.append("accessToken", organizerAuthToken);

    console.log("QR Scan FormData:", formData);

    // Make Axios POST Request with Headers
    const response = await axios.post(Api_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
    console.log(response)
    console.log("QR Scan Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("scanTicketApi function returned an error:", error);
    return { error: "Error scanning the QR code" };
  } finally {
    console.log("scanTicketApi Function Completed");
  }
};

export {purchaseTicket, getMyTickets, returnTicket, getAllTickets, getTicketsByEventId, scanTicketApi}
