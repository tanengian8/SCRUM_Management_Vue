<template>
    <div class="search-bar">
      <div class="search-container">
        <input
          type="text"
          v-model="searchTerm"
          @input="handleInput"
          placeholder="Search..."
          class="search-input"
        />
        <span class="mdi mdi-magnify search-icon"></span>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        searchTerm: ''
      };
    },
    methods: {
      handleInput() {
        // Emit an event to notify parent component about the input change
        this.$emit('input-change', this.searchTerm);
      }
    }
  };
  </script>
  
  <style scoped>
  .search-bar {
    display: flex;
    justify-content: center;
    padding-top:5px;
  }
  
  .search-container {
    position: relative;
    background-color: #ffffff;
    border-radius: 10px; /* Increased border-radius for a more rounded look */
    width: 750px; /* Adjust the width as needed */
    height: 60px; /* Increased height for better visibility */
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); /* Added a subtle box shadow */
  }
  
  .search-input {
    padding: 15px; /* Increased padding for better spacing */
    border: none;
    border-radius: 30px; /* Matched border-radius with the container */
    width: calc(100% - 60px); /* Adjusted width to accommodate the icon */
    font-size: 18px; /* Slightly increased font size for better readability */
    height: 100%; /* Made the input fill the container's height */
    font-family: 'Arial', sans-serif; /* Changed font to Arial */
    outline: none; /* Removed the default focus outline */

  }
  
  .search-icon {
    position: absolute;
    right: 20px; /* Adjusted the position for better alignment */
    top: 50%;
    transform: translateY(-50%);
    color: #555;
    font-size: 24px;
    cursor: pointer;
  }

  </style>
  