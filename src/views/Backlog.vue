<template>
    <ProjectLayout>
        <div v-if="backlogCount > 0">
            <h1> Backlogs </h1>
            <div class="backlog-container">
                <div v-for="(backlog, index) in productBacklog" :key="index" class="backlog-section">
                    <div class="backlog-header">
                        <div class="backlog-title" style="text-decoration: underline;">{{ backlog.description }}</div>
                        <div class="backlog-meta">
                            <span> Status: <div :class="getStatusClass(backlog.status)">{{ backlog.status }} </div>
                            </span>
                            <span> Priority: <div :class="getPriorityClass(backlog.priority)">{{ backlog.priority }}
                                </div></span>
                            <div v-if="backlog">
                                <span v-if="productBacklogAuthority(backlog)"> <!-- Opening span tag was missing ">" -->
                                    <v-icon @click="editProductBacklog(backlog)" color="#007bff"
                                        icon="mdi-pencil"></v-icon>
                                    <v-icon @click="deleteProductBacklog(backlog)" color="#ff6b6b"
                                        icon="mdi-delete"></v-icon>
                                </span>
                            </div> <!-- Closing v-if tag was missing ">" -->

                        </div>
                    </div>
                    <div class="backlog-table">
                        <table>
                            <tr>
                                <th style="width: 400px;">Description</th>
                                <th style="width: 200px;">Category</th>
                                <th style="width: 100px;">Priority</th>
                                <th style="width: 150px;">Status</th>
                                <th style="width: 200px;">Estimation</th>
                                <th style="width: 200px;">Assigned To</th>
                                <th style="width: 10px;"></th>
                            </tr>

                            <tr v-for="(item, idx) in backlog.sprintBacklog" :key="idx">

                                <td style="width: 400px;">{{ item.description }}</td>
                                <td style="width: 200px;">{{ item.category }}</td>
                                <td style="width: 100px;">
                                    <div :class="getPriorityClass(item.priority)">{{ item.priority }} </div>
                                </td>
                                <td style="width: 150px;">
                                    <div :class="getStatusClass(item.status)">{{ item.status }} </div>
                                </td>
                                <td style="width: 200px;">
                                    <div class="estimation-container">
                                        <div class='item-estimation'>
                                            {{ item.estimation }} {{ item.estimationUnit }}</div>
                                        <button class="function-button-blue" @click="estimate(backlog, item)"
                                            v-if="estimationAuthority(item)">
                                            Estimate
                                        </button>
                                    </div>
                                </td>
                                <td style="width: 200px;">{{ item.assignedTo }}</td>
                                <td style="width: 10px;">
                                    <div class="button-container" style="padding-top:0px;"
                                        v-if=sprintBacklogAuthority(item)>
                                        <v-icon @click="editSprintBacklog(backlog, item)" color="#007bff"
                                            icon="mdi-pencil"></v-icon>
                                        <v-icon @click="deleteSprintBacklog(backlog, item)" color="#ff6b6b"
                                            icon="mdi-delete"></v-icon>
                                    </div>
                                </td>

                            </tr>
                            <tr>
                                <td colspan="7" class="add-new" @click="newItem(backlog)"
                                    v-if="this.projectAuthority.isCreator || this.projectAuthority.isSM || this.projectAuthority.isTM">
                                    + Add New Item for {{ backlog.description }}
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>

                <button class="function-button-blue" @click="toogleAddBacklogForm"
                    v-if="this.projectAuthority.isCreator || this.projectAuthority.isPO">New Product Backlog</button>
            </div>
        </div>
        <div v-else>
            <NotFound :title="'Oops, looks like you dont have a backlog yet.'"
                :subtitle="'Dont worry! Create your first backlog by clicking the button below!'"
                :actionLabel="'New Backlog'" />
        </div>

        <!--Add Product Backlog popout-->
        <div class="popout-overlay" v-if="showAddProductBacklogForm">
            <div class="popout-modal">
                <PopoutLayout pageTitle="Add New Product Backlog">
                    <h2 style="margin-top:0px">Product Backlog Description</h2>
                    <input type="text" v-model="backlogDescription" placeholder="Enter backlog description">
                    <h2>Choose Product Backlog Priority</h2>
                    <select v-model="backlogPriority" :class="getPriorityClass(backlogPriority)"
                        @change="handlePriorityChange(backlogPriority)">
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    <div class="button-container">
                        <div class="function-button-blue-container">
                            <button class="function-button-blue" @click="createProductBacklog">Confirm</button>
                        </div>
                        <div class="function-button-red-container">
                            <button class="function-button-red" @click="cancelCreate">Cancel</button>
                        </div>
                    </div>
                </PopoutLayout>
            </div>
        </div>

        <!--Edit Product Backlog popout-->
        <div class="popout-overlay" v-if="showEditProductBacklogForm">
            <div class="popout-modal">
                <PopoutLayout pageTitle="Edit Product Backlog">
                    <h2 style="margin-top:0px">Product Backlog Description</h2>
                    <input type="text" v-model="backlogDescription">
                    <h2>Choose Product Backlog Priority</h2>
                    <select v-model="backlogPriority" :class="getPriorityClass(backlogPriority)"
                        @change="handlePriorityChange(backlogPriority)">
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    <h2>Choose Item Status</h2>
                    <select v-model="backlogStatus" :class="getStatusClass(backlogStatus)"
                        @change="handleStatusChange(backlogStatus)">
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option v-for="status in projectStatus" :key="status" :value="status">
                            {{ status }}
                        </option>
                    </select>
                    <div class="button-container">
                        <div class="function-button-blue-container">
                            <button class="function-button-blue" @click="confirmEditProductBacklog">Confirm</button>
                        </div>
                        <div class="function-button-red-container">
                            <button class="function-button-red" @click="cancelEditProductBacklog">Cancel</button>
                        </div>
                    </div>
                </PopoutLayout>
            </div>
        </div>
    </ProjectLayout>

    <!--New Sprint Backlog popout-->
    <div class="popout-overlay" v-if="showAddSprintBacklogForm">
        <div class="popout-modal">
            <PopoutLayout pageTitle="Add New Sprint Backlog">
                <h2 style="margin-top:0px">Item Description</h2>
                <input type="text" v-model="itemDescription" placeholder="Enter item description">
                <h2>Choose Item Category</h2>
                <input type="text" v-model="itemCategory" placeholder="Enter item category">
                <h2>Choose Item Priority</h2>
                <select v-model="itemPriority" :class="getPriorityClass(itemPriority)"
                    @change="handlePriorityChange(itemPriority)">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>

                <h2>Assigned To</h2>
                <select v-model="itemAssignedTo">
                    <option value="-">-</option>
                    <option v-for="member in projectMembers" :key="member.id" :value="member.username">
                        {{ member.username }}
                    </option>
                </select>
                <div class="button-container">
                    <div class="function-button-blue-container">
                        <button class="function-button-blue" @click="createSprintBacklog">Confirm</button>
                    </div>
                    <div class="function-button-red-container">
                        <button class="function-button-red" @click="cancelAddItem">Cancel</button>
                    </div>
                </div>
            </PopoutLayout>
        </div>
    </div>

    <!-- Edit Sprint Backlog popout -->
    <div class="popout-overlay" v-if="showEditSprintBacklogForm">
        <div class="popout-modal">
            <PopoutLayout pageTitle="Edit Sprint Backlog">
                <h2 style="margin-top:0px">Item Description</h2>
                <input type="text" v-model="itemDescription" placeholder="Enter item description">
                <h2>Choose Item Category</h2>
                <input type="text" v-model="itemCategory" placeholder="Enter item category">
                <h2>Choose Item Priority</h2>
                <select v-model="itemPriority" :class="getPriorityClass(itemPriority)"
                    @change="handlePriorityChange(itemPriority)">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
                <h2>Choose Item Status</h2>
                <select v-model="itemStatus" :class="getStatusClass(itemStatus)"
                    @change="handleStatusChange(itemStatus)">
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option v-for="status in projectStatus" :key="status" :value="status">
                        {{ status }}
                    </option>
                </select>
                <h2>Assigned To</h2>
                <select v-model="itemAssignedTo">
                    <option value="-">-</option>
                    <option v-for="member in projectMembers" :key="member.id" :value="member.username">
                        {{ member.username }}
                    </option>
                </select>
                <div class="button-container">
                    <div class="function-button-blue-container">
                        <button class="function-button-blue" @click="confirmEditSprintBacklog">Confirm</button>
                    </div>
                    <div class="function-button-red-container">
                        <button class="function-button-red" @click="cancelEditItem">Cancel</button>
                    </div>
                </div>

            </PopoutLayout>
        </div>
    </div>

    <!-- Estimation popout -->
    <div class="popout-overlay" v-if="showEstimationForm">
        <div class="popout-modal">
            <PopoutLayout pageTitle="Estimation">
                <h2 style="margin-top:0px">Estimation for {{ itemDescription }}</h2>
                <input type="number" v-model="itemEstimation" placeholder="Enter item estimation">
                <h2>Estimation Unit</h2>
                <input type="text" v-model="itemEstimationUnit" placeholder="Enter item estimation unit">

                <div class="button-container-first">
                    <div class="button-container-second">
                        <button class="function-button-blue" @click.prevent="setPlanningPokerSession">Planning Poker
                            Estimation</button>
                    </div>
                    <div class="button-container-third">
                        <div class="empty-space">
                            <button class="function-button-blue" @click="confirmEstimation">Confirm</button>
                        </div>
                        <button class="function-button-red" @click="cancelEstimation">Cancel</button>
                    </div>
                </div>

            </PopoutLayout>
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
import NotFound from '@/components/NotFound.vue'
import PopoutLayout from '@/layout/PopoutLayout.vue'
import Loading from '@/components/Loading.vue'
import axios from 'axios';

