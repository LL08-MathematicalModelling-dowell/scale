import axios from 'axios';
import config from '../config/index.js';

export const getLocationGoogle = async (lat, lng) => {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        latlng: `${lat},${lng}`,
        key: config.GOOGLE_API_KEY
      }
    });
    const data = response.data;

    if (data.status === 'OK' && data.results.length > 0) {
      return {
        success: true,
        message: "Location fetched successfully",
        data: data.results[0].formatted_address
      };
    } else {
      return {
        success: false,
        message: `Geocoding API error: ${data.status}`,
        data: ""
      };
    }
  } catch (error) {
    console.error('Error fetching location:', error.message);
    return {
      success: false,
      message: "Failed to fetch location",
      data: ""
    };
  }
};


