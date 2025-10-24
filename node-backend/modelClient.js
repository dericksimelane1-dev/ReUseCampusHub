import axios from 'axios';

const API_BASE = 'http://localhost:5000';

async function categorizeItem(description) {
  try {
    const response = await axios.post(`${API_BASE}/categorize`, { description });
    console.log('Predicted Category:', response.data.category);
    return response.data.category;
  } catch (error) {
    console.error('Error categorizing item:', error.message);
  }
}

async function getRecommendations(userId) {
  try {
    const response = await axios.get(`${API_BASE}/recommend/${userId}`);
    console.log('Recommended Items:', response.data.items);
    return response.data.items;
  } catch (error) {
    console.error('Error getting recommendations:', error.message);
  }
}

async function findNearbyItems(latitude, longitude) {
  try {
    const response = await axios.post(`${API_BASE}/nearby`, { latitude, longitude });
    console.log('Nearby Items:', response.data.items);
    return response.data.items;
  } catch (error) {
    console.error('Error finding nearby items:', error.message);
  }
}

(async () => {
  await categorizeItem("High-performance laptop for programming");
  await getRecommendations(1);
  await findNearbyItems(49.2606, -123.2460);
})();