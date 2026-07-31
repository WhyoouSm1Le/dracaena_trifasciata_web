import axios from 'axios';

const READ_KEY = "UEBNHH4SWMEER51G".trim(); 
const CHANNEL_ID = "3399764";
const BASE_URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}`;

// Tambahkan WRITE API KEY akun ThingSpeak lu di sini bro
// (Silakan ganti string di bawah dengan Write API Key asli dari tab "API Keys" di ThingSpeak)
const WRITE_KEY = "V4HW3QB8WIHQ9Z9W".trim(); 
const UPDATE_URL = "https://api.thingspeak.com/update.json";

const apiService = {
  // --- METHOD READ (YANG LAMA) ---
  getField1: async (resultsCount = 2) => {
    try {
      const response = await axios.get(`${BASE_URL}/fields/1.json?api_key=${READ_KEY}&results=${resultsCount}`);
      return response.data; 
    } catch (error) {
      console.error("Error fetching field 1:", error);
      throw error;
    }
  },

  getField2: async (resultsCount = 2) => {
    try {
      const response = await axios.get(`${BASE_URL}/fields/2.json?api_key=${READ_KEY}&results=${resultsCount}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching field 2:", error);
      throw error;
    }
  },

  getField3: async (resultsCount = 2) => {
    try {
      const response = await axios.get(`${BASE_URL}/fields/3.json?api_key=${READ_KEY}&results=${resultsCount}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching field 3:", error);
      throw error;
    }
  },

  getFeeds: async (resultsCount = 2) => {
    try {
      const response = await axios.get(`${BASE_URL}/feeds.json?api_key=${READ_KEY}&results=${resultsCount}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching feeds:", error);
      throw error;
    }
  },


  // --- METHOD WRITE/UPDATE (YANG BARU UNTUK KONTROL) ---

  /**
   * Method untuk Kontrol Pompa (Field 4)
   * @param {number} status - Kirim nilai 1 untuk NYALA, atau 0 untuk MATI
   */
  updateField4: async (status) => {
    try {
      // Format URL: https://api.thingspeak.com/update.json?api_key=WRITE_KEY&field4=1
      const response = await axios.get(`${UPDATE_URL}?api_key=${WRITE_KEY}&field5=${status}`);
      return response.data; // ThingSpeak bakal balikin ID entry terakhir (angka > 0) kalau sukses
    } catch (error) {
      console.error("Error updating field 4 (Pompa):", error);
      throw error;
    }
  },

  /**
   * Method untuk Kontrol Kipas (Field 5)
   * @param {number} status - Kirim nilai 1 untuk NYALA, atau 0 untuk MATI
   */
  updateField5: async (status) => {
    try {
      // Format URL: https://api.thingspeak.com/update.json?api_key=WRITE_KEY&field5=1
      const response = await axios.get(`${UPDATE_URL}?api_key=${WRITE_KEY}&field4=${status}`);
      return response.data;
    } catch (error) {
      console.error("Error updating field 5 (Kipas):", error);
      throw error;
    }
  }
};

export default apiService;