export default {
    name: 'Backlog',
    components: {
        ProjectLayout,
        NotFound,
        PopoutLayout,
        Loading,
    },

    mounted() {
        this.emitter.on('newBacklog', this.manageEventBacklog);
    },

    beforeUnmount() {
        this.emitter.off('newBacklog', this.manageEventBacklog);
    },

    data() {
        return {
            backlogCount: 0,
            productBacklog: [],
            projectMembers: [],
            showAddProductBacklogForm: false,
            showEditProductBacklogForm: false,
            showAddSprintBacklogForm: false,
            showEditSprintBacklogForm: false,
            showEstimationForm: false,

            backlogDescription: '',
            backlogPriority: 'Low',
            backlogIndex: -1,
            backlogStatus: 'To Do',

            //New sprint backlog form
            itemDescription: '',
            itemCategory: '',
            itemPriority: 'Low',
            itemStatus: 'To Do',
            itemEstimation: 0,
            itemAssignedTo: '-',
            itemIndex: -1,
            estimationUnit: 'days',
            projectStatus: [],
        };
    },
    methods: {

        getStatusClass(status) {
            if (status == "To Do" || status == "In Progress" || status == "Completed") {
                return status.toLowerCase().replace(' ', '-');
            } else {
                return "others";
            }

        },

        getPriorityClass(priority) {
            return priority.toLowerCase().replace(' ', '-');
        },

        toogleAddBacklogForm() {
            this.showAddProductBacklogForm = !this.showAddProductBacklogForm;
        },

        async createProductBacklog() {
            try {
                if (this.backlogDescription !== '') {
                    const response = await axios.post('http://127.0.0.1:8000/api/createProductBacklog', {
                        projectID: this.currentProject,
                        description: this.backlogDescription,
                        priority: this.backlogPriority,
                    });

                    if (response.status === 200) {
                        this.showAddProductBacklogForm = false;
                        this.resetForm('productBacklog');
                        this.getBacklogs();
                        alert('Product backlog created successfully.');
                    }
                }

                else {
                    alert('Please enter a backlog name.');
                }
            }
            catch (error) {
                alert(error);
            }
        },

        cancelCreate() {
            this.resetForm('productBacklog');
            this.showAddProductBacklogForm = false;
        },

        editProductBacklog(backlog) {
            //open edit backlog form
            this.showEditProductBacklogForm = true;
            //set the backlog name and priority
            this.backlogDescription = backlog.description;
            this.backlogPriority = backlog.priority;
            this.backlogIndex = this.productBacklog.indexOf(backlog);
            this.backlogStatus = backlog.status;
        },

        async confirmEditProductBacklog() {
            //update the backlog with the new name and priority
            if (this.backlogDescription !== '') {

                try {
                    const response = await axios.put('http://127.0.0.1:8000/api/updateProductBacklog', {
                        projectID: this.currentProject,
                        productBacklogID: this.productBacklog[this.backlogIndex].id,
                        description: this.backlogDescription,
                        priority: this.backlogPriority,
                        status: this.backlogStatus,
                    });

                    if (response.status === 200) {
                        this.showEditProductBacklogForm = false;
                        this.resetForm('productBacklog');
                        this.getBacklogs();
                        alert('Product backlog updated successfully.');
                    }
                }
                catch (error) {
                    alert(error);
                }
            }

            else {
                alert('Please enter a backlog description.');
            }
        },

        cancelEditProductBacklog() {
            //reset the form and close the popout
            this.showEditProductBacklogForm = false;
            this.resetForm('productBacklog');
        },

        async deleteProductBacklog(backlog) {
            const isConfirmed = confirm('Are you sure you want to delete this product backlog?');
            if (isConfirmed) {

                const response = await axios.delete('http://127.0.0.1:8000/api/deleteProductBacklog', {
                    params: {
                        projectID: this.currentProject,
                        productBacklogID: backlog.id,
                    },
                });

                if (response.status === 200) {
                    this.getBacklogs();
                    alert('Product backlog deleted successfully.');
                }
            }
        },

        //New Sprint Backlog
        newItem(backlog) {
            this.itemIndex = this.productBacklog.indexOf(backlog);
            this.showAddSprintBacklogForm = true;
        },

        async createSprintBacklog() {
            if (this.itemDescription !== '' && this.itemCategory !== '' && this.itemEstimation !== '' && this.itemAssignedTo !== '') {
                try {
                    const response = await axios.post('http://127.0.0.1:8000/api/createSprintBacklog', {

                        productBacklogID: this.productBacklog[this.itemIndex].id,
                        description: this.itemDescription,
                        category: this.itemCategory,
                        priority: this.itemPriority,
                        assignedTo: this.itemAssignedTo,
                    });

                    if (response.status === 200) {
                        this.getBacklogs();
                        this.resetForm('sprintBacklog');
                        alert('Sprint backlog created successfully.');
                        this.showAddSprintBacklogForm = false;
                    }
                }

                catch (error) {
                    alert(error);
                }
            }

            else {
                alert('Please fill in all fields');
            }
        },

        cancelAddItem() {
            this.showAddSprintBacklogForm = false;
            this.resetForm('sprintBacklog');
        },

        editSprintBacklog(backlog, item) {
            this.backlogIndex = this.productBacklog.indexOf(backlog);
            this.itemIndex = backlog.sprintBacklog.indexOf(item);
            this.itemDescription = item.description;
            this.itemCategory = item.category;
            this.itemPriority = item.priority;
            this.itemStatus = item.status;
            this.itemAssignedTo = item.assignedTo;
            this.showEditSprintBacklogForm = true;
        },

        cancelEditItem() {
            this.showEditSprintBacklogForm = false;
            this.resetForm('sprintBacklog');
        },

        async confirmEditSprintBacklog() {

            if (this.itemDescription !== '' && this.itemCategory !== '' && this.itemAssignedTo !== '') {

                try {
                    const response = await axios.put('http://127.0.0.1:8000/api/updateSprintBacklog', {

                        productBacklogID: this.productBacklog[this.backlogIndex].id,
                        sprintBacklogID: this.productBacklog[this.backlogIndex].sprintBacklog[this.itemIndex].id,
                        description: this.itemDescription,
                        category: this.itemCategory,
                        priority: this.itemPriority,
                        status: this.itemStatus,
                        assignedTo: this.itemAssignedTo,
                    });

                    if (response.status === 200) {
                        this.getBacklogs();
                        this.resetForm('sprintBacklog');
                        this.showEditSprintBacklogForm = false;
                        alert('Sprint backlog updated successfully!');
                    }
                }
                catch (error) {
                    alert(error);
                }
            }

            else {
                alert('Please fill in all fields.');
            }
        },

        async deleteSprintBacklog(backlog, item) {
            const isConfirmed = confirm('Are you sure you want to delete this item?');
            if (isConfirmed) {
                try {
                    const response = await axios.delete('http://127.0.0.1:8000/api/deleteSprintBacklog', {
                        params: {
                            productBacklogID: backlog.id,
                            sprintBacklogID: item.id,
                        },
                    });


                    if (response.status === 200) {
                        this.getBacklogs();
                        alert('Sprint backlog item deleted successfully.');
                    }
                }
                catch (error) {
                    alert(error);
                }

            }
        },

        //Estimation
        estimate(backlog, item) {
            this.backlogIndex = this.productBacklog.indexOf(backlog);
            this.itemIndex = backlog.sprintBacklog.indexOf(item);
            this.itemEstimation = item.estimation;
            this.itemDescription = item.description;
            this.itemEstimationUnit = item.estimationUnit;
            this.showEstimationForm = true;

        },

        async confirmEstimation() {
            if (this.itemEstimation >= 0) {
                try {
                    const response = await axios.put('http://127.0.0.1:8000/api/updateSprintBacklogEstimation', {
                        projectID: this.currentProject,
                        productBacklogID: this.productBacklog[this.backlogIndex].id,
                        sprintBacklogID: this.productBacklog[this.backlogIndex].sprintBacklog[this.itemIndex].id,
                        estimation: this.itemEstimation,
                        estimationUnit: this.itemEstimationUnit,
                    });

                    if (response.status === 200) {
                        alert('Estimation updated successfully!');
                        this.getBacklogs();
                        this.showEstimationForm = false;
                        this.resetForm('estimation');

                    }
                }
                catch (error) {
                    alert(error);
                }

            }
            else {
                alert('Please enter a valid estimation');
            }
        },

        cancelEstimation() {
            this.showEstimationForm = false;
            this.resetForm('estimation');
        },

        async setPlanningPokerSession() {
            try {
                const response = await axios.post('http://127.0.0.1:8000/api/getPlanningPokerSession', {
                    projectID: this.currentProject,
                    sprintBacklogID: this.productBacklog[this.backlogIndex].sprintBacklog[this.itemIndex].id
                });

                if (response.status === 200) {
                    this.setPlanningPoker(response.data.sessionID);
                    //redirect to planning poker page
                    this.$router.push('/planning-poker');
                }
            } catch (error) {
                alert(error);
            }
        },


        resetForm(mode) {
            if (mode === 'productBacklog') {
                this.backlogDescription = '';
                this.backlogPriority = 'Low';
                this.backlogIndex = -1;
                this.backlogStatus = 'To Do';
            }

            else if (mode === 'sprintBacklog') {
                this.itemDescription = '';
                this.itemCategory = '';
                this.itemPriority = 'Low';
                this.itemStatus = 'To Do';
                this.itemAssignedTo = '-';
                this.itemIndex = -1;
                this.backlogIndex = -1;
            }

            else if (mode === 'estimation') {
                this.itemEstimation = 0;
                this.itemDescription = '';
                this.estimationUnit = 'days';
                this.itemIndex = -1;
                this.backlogIndex = -1;
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
                //send in current project ID
                const response = await axios.get('http://127.0.0.1:8000/api/getProjectStatus', {
                    params: {
                        projectID: this.currentProject,
                    },
                });
                if (response.status === 200) {
                    if (response.data.projectStatus) {
                        //map through projectstatus, and push to projectStatus array (only the name)
                        for (let i = 0; i < response.data.projectStatus.length; i++) {
                            this.projectStatus.push(response.data.projectStatus[i].name);
                        }
                    }

                }
            }
            catch (error) {
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
                    if (response.data.productBacklog) {
                        this.productBacklog = response.data.productBacklog;
                        //for each productbacklog push empty array to sprintbacklog
                        this.productBacklog.forEach(backlog => {
                            backlog.sprintBacklog = [];
                        });
                    }
                    if (response.data.sprintBacklog) {
                        // Loop through the sprint backlog
                        for (let i = 0; i < response.data.sprintBacklog.length; i++) {

                            // Find the index of the product backlog
                            const index = this.productBacklog.findIndex(backlog => backlog.id === response.data.sprintBacklog[i][0].productBacklogID);

                            // If corresponding product backlog is found
                            if (index !== -1) {
                                // Push each sprint backlog item to the sprint backlog array of the corresponding product backlog
                                for (let j = 0; j < response.data.sprintBacklog[i].length; j++) {
                                    const sprintBacklogItem = response.data.sprintBacklog[i][j];
                                    // Check if currentSprint is null and assign "-" if it is, otherwise use the value from sprintBacklogItem
                                    const currentSprint = sprintBacklogItem.sprintID === null ? "-" : sprintBacklogItem.sprintID;
                                    const estimation = sprintBacklogItem.estimation === 0 ? "-" : sprintBacklogItem.estimation;
                                    // Check if sprint is null and assign "-" if it is, otherwise use the value from sprintBacklogItem
                                    const sprint = sprintBacklogItem.sprintInvovled === null ? "-" : sprintBacklogItem.sprintInvovled;
                                    this.productBacklog[index].sprintBacklog.push({
                                        id: sprintBacklogItem.id,
                                        productBacklogID: sprintBacklogItem.productBacklogID,
                                        description: sprintBacklogItem.description,
                                        category: sprintBacklogItem.category,
                                        priority: sprintBacklogItem.priority,
                                        status: sprintBacklogItem.status,
                                        estimation: estimation,
                                        estimationUnit: sprintBacklogItem.estimationUnit,
                                        assignedTo: sprintBacklogItem.assignedTo,
                                        sprintID: currentSprint,
                                        SprintInvovled: sprint,
                                    });
                                }
                            }
                        }
                    }
                    this.backlogCount = this.productBacklog.length;
                }
            }
            catch (error) {
                alert(error);
            }
        },

        //remove focus from select element after role change
        handlePriorityChange(priority) {
            document.activeElement.blur();
        },

        handleStatusChange(status) {
            document.activeElement.blur();
        },

        manageEventBacklog() {
            this.showAddProductBacklogForm = !this.showAddProductBacklogForm;
        },

        productBacklogAuthority(backlog) {
            if (this.projectAuthority.isCreator || this.projectAuthority.isPO) {
                // If current product backlog has active sprint, do not allow user to edit or delete
                if (backlog.sprintBacklog.length > 0) {
                    for (let i = 0; i < backlog.sprintBacklog.length; i++) {
                        if (backlog.sprintBacklog[i].sprintID !== "-") {
                            // If any sprintID is not equal to "-", return false
                            return false;
                        }
                    }
                    // If all sprintID values are "-", return true
                    return true;
                }

                else {
                    return true;
                }
            }
            // Return false if user is not creator or PO
            return false;
        },


        sprintBacklogAuthority(item) {
            if (this.projectAuthority.isCreator || this.projectAuthority.isSM || this.projectAuthority.isTM) {
                //verify if the current sprint backlog item has an active sprint
                if (item.sprintID !== "-") {
                    return false;
                }

                else {
                    return true;
                }
            }
            else {
                return false;
            }
        },

        estimationAuthority(item) {
            if (this.projectAuthority.isCreator || this.projectAuthority.isSM || this.projectAuthority.isTM) {
                if (item.sprintID !== "-") {
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                return false;
            }
        },
    },

    created() {
        this.getProjectMembers();
        this.getProjectStatus();
        this.getBacklogs();

    }
};
</script>

