import axios from 'axios';

const axiosClient = axios.create({
  baseURL: `${process.env.REACT_PUBLIC_BOT_SERVER_URL}api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const axiosLocalClient = axios.create({
  baseURL: process.env.REACT_PUBLIC_LOTUS_TEMPLE_URL // check if there is app url, replace it if using for another app
    ? process.env.REACT_PUBLIC_LOTUS_TEMPLE_URL
    : '/',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export default axiosClient;
