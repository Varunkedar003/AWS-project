import axios from "axios";

const API_BASE_URL = "https://043myauka5.execute-api.ap-south-1.amazonaws.com/prod";

export const submitVote = async (userId, candidate, location) => {
  const response = await axios.post(`${API_BASE_URL}/vote`, {
    userId,
    candidate,
    location
  });
  return response.data;
};

export const getResults = async () => {
  const response = await axios.get(`${API_BASE_URL}/results`);
  return response.data;
};

export const fetchLocations = async (type, value) => {
  const response = await axios.get(`${API_BASE_URL}/locations`, {
    params: { type, value }
  });

  return typeof response.data === "string"
    ? JSON.parse(response.data)
    : response.data;
};