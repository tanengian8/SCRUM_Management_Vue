<template>
    <nav class="navbar">
        <div class="navbar-brand">
            <div class="navbar-header">
                <h1>SCRUM</h1>
                <h1>MANAGEMENT</h1>
            </div>

        </div>
        <hr>
        <div class="navbar-menu">
            <table class="navbar-table">
                <router-link class="link" to="/project">
                    <tr :class="{ 'selected-nav-item': currentPage === 'project' }">
                        <td class="navbar-icons">
                            <v-icon ref="project" color='#ffffff' icon="mdi-folder"></v-icon>
                        </td>
                        <td class="navbar-item">
                            Project
                        </td>
                    </tr>
                </router-link>
                <div v-if="this.currentProject != null">
                    <router-link class="link" to="/backlog">
                        <tr :class="{ 'selected-nav-item': currentPage === 'backlog' }">
                            <td class="navbar-icons">
                                <v-icon ref="backlog" color="#ffffff" icon="mdi-playlist-check"></v-icon>
                            </td>
                            <td class="navbar-item">
                                Backlog
                            </td>
                        </tr>
                    </router-link>
                    <router-link class="link" to="/rtm">
                        <tr :class="{ 'selected-nav-item': currentPage === 'rtm' }">
                            <td class="navbar-icons">
                                <v-icon ref="rtm" color="#ffffff" icon="mdi-view-list"></v-icon>
                            </td>
                            <td class="navbar-item">
                                RTM
                            </td>
                        </tr>
                    </router-link>
                    <router-link class="link" to="/scrum-board">
                        <tr :class="{ 'selected-nav-item': currentPage === 'scrum-board' }">
                            <td class="navbar-icons">
                                <v-icon ref="scrum-board" color="#ffffff" icon="mdi-view-dashboard"></v-icon>
                            </td>
                            <td class="navbar-item">
                                SCRUM Board
                            </td>
                        </tr>
                    </router-link>
                    <router-link class="link" to="/estimation">
                        <tr :class="{ 'selected-nav-item': currentPage === 'estimation' }">
                            <td class="navbar-icons">
                                <v-icon ref="estimation" color="#ffffff" icon="mdi-timer"></v-icon>
                            </td>
                            <td class="navbar-item">
                                Estimation
                            </td>
                        </tr>
                    </router-link>

                    <router-link class="link" to="/sprint">
                        <tr :class="{ 'selected-nav-item': currentPage === 'sprint' }">
                            <td class="navbar-icons">
                                <v-icon ref="sprint" color="#ffffff" icon="mdi-speedometer"></v-icon>
                            </td>
                            <td class="navbar-item">
                                Sprint
                            </td>
                        </tr>

                    </router-link>

                    <router-link class="link" to="/user-management">
                        <tr :class="{ 'selected-nav-item': currentPage === 'user-management' }">
                            <td class="navbar-icons">
                                <v-icon ref="user-management" color="#ffffff" icon="mdi-account-group"></v-icon>
                            </td>
                            <td class="navbar-item">
                                User Management
                            </td>
                        </tr>
                    </router-link>

                    <router-link class="link" to="/notification">
                        <tr :class="{ 'selected-nav-item': currentPage === 'notification' }">
                            <td class="navbar-icons">
                                <v-icon ref="notification" color="#ffffff" icon="mdi-bell"></v-icon>
                            </td>
                            <td class="navbar-item">
                                Notification
                            </td>
                        </tr>
                    </router-link>
                </div>



                <router-link class="link" to="/">
                    <tr>
                        <td class="navbar-icons">
                            <v-icon ref="logout" color="#ffffff" icon="mdi-logout"></v-icon>
                        </td>
                        <td class="navbar-item" @click="logout">
                            Log Out
                        </td>
                    </tr>
                </router-link>

            </table>

        </div>
        <div class="logo-container">
        </div>
    </nav>
</template>

<script>
import axios from '../plugins/axiosConfig';
export default {
    name: 'NavBar',
    data() {
        return {
            currentPage: ''
        };
    },
    mounted() {
        const routeSegments = this.$route.path.split('/');
        this.currentPage = routeSegments[1] || '';

        if (this.currentPage === 'add-sprint') {
            this.currentPage = 'sprint';
        }

        else if (this.currentPage === 'planning-poker') {
            this.currentPage = 'backlog';
        }

        this.$refs[this.currentPage].$el.style.color = '#0E1D3D';

        if (this.currentProject === null && (this.currentPage !== 'project' || this.currentPage === 'logout' || this.currentProject === "")) {
            alert("Please choose a project to manage.");
            this.$router.push('/project');
        }
    },

    methods: {
        async logout() {
            try {
                // Send a POST request to the logout endpoint
                const response = await axios.post('http://127.0.0.1:8000/api/logout');

                if (response.status === 200) {
                    // Clear the token from local storage
                    localStorage.removeItem('authToken');

                    //reset all state 
                    this.$store.commit('resetState');

                    // Redirect the user to the login page or any other page
                    console.log(response.data.message);
                    this.$router.push('/');
                } else {
                    // Handle error response
                    console.error('Logout failed:', response.data);
                }
            } catch (error) {
                // Handle network or other errors
                console.error('Logout failed:', error);
            }
        }
    },

}

</script>

<style scoped>
* {
    font-family: Lato;
}

.navbar {
    position: relative;
    display: block;
    background-color: #0E1D3D;
    height: 100vh;
    width: 100%;
}

.navbar-brand {
    position: relative;
    padding: 50px 50px 15px 50px;
    margin: 0;
    top: 0;
}

.navbar-menu {
    padding: 35px;
    padding-top: 0px;
    margin: 0;
}

h1 {
    font-weight: 900;
    font-size: 36px;
    margin-bottom: -10px;
    padding: 0;
    color: white;
}

v-icon {
    color: success;
}

.navbar-table {
    border-collapse: separate;
    border-spacing: 0 10px;
    /* Set the gap between rows */
    width: 100%;

}

td {
    padding: 15px;
}

.navbar-icons {
    width: 50px;
    padding-left: 20px;
    border-top-left-radius: 10px;
    /*not able to set border radius for tr*/
    border-bottom-left-radius: 10px;
}

.navbar-item {
    width: 296px;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    font-size: 25px;
}


.selected-nav-item {
    background-color: white;
    border-radius: 10px;
    box-shadow: 9px 6px 27.1px -6px rgba(0, 0, 0, 0.35);
    font-size: 30px;
    color: #0E1D3D;
    font-weight: 900;
}

.link {
    color: white;
    text-decoration: none;
}

.logo-container {
    position: absolute;
    bottom: 50px;
    width: 100%;
    text-align: center;
}

.navbar-table tr {
    transition: background-color 0.3s ease;
}

.navbar-table tr:hover {
    background-color: #285EAB;
}

hr {
    border: 1px solid white;
    width: 80%;
    margin: 0 auto;
    /* This will center the hr horizontally */
}

.navbar-header {
    display: flex;
    flex-direction: column;
    /* Items will be stacked vertically */
}

/* Style for each individual item */
.navbar-header>* {
    align-self: flex-start;
    /* Align each item to the start of the cross axis */
}
</style>
