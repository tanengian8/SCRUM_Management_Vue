<template>
    <ProjectLayout>
        <div v-if="!activeSprint">
            <NotFoundV2 :title="'Oops, looks like you dont have any sprint backlog yet.'"
                :subtitle="'Dont worry! Create your first sprint backlog and the SCRUM Board will be auto-generated!'" />
        </div>
        <div v-else>
            <h1>SCRUM Board</h1>
            <h2> The SCRUM Board will show the all sprint backlogs. </h2>
            <br>
            <div class="scrumboard">
                <div class="status-container">
                    <div v-for="(board, index) in status" :key="index" class="board" :id="`board-${board.name}`"
                        @drop="onDrop($event, board.name)" @dragenter.prevent @dragover.prevent
                        style="text-align: center !important;">
                        <h2 :class="getStatusClass(board.name)" style="font-size:20px;">{{ board.name }}</h2>
                        <div v-for="item in getList(board.name)" :key="item.id" class="drag-el"
                            :draggable="getAuthority()" @dragstart="startDrag($event, item)">
                            <div class="item-container">
                                <div class="item-title">{{ item.description }}</div>
                                <div class="assigned-container">
                                    <div class="assigned-to">
                                        Assigned to: </div>
                                    <div class="selected-container">
                                        <select v-if="projectAuthority.isSM || projectAuthority.isCreator"
                                            v-model="item.assignedTo" @change="updateAssignedTo(item)" class="selected">
                                            <option> - </option>
                                            <option v-for="member in projectMembers" :key="member">{{ member.username }}
                                            </option>
                                        </select>
                                        <span v-else>{{ item.assignedTo }}</span>

                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            v-if="index >= 3 && (this.projectAuthority.isSM || this.projectAuthority.isCreator || this.projectAuthority.isTM)"
                            class="delete-board-btn" @click="deleteBoard(index)">
                            <i class="mdi mdi-delete"></i>
                        </button>
                    </div>
                    <div class="add-board"
                        v-if="this.projectAuthority.isSM || this.projectAuthority.isCreator || this.projectAuthority.isTM">
                        <button class="add-board-btn" @click="addBoard">
                            <i class="mdi mdi-plus" style="font-size:50px"></i>
                        </button>
                    </div>
                    <div v-else>

                    </div>
                </div>
            </div>
        </div>
    </ProjectLayout>
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
import NotFoundV2 from '@/components/NotFoundV2.vue';

export default {
    name: 'ScrumBoard',
    components: {
        ProjectLayout,
        Loading,
        NotFoundV2

    },
    data() {
        return {
            activeSprint: false,
            status: [
            ],
            items: [],
            projectMembers: []
        }
    },
    methods: {
        getList(boardName) {
            return this.items.filter(item => item.status === boardName);
        },

        getStatusClass(boardName) {
            if (boardName !== "To Do" && boardName !== "In Progress" && boardName !== "Completed") {
                return "others";
            } else {
                return boardName.toLowerCase().replace(' ', '-');
            }
        },

        startDrag(event, item) {
            if (this.projectAuthority.isTM || this.projectAuthority.isCreator || this.projectAuthority.isSM) {
                event.dataTransfer.dropEffect = 'move';
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('itemID', item.id);
            }
        },

        async onDrop(event, boardName) {
            const itemID = event.dataTransfer.getData('itemID');
            const item = this.items.find(item => item.id === parseInt(itemID));
            item.status = boardName;

            try {
                const response = await axios.put('http://127.0.0.1:8000/api/updateSprintBacklogStatus', {
                    sprintBacklogID: itemID,
                    status: boardName,
                });

                if (response.status === 200) {
                    this.getBacklogs();
                }

            } catch (error) {
                alert(error);
            }
        },

        async addBoard() {
            const boardName = prompt('Enter the name of the new board:');

            if (!boardName) {
                alert('Please enter a board name.');
            }
            //if board name already exist, prompt user to enter another name
            if (this.status.some(board => board.name === boardName)) {
                alert('Board name already exists. Please enter another name.');
                return;
            }
            try {
                if (boardName) {
                    const response = await axios.post('http://127.0.0.1:8000/api/addProjectStatus', {
                        projectID: this.currentProject,
                        status: boardName,
                    });

                    if (response.status === 200) {
                        this.getProjectStatus();
                    }
                }
            } catch (error) {
                alert(error);

            }
        },

        async deleteBoard(index) {
            if (confirm("Are you sure you want to delete this board?")) {
                try {
                    const response = axios.delete('http://127.0.0.1:8000/api/deleteProjectStatus', {
                        params: {
                            projectID: this.currentProject,
                            status: this.status[index].name,
                        },
                    });

                    this.getBacklogs();
                    this.getProjectStatus();


                }
                catch (error) {
                    alert(error);
                }
            }
        },

        getAuthority() {
            if (this.projectAuthority.isSM || this.projectAuthority.isTM || this.projectAuthority.isCreator) {
                return true;
            } else {
                return false;
            }
        },

        async updateAssignedTo(item) {
            try {
                const response = await axios.put('http://127.0.0.1:8000/api/updateSprintBacklogAssignedTo', {
                    sprintBacklogID: item.id,
                    assignedTo: item.assignedTo,
                });
            }
            catch (error) {
                alert(error);
            }
        },

        async getProjectMembers() {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/getProjectMembers', {
                    params: {
                        projectID: this.currentProject,
                    },
                });
                if (response.status === 200) {
                    // Combine projectMembers and projectMemberDetails
                    const combinedMembers = response.data.projectMembers.map(member => {
                        // Find the details using userID instead of id
                        const memberDetails = response.data.projectMemberDetails.find(detail => detail.id === member.userID);
                        return {
                            id: member.userID, // Use userID instead of id
                            name: memberDetails ? memberDetails.name : '',
                            username: memberDetails ? memberDetails.username : '',
                            email: memberDetails ? memberDetails.email : '',
                            isSM: member.isSM,
                            isPO: member.isPO,
                            isTM: member.isTM,
                            isCreator: member.isCreator
                        };
                    });
                    // Assign combinedMembers to your Vue data property
                    this.projectMembers = combinedMembers;
                }
            } catch (error) {
                alert(error);
            }
        },

        async getProjectStatus() {
            try {
                this.status = [{ name: 'To Do' },
                { name: 'In Progress' },
                { name: 'Completed' },
                ];
                const response = await axios.get('http://127.0.0.1:8000/api/getProjectStatus', {
                    params: {
                        projectID: this.currentProject,
                    },
                });
                if (response.status === 200) {
                    if (response.data.projectStatus) {
                        for (let i = 0; i < response.data.projectStatus.length; i++) {
                            // Create an object with name property set to status value
                            const statusObject = { name: response.data.projectStatus[i].name };
                            // Push the object into the board array
                            this.status.push(statusObject);
                        }
                    }
                }
            } catch (error) {
                alert(error);
            }
        },

        async getBacklogs() {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/getProductBacklog', {
                    params: {
                        projectID: this.currentProject,
                    },
                });

                if (response.status === 200) {
                    if (response.data.sprintBacklog) {
                        const items = []; // Initialize an array to store items

                        // Check if the response data has a nested array structure
                        if (Array.isArray(response.data.sprintBacklog[0])) {
                            // If it's nested, flatten it to make it consistent with the expected structure
                            response.data.sprintBacklog.forEach(subArray => {
                                subArray.forEach(item => {
                                    items.push(item);
                                });
                            });
                        } else {
                            // If it's not nested, simply iterate over the sprintBacklog and push each item into the items array
                            response.data.sprintBacklog.forEach(item => {
                                items.push(item);
                            });
                        }

                        // Replace this.items with the items array
                        this.items = items;
                        this.activeSprint = true;
                    }

                } else {
                    this.activeSprint = false;
                }
            } catch (error) {
                alert(error);
            }
        }

    },

    created() {
        this.getProjectMembers();
        this.getBacklogs();
        this.getProjectStatus();

    },

    watch: {
        status: {
            handler() {
                // Do nothing
            },
            deep: true
        },

        items: {
            handler() {
                // Do nothing
            },
            deep: true
        }
    }

};
</script>

