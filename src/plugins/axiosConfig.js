import axios from 'axios';
import store from '@/store'; // Import your Vuex store

axios.defaults.baseURL = 'http://127.0.0.1:8000';

axios.interceptors.request.use(
  function (config) {
    const authToken = localStorage.getItem('authToken');

    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Dispatch Vuex action to set loading state to true
    store.dispatch('setLoading', true);

    return config;
  },
  function (error) {
    store.dispatch('setLoading', false); // Dispatch action on request error
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  function (response) {
    store.dispatch('setLoading', false); // Dispatch action on successful response
    return response;
  },
  function (error) {
    store.dispatch('setLoading', false); // Dispatch action on response error
    return Promise.reject(error);
  }
);

export default axios;