<style scoped>
.backlog-container {
    margin-top: 20px;
}

.backlog-section {
    margin-bottom: 30px;
    padding: 20px;
    background-color: #f0f5fa;
    /* Slightly darker color */
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.backlog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-family: 'Poppins', sans-serif;
    font-weight: bold;
    color: #333;
}

span {
    margin-right: 20px;
    margin-bottom: 5px;
    font-size: 14px;
    /* Adjust font size */
}

table {
    width: 100%;
    border-collapse: collapse;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    margin-top: 15px;
    overflow: hidden;
}

th,
td {
    padding: 10px;
    border-bottom: 1px solid #e0e0e0;
    text-align: left;
    font-family: 'Poppins', sans-serif;
}

th {
    background-color: #97a6b6;
    /* Slightly darker color */
    font-weight: bold;
}

td {
    background-color: #ffffff;
}

.add-new {
    cursor: pointer;
    background-color: #afbbc7 !important;
    text-align: center;
    padding: 10px;

    transition: background-color 0.3s;
}

.add-new:hover {
    background-color: #6aa1db !important;
}

select:focus {
    background-color: white;
    /* Set the background color of the dropdown selections to white when focused */
    color: black;
    /* Set the text color of the dropdown selections to black when focused */
}

.item-estimation {
    display: inline-block;
    margin-right: 10px;
    display: flex;
    width: 100px;
}

.estimation-container {
    display: flex;
    align-items: center;
}

.empty-space {
    padding-right: 20px;
}

.backlog-meta {
    display: flex;
    align-items: center;
}
</style>