<style scoped>
.scrumboard {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    /* Align items to the start */
}

.status-container {
    display: flex;
}

.board {
    position: relative;
    width: 400px;
    /* Adjust width as needed */
    height: 300px;
    /* Adjust height as needed */
    padding: 20px;
    border-radius: 10px;
    background-color: #fff;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    margin-right: 20px;
}

.add-board {
    position: relative;
    width: 100px;
    /* Adjust width as needed */
    height: 100px;
    /* Adjust height as needed */
    padding: 20px;
    border-radius: 10px;
    background-color: #fff;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    margin-right: 20px;
}

.board:not(:last-child) {
    height: fit-content;
}

.board:last-child {
    margin-right: 0;
}

.board h2 {
    margin-top: 0;
    margin-bottom: 20px;
}

.drag-el {
    background-color: #b8d5ef;
    /* Light blue */
    color: black;
    border-radius: 5px;
    cursor: move;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    outline: 2px solid #111827;
    margin-bottom: 15px;
    padding: 0;
}

.drag-el:hover {
    background-color: #8cb1e3;
    /* Darker blue */
    transform: translateY(-5px);
}

.item-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 150px;
    border-radius: 5px;
    padding-right: 5px;
    padding-left: 5px;
}

.item-title {
    width: 65%;
    font-weight: bold;
    padding: 5px;
}

.assigned-container {
    width: 35%;
    height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-left: 2px solid #111827;
    /* Only left border */

}

.assigned-to {
    width: 105%;
    padding-top: 10px;
    background-color: #fff1e1;
    /* Light orange */
    height: 50px;
    font-family: 'Poppins', sans-serif;
    font-size: 16px;
    color: black;
    align-items: center;
    justify-content: center;
    border-bottom: 2px solid #111827;
    /* Only bottom border */
    border-top-right-radius: 5px;
    /* bold the text */
    font-weight: bold;
}

.selected-container {
    height: 100px;
    justify-content: center;
    align-items: center;
    background-color: #fec994;
    width: 105%;
    text-align: center;
    display: flex;

}

.selected {
    height: 100px;
    width: 105%;
    background-color: #fec994;
    /* Gray */
    color: black;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    /* border radius at bottom right */
    border-bottom-right-radius: 5px;
    text-align: center;
    justify-content: center;

}

.selected:hover {
    background-color: #f9a825;
    /* Darker gray */
}

.delete-board-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    background: none;
    border: none;
    cursor: pointer;
}

.delete-board-btn i {
    color: #ff0000;
    font-size: 24px;
}

.add-board-btn {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    color: black;
    border: none;
    border-radius: 10px;
    font-size: 24px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}
</style>
