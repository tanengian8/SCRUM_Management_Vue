<template>
    <ProjectLayout>
        <button class="function-button-blue" style="border-radius:60px;" @click="back"><i class="mdi mdi-arrow-left"
                style="font-size:20px"></i></button>
        <div class="planning-poker">
            <h1>Planning Poker</h1>
            <br>

            <!-- Description Card -->
            <div class="description-card">
                <h2 style="color:#1d0d3d">Estimation for: {{ sprintDetails.description }}</h2>
            </div>

            <br>
            <div class="estimation-container" v-if="sessionDetails.estimation === null">
                <div class="estimation-title">
                    <!-- Choose your card text -->
                    <h2 style="text-decoration:underline; color: #0d1d3d">Choose your card:</h2>
                </div>

                <br>
                <!-- Estimation Cards -->
                <div class="estimation-cards">
                    <div class="estimation-card" v-for="estimation in estimations" :key="estimation"
                        @click="confirmEstimation(estimation)">
                        {{ estimation }}
                    </div>
                </div>

            </div>

            <div v-else>
                <h2 style="color:#1d0d3d">You have chosen the estimation point: {{ sessionDetails.estimation }}</h2>
            </div>

            <br>

            <div class="fucntion-button-blue-container"
                v-if="(projectAuthority.isSM || projectAuthority.isCreator||projectAuthority.isTM) && !sessionDetails.sessionStatus">
                <button class="function-button-blue" style="border-radius:10px;"
                    @click="toggleSequenceNumberForm">Change Sequence Number</button>
            </div>

            <br>
            <div class="fucntion-button-blue-container" v-if="sessionDetails.sessionStatus">
                <button class="function-button-blue" style="border-radius:10px;" @click="revote">Revote</button>
            </div>

            <!-- Sticky Notes -->
            <div class="sticky-notes-container">
                <div class="sticky-notes">
                    <div class="note-card" v-for="(note, index) in notes" :key="index">
                        <div class="note-content">{{ note.description }}</div>
                        <div class="note-user">- {{ note.username }}</div>
                        <div class="note-user">{{ note.created_at }}</div>
                    </div>
                    <textarea v-model="noteDescription" placeholder="Add your note..."></textarea>
                    <div class="add-note-container">
                        <button @click="addNotes" class="add-note-button">+</button>
                    </div>
                </div>
            </div>
        </div>


    </ProjectLayout>

    <!-- Choose sequence number overlay -->
    <div class="popout-overlay" v-if="showSequenceNumberForm">
        <div class="popout-modal">
            <PopoutLayout pageTitle="Sequence Number">
                <div class="form-group">
                    <h2 style="margin-top:0px">Choose Your Sequence Number</h2>
                    <h4 style="padding-bottom:10px">NOTE: If the session is ongoing, changing sequence number will reset
                        the session.</h4>
                    <h4 style="padding-bottom:10px"> Enter your sequence number and separate by comma. Example: 1,3,5
                    </h4>
                    <input type="text" v-model="sequenceNumber" placeholder="Enter sequence number">
                </div>

                <div class="button-container-first">
                    <div class="button-container-second">
                        <button class="function-button-blue" @click="resetSequenceNumber">Fibonacci
                            Sequence</button>
                    </div>

                    <div class="button-container-third">
                        <div class="empty-space">
                            <button class="function-button-blue" @click="confirmChangeSequenceNumber">Confirm</button>
                        </div>
                        <button class="function-button-red" @click="cancelSequenceNumber">Cancel</button>
                    </div>
                </div>
            </PopoutLayout>
        </div>
    </div>

    <!-- Loading overlay -->
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
import PopoutLayout from '@/layout/PopoutLayout.vue';

