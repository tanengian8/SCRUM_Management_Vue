<template>
    <ProjectLayout>
        <button class="function-button-blue" style="border-radius:60px" @click="back"><i class="mdi mdi-arrow-left"
                style="font-size:20px"></i></button>
        <div v-if="sprintCount <= 0">
            <NotFoundV2 :title="'Oops, looks like you dont have any sprint backlog that are ready to be selected.'"
                :subtitle="'Please make sure that you have at least 1 sprint backlog without Completed status to create a sprint.'" />
        </div>
        <div v-else>

            <h1> New Sprint </h1>
            <h2> Please select the date and the backlog item(s) to be included in the sprint.</h2>
            <br>
            <div class="date-range-container">
                <div class="start-date-container">
                    <label for="start-date" class="start-date-label">Start Date:</label>
                    <input type="date" class="start-date" v-model="startDate">
                </div>
                <div class="end-date-container">
                    <label for="end-date" class="end-date-label">End Date:</label>
                    <input type="date" class="end-date" v-model="endDate">
                </div>
            </div>
            <div v-for="backlog in productBacklog" :key="backlog.id">
                <div v-if="backlog.sprintBacklog.length > 0">
                    <br>
                    <div class="backlog-container">
                        <div class="backlog-title"
                            style="color:#2C5282; background-color:#b8d5ef; text-decoration: underline;">{{
                                backlog.description }}</div>
                    </div>
                    <div class="user-card user-header">
                        <div class="user-info">
                            <div style="width: 450px;">Description</div>
                            <div style="width: 200px;">Status</div>
                            <div style="width: 200px;">Priority</div>
                            <div style="width: 200px;">Category</div>
                            <div style="width: 200px;">Estimation</div>
                            <div style="width: 250px;">Assigned To</div>
                            <div style="width: 200px;"> Action </div>
                        </div>
                    </div>
                    <div v-for="item in backlog.sprintBacklog" :key="item.id"
                        :class="{ 'user-card': true, 'selected': isSelected(item) }">
                        <div class="user-info">
                            <div style="width: 450px; white-space: pre-wrap;">{{ item.description }}</div>

                            <div style="width: 200px;">
                                <div :class="getStatusClass(item.status)">{{ item.status }}</div>
                            </div>
                            <div style="width: 200px;">
                                <div :class="getPriorityClass(item.priority)">{{ item.priority }}</div>
                            </div>

                            <div style="width: 200px;"> {{ item.category }}</div>
                            <div style="width: 200px;"> {{ item.estimation }} {{ item.estimationUnit }}</div>
                            <div style="width: 250px;"> {{ item.assignedTo }}</div>
                            <div class="user-actions" style="width: 200px;">
                                <button @click="toggleItemSelection(item)"
                                    :class="{ 'function-button-blue': !isSelected(item), 'function-button-red': isSelected(item) }">
                                    {{ isSelected(item) ? 'Deselect' : 'Select' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="create-sprint-container">
                <button class="function-button-blue" @click="createSprint">Create Sprint</button>
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
import Loading from '@/components/Loading.vue'
import axios from 'axios'
import ProjectLayout from '@/layout/ProjectLayout.vue';
import NotFoundV2 from '@/components/NotFoundV2.vue';

export default {
    name: 'AddSprint',
    components: {
        ProjectLayout,
        Loading,
        NotFoundV2,
    },
    data() {
        return {
            startDate: '', // Date range start date
            endDate: '',    // Date range end date
            productBacklog: [],
            selectedItems: [],
            description: '',
            sprintCount: 0,
        };
    },
    methods: {
        back() {
            this.$router.push('/sprint');
        },

        toggleItemSelection(item) {
            const index = this.selectedItems.findIndex(selectedItem => selectedItem.id === item.id && selectedItem.backlogID === item.backlogID);
            if (index === -1) {
                this.selectedItems.push(item);
            } else {
                this.selectedItems.splice(index, 1);
            }
            console.log(this.selectedItems);
        },

        isSelected(item) {
            return this.selectedItems.some(selectedItem => selectedItem.id === item.id && selectedItem.backlogID === item.backlogID);
        },

        getPriorityClass(priority) {
            return priority.toLowerCase().replace(' ', '-');
        },

        getStatusClass(status) {
            if (status !== 'Completed' && status !== 'In Progress' && status !== 'To Do') {
                return 'others';
            }

            else {
            return status.toLowerCase().replace(' ', '-');
        }
        },

        async createSprint() {
            if (this.startDate === '' || this.endDate === '') {
                alert('Please select the start and end date for the sprint.');
                return;
            }

            if (this.startDate > this.endDate) {
                alert('The start date cannot be later than the end date.');
                return;
            }

            if (this.selectedItems.length === 0) {
                alert('Please select at least one backlog item to include in the sprint.');
                return;
            }

            try {

                const response = await axios.post('http://127.0.0.1:8000/api/createSprint', {
                    projectID: this.currentProject,
                    selectedItems: this.selectedItems,
                    startDate: this.startDate,
                    endDate: this.endDate,
                });

                if (response.status === 200) {
                    alert('Sprint created successfully.');
                    this.showCreateSprintForm = false;
                    this.startDate = '';
                    this.endDate = '';
                    this.selectedItems = [];
                    //navigate to sprint page
                    this.$router.push('/sprint');
                }
            }
            catch (error) {
                alert(error);
            }
        },

        cancelCreate() {
            this.showCreateSprintForm = false;
            this.description = '';
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
                                    if (sprintBacklogItem.status !== "Completed" && sprintBacklogItem.sprintID === null) {
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
                    }
                    this.sprintCount = this.productBacklog.length;
                }
            }
            catch (error) {
                alert(error);
            }
        },
    },

    created() {
        this.getBacklogs();
    }
};
</script>

<style scoped>
.backlog-container {
    padding: 10px;
    margin: 10px 0;
    text-align: center;
}

.selected {
    background-color: #e2f0ff;
    /* Background color when selected */
}

.date-range-container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.start-date-container {
    margin-right: 20px;
    display: flex;
}

.end-date-container {
    margin-left: 20px;
    display: flex;
}

.start-date-label,
.end-date-label {
    padding-top: 8px;
    padding-right: 5px;
    font-size: 16px;
}

.start-date,
.end-date {
    padding: 5px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: white;
}

.create-sprint-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}
</style>
