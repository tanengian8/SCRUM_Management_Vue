<template>
    <div class="main">
      <NavBar class="navbar" />
      <div class="content">
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script>
  import NavBar from '@/components/NavBar.vue'
  
  export default {
    name: 'ProjectLayout',
    components: { NavBar }
  }
  </script>
  
  <style scoped>
  .main {
    display: flex;
    position: fixed;
    width: 100%;
    padding: 0;
    margin: 0;
    
  }
  
  .navbar {
    max-width: 400px;
    position: fixed;
  }
  
  .content {
    flex: 1;
    padding: 75px 100px;
    margin: 0;
    margin-left: 400px;
    background-color: #f1f1f3;
    height: 100vh;
    overflow-y:auto;
    overflow-x:auto;
  }
  
  h1 {
    font-weight: bold;
    text-transform: capitalize;
  }

  /* Targeting the scrollbar track */
::-webkit-scrollbar {
    width: 12px; /* width of the scrollbar */
}

/* Targeting the scrollbar handle */
::-webkit-scrollbar-thumb {
    background-color: #888; /* color of the scrollbar handle */
    border-radius: 6px; /* rounded corners */
    transition: background-color 0.3s ease; /* smooth transition */
}

/* Optional: hover effect on scrollbar handle */
::-webkit-scrollbar-thumb:hover {
    background-color: #555; /* darker color on hover */
}

  </style>
  