export default {
    name: 'PlanningPoker',
    components: { ProjectLayout, Loading, PopoutLayout },
    data() {
        return {
            description: "Your task description",
            users: ["User1", "User2", "User3", "User4", "User5", "User6", "User7", "User8"], // Add more users dynamically
            estimations: [], // Estimation cards
            sessionDetails: {},
            sprintDetails: {},
            noteDescription: "",
            notes: [],
            showSequenceNumberForm: false,
            sequenceNumber: "",

        };
    },
    methods: {
        back() {
            this.$router.push('/backlog');
        },

        async confirmEstimation(estimation) {
            if (confirm(`Do you want to choose ${estimation}?`)) {
                try {
                    //pass in sessionID, projectID, estimation
                    const response = await axios.post('http://127.0.0.1:8000/api/updatePlanningPokerEstimation', {
                        sessionID: this.planningPoker,
                        projectID: this.currentProject,
                        estimation: estimation,
                        sprintBacklogID: this.sprintDetails.id,
                    });

                    if (response.status === 200) {
                        // Get the session details
                        this.getSessionDetails();
                        this.getNotes();
                        alert("Estimation confirmed successfully.");
                    }
                }
                catch (error) {
                    alert('Failed to confirm estimation:', error);
                }
            }
        },

        toggleSequenceNumberForm() {
            this.showSequenceNumberForm = !this.showSequenceNumberForm;
        },

        async confirmChangeSequenceNumber() {
            if (this.sequenceNumber === "") {
                alert("Please enter a sequence number.");
                return;
            }

            // Regular expression to check if the input consists of only numbers separated by commas (with optional spaces)
            const regex = /^\s*\d+\s*(,\s*\d+\s*)*$/;

            if (!regex.test(this.sequenceNumber)) {
                alert("The sequence number entered must be a number and separated by commas. Example: 1, 3, 5");
                return;
            }

            else {
                try {
                    //pass in sessionID, projectID, sequenceNumber
                    const response = await axios.post('http://127.0.0.1:8000/api/createSequenceNumber', {
                        sessionID: this.planningPoker,
                        projectID: this.currentProject,
                        sequence: this.sequenceNumber,
                    });

                    if (response.status === 200) {
                        // Get the sequence number
                        this.getSequenceNumber();
                        this.getNotes();
                        this.getSessionDetails();
                        this.showSequenceNumberForm = false;
                        this.sequenceNumber = "";
                        alert("Sequence number changed successfully.");
                    }

                    else {
                        alert("Failed to change sequence number.");
                    }

                }
                catch (error) {
                    alert('Failed to change sequence number:', error);
                }
            }
        },

        cancelSequenceNumber() {
            this.sequenceNumber = "";
            this.showSequenceNumberForm = false;
        },

        async addNotes() {
            if (this.noteDescription === "") {
                alert("Please enter a note.");
                return;
            }

            else {
                try {
                    //pass in sessionID, projectID, note
                    const response = await axios.post('http://127.0.0.1:8000/api/addNotes', {
                        sessionID: this.planningPoker,
                        description: this.noteDescription,
                    });

                    if (response.status === 200) {
                        // Get the notes
                        this.getNotes();
                        this.noteDescription = "";
                        alert("Note added successfully.");
                    }
                }
                catch (error) {
                    alert('Failed to add note:', error);
                }
            }
        },

        async getSessionDetails() {
            try {
                //pass in sessionID, projectID
                const response = await axios.get('http://127.0.0.1:8000/api/getSessionDetails', {
                    params: {
                        sessionID: this.planningPoker,
                        projectID: this.currentProject,
                    },
                });

                if (response.status === 200) {
                    // Get the session details
                    this.sessionDetails = response.data.sessionDetails;
                    this.sprintDetails = response.data.sprintDetails;
                    console.log(this.sessionDetails);
                    console.log(this.sprintDetails);
                }

            }
            catch (error) {
                alert('Failed to get session details:', error);
            }
        },

        async getNotes() {
            try {
                //pass in sessionID, projectID
                const response = await axios.get('http://127.0.0.1:8000/api/getNotes', {
                    params: {
                        sessionID: this.planningPoker,
                    },
                });

                if (response.status === 200) {
                    // Get the notes
                    this.notes = response.data.notes;

                    //for each note format the date
                    for (let note of this.notes) {
                        note.created_at = new Date(note.created_at).toLocaleString();
                    }
                }
            }
            catch (error) {
                alert('Failed to get notes:', error);
            }
        },

        async revote() {
            //ask user to confirm revote
            if (!confirm("Are you sure you want to revote?")) {
                return;
            }

            try {
                const response = await axios.post('http://127.0.0.1:8000/api/revote', {
                    sessionID: this.planningPoker,
                    projectID: this.currentProject,
                });

                if (response.status === 200) {
                    // Get the session details
                    this.getSessionDetails();
                    this.getNotes();
                    alert("You have initiated a revote.");
                }

            }

            catch (error) {
                alert('Failed to revote:', error);
            }
        },

        async getSequenceNumber() {
            try {
                //pass in sessionID, projectID
                const response = await axios.get('http://127.0.0.1:8000/api/getSequenceNumber', {
                    params: {
                        sessionID: this.planningPoker,
                        projectID: this.currentProject,
                    },
                });

                if (response.status === 200) {
                    //for each of the response sequence number, format it to be an array
                    if (response.data.sequenceNumber) {
                        this.estimations = response.data.sequenceNumber.split(",").map(numStr => parseInt(numStr.trim()));
                        this.estimations.sort((a, b) => a - b);
                    }

                    else {
                        this.estimations = [1, 2, 3, 5, 8, 13, 21, 34];
                    }
                }
            }

            catch (error) {
                alert('Failed to get sequence number:', error);
            }
        },

        async resetSequenceNumber() {
            //ask user to confirm if want to change sequence number to fibonacci sequence
            if (!confirm("Are you sure you want to reset the sequence number to Fibonacci Sequence?")) {
                return;
            }

            try {
                //pass in sessionID, projectID
                const response = await axios.post('http://127.0.0.1:8000/api/resetSequenceNumber', {
                    sessionID: this.planningPoker,
                    projectID: this.currentProject,
                });

                if (response.status === 200) {
                    // Get the sequence number
                    this.getSequenceNumber();
                    this.getNotes();
                    this.showSequenceNumberForm = false;
                    alert("Sequence number reset successfully.");
                }

                else {
                    alert("Failed to reset sequence number.");
                }
            }

            catch (error) {
                alert('Failed to reset sequence number:', error);
            }
        }
    },

    created() {
        this.getSessionDetails();
        this.getNotes();
        this.getSequenceNumber();
    }
};

</script>

<style scoped>
.planning-poker {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    top: -5px;
    padding-right:100px;
    /* Adjust the value as needed */
}


.user-list {
    width: 100%;
    border-collapse: collapse;
}

.user-list th,
.user-list td {
    border: 1px solid #ccc;
    padding: 10px;
    text-align: center;
}

.user-list th {
    background-color: #f0f0f0;
}

.description-card {
    margin-bottom: 20px;
    padding: 20px;
    height: 500px;
    width: 700px;
    border: 1px solid #ccc;
    border-radius: 50px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    border-color: #4b6fbc;
}


.estimation-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
}

.estimation-card {
    cursor: pointer;
    margin: 5px;
    padding: 10px 20px;
    border: 1px solid #ccc;
    border-radius: 20px;
    background-color: #0D1D3D;
    color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s;
    height: 80px;
    width: 80px;
    justify-content: center;
    display: flex;
    align-items: center;
    font-size: 20px;
}

.add-note-button:hover,
.estimation-card:hover {
    background-color: #285EAB;
}

.sticky-notes-container {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    overflow-y: auto;
    padding: 50px;
    padding-top: 120px;
}

.sticky-notes {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;

}

.sticky-notes textarea {
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 15px;
    height: 80px;
    width: 250px;
    resize: none;
}

.note-card {
    border: 1px solid #ccc;
    padding: 10px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-color: #0D1D3D;
    background-color: #fff;
    border-radius: 15px;
    max-height: 500px;
    width: 250px;
    resize: none;
}

.note-content {
    margin-bottom: 5px;
}

.note-user {
    font-style: italic;
    color: #666;
}

.estimation-title {
    display: flex;
    align-items: center;
}

.add-note-button {
    cursor: pointer;

    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #0D1D3D;
    color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s;
    height: 50px;
    width: 50px;
    justify-content: center;
    align-items: center;
    font-size: 30px;
}

.add-note-container {
    display: flex;
    justify-content: center;
}

.estimation-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.button-container-third {
    display: flex;
    padding-left: 155px;
}
</style>