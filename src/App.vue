<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>
import router from './router';
import './assets/style/global.css'
import axios from 'axios';

export default {
  name: 'App',
  data() {
    return {
    };
  },
  components: {
    router
  },

  created() {
    //this.setLoading(false);
    // Check if there's a token in localStorage
    //delete token, future implementation, when user checks, if token is valid then redirect, else delete local token
    const token = localStorage.getItem('authToken');
    if (!token) {
      // Redirect to dashboard 
      router.push({ path: '/' }); // Use router instance directly
      const idleDuration = 15 * 60 * 1000; // 15 minutes
      let lastActivity = Date.now();

      const checkIdle = () => {
        const now = Date.now();
        if (now - lastActivity > idleDuration) {
          //delete token if logout cannot be executed (axios request expired)

          //also reset state from vuex
          this.$store.commit('resetState');
          localStorage.removeItem('authToken');

          //redirect to login page
          router.push({ path: '/' });
          alert("Session expired!");
        }
      };

      window.addEventListener('mousemove', () => {
        lastActivity = Date.now();
      });

      setInterval(checkIdle, 1000);
    }

    //if is loading = true, after 1 minute still not loaded, then set loading to false, alert user
    setTimeout(() => {
      if (this.isLoading) {
        this.setLoading(false);
        alert('Failed to load data');
      }
    }, 30000);

  }

};

</script>
<style></style>