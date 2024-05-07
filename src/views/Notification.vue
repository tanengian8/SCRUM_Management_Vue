<template>
    <ProjectLayout>
        <h1> Notification</h1>
        <br>
        <div class="user-card user-header" style="padding:15px">
            <div class="user-info">
                <div style="width: 900px;">Description</div>
                <div class="created-at" style="width: 400px;">Created At</div>
                <div style="width: 200px;">Status</div>
                <div class="user-actions" style="width: 200px;">
                    <div>Action</div>
                </div>
            </div>
        </div>
        <div v-for="(notification, index) in notifications" :key="index" class="user-card">

            <div class="user-info">
                <div style="width: 900px;">A planning poker game has been initiated for the sprint backlog:
                    {{ notification.description }}</div>
                <div class="created-at" style="width:400px">{{ notification.created_at }}</div>
                <div style="width:200px; padding-top:5px;">
                    <div class="in-progress" v-if="!notification.sessionStatus">In Progress</div>
                    <div v-else class="completed">Completed</div>
                </div>
                
                <div class="user-actions" style="width:200px;" v-if="notification.estimation === null && !notification.sessionStatus">
                    <button class="function-button-blue" @click="joinGame(notification.sessionID)">Join</button>
                </div>
                <div class="user-actions" style="width:200px; padding-top:5px;" v-else>
                    <div class="completed">Completed</div>
                </div>
            </div>
        </div>

    </ProjectLayout>


    <!-- Add project overlay -->
    <div class="popout-overlay" v-if="showAddProjectForm">
        <div class="popout-modal">
            <AddProject @togglePopout="manageEventProject" />
        </div>
    </div>

    <div class="popout-overlay" v-if="isLoading">
        <div class="popout-modal">
            <Loading />
        </div>
    </div>

</template>

<script>
import ProjectLayout from '@/layout/ProjectLayout.vue'
import Loading from '@/components/Loading.vue'
import axios from 'axios';

export default {
    name: 'Notification',
    components: {
        ProjectLayout,
        Loading,
    },

    data() {
        return {
            notifications: [],
            showAddProjectForm: false,
            dataFinishLoading: false,
        };
    },



    mounted() {
    },

    beforeUnmount() {
    },

    methods: {
        async getNotification() {
            try {
                //pass in the project ID
                const response = await axios.get('http://127.0.0.1:8000/api/getNotification', {
                    params: {
                        projectID: this.currentProject,
                    },
                });

                if (response.status === 200) {
                    // Get the notifications
                    this.notifications = response.data.notifications;

                    // Get the sprint backlog data
                    const sprintBacklog = response.data.sprintBacklog;
                    console.log(sprintBacklog);

                    // Loop through each notification
                    this.notifications.forEach(notification => {
                        //modify the created_at to be more readable
                        notification.created_at = new Date(notification.created_at).toLocaleString();
                        // Find the corresponding sprint backlog item
                        const matchingSprint = sprintBacklog.find(sprint => sprint.id === notification.sprintBacklogID);

                        // If a matching sprint backlog item is found
                        if (matchingSprint) {
                            // Append the sprint description to the notification
                            notification.description = matchingSprint.description;
                            console.log(this.notifications);
                        } else {
                            // Handle case where no matching sprint backlog item is found
                            console.error(`No sprint backlog found for sprintBacklogID: ${notification.sprintBacklogID}`);
                        }
                    });
                }

            } catch (error) {
                console.error(error);
            }
        },

        joinGame(sessionID) {
            this.setPlanningPoker(sessionID);
            this.$router.push('/planning-poker');
        },
    },

    created() {
        this.getNotification();
    },
};

</script>

<style scoped>

</style>
