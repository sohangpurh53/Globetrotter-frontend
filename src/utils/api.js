import axios from 'axios';

// Use the proxy configured in vite.config.js
// const API_BASE_URL = '/api';
const API_BASE_URL = 'https://api.golobetrotte.digitaltek.co.in/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const fetchRandomDestination = async () => {
  try {
    const response = await api.get('/destinations/random/');
    return response.data;
  } catch (error) {
    console.error('Error fetching random destination:', error);
    throw error;
  }
};

export const submitGuess = async (city, guess, username) => {
  try {
    const response = await api.post('/guess/', { city, guess, username });
    return response.data;
  } catch (error) {
    console.error('Error submitting guess:', error);
    throw error;
  }
};

export const createUser = async (username) => {
  try {
    const response = await api.post('/users/', { username });
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const fetchUserProfile = async (username) => {
  try {
    const response = await api.get(`/users/${username}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const loginOrCreateUser = async (username) => {
  try {
    // First try to fetch the user profile
    try {
      const profile = await fetchUserProfile(username);
      return { profile, isNewUser: false };
    } catch (error) {
      // If user doesn't exist, create a new one
      if (error.response && error.response.status === 404) {
        const newUser = await createUser(username);
        const profile = await fetchUserProfile(username);
        return { profile, isNewUser: true };
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in loginOrCreateUser:', error);
    throw error;
  }
};

export default api; 