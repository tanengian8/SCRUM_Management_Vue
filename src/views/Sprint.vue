<template>
  <ProjectLayout>
    <div v-if="sprintCount > 0">
      <div class="sprint-page">
        <h1>Sprints</h1>
        <h2>Please note that for sprint(s) marked as 'Completed,' the sprint backlog(s) reflects the status at the
          time of completion. Hence, it is not the same as live status.</h2>
        <br>
        <div v-for="sprint in sprints" :key="sprint.id" class="sprint-container"
          v-bind:class="{ expanded: sprint.expanded }">
          <div class="sprint-header" @click="toggleDetails(sprint.id)">
            <div class="sprint-description">{{ sprint.description }}</div>
            <div class="status-container">
              <div :class="getStatusClass(sprint.status)">{{ sprint.status }}</div>
            </div>

            <div class="toggle-button" :class="{ 'expanded': sprint.expanded }">
              <i v-if="sprint.expanded" class="mdi mdi-chevron-up"></i>
              <i v-else class="mdi mdi-chevron-down"></i>
            </div>

          </div>
          <div v-if="sprint.expanded" class="sprint-details-container">
            <table>
              <tr>
                <td style="padding-right:5px; font-weight:bold;">Start Date:</td>
                <td style="padding-right:141px;">{{ sprint.startDate }}</td>
                <td style="padding-right:5px;  font-weight:bold;">End Date:</td>
                <td style="padding-right:141px;">{{ sprint.endDate }}</td>
                <td v-if="sprint.description !== 'Sprint 1'" style="padding-right:5px;  font-weight:bold;">Estimated
                  Completion Date:</td>
                <td v-if="sprint.description !== 'Sprint 1'" style="width:100px;">{{ sprint.estimatedDate }}</td>
                <td v-if="sprint.status === 'Completed'" style="padding-left:500px; font-weight:bold;">Actual Effort:</td>
                <td v-if="sprint.status === 'Completed'">{{ sprint.actualEffort }} day(s)</td>
              </tr>
            </table>

            <table class="sub-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Estimation</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(backlogItem, itemIndex) in sprint.sprintBacklog" :key="itemIndex">
                  <td>{{ backlogItem.description }}</td>
                  <td>{{ backlogItem.category }}</td>
                  <td>
                    <div :class="getPriorityClass(backlogItem.priority)">{{ backlogItem.priority }}</div>
                  </td>
                  <td>
                    <div :class="getStatusClass(backlogItem.status)">{{ backlogItem.status }}</div>
                  </td>
                  <td>{{ backlogItem.assignedTo }}</td>
                  <td>{{ backlogItem.estimation }} {{ backlogItem.estimationUnit }}</td>
                </tr>
              </tbody>
            </table>
            <div class="end-sprint-container"
              v-if="sprint.status !== 'Completed' && (this.projectAuthority.isSM || this.projectAuthority.isCreator)">
              <button class="function-button-blue" @click="endSprint(sprint)">End Sprint</button>
            </div>
          </div>
        </div>
        <button class="function-button-blue" @click="addSprint" v-if="canAddSprint">Add Sprint</button>
      </div>
    </div>
    <div v-else>
      <NotFound :title="'Oops, looks like you dont have a sprint yet.'"
        :subtitle="'Dont worry! Create your first sprint by clicking the button below!'" :actionLabel="'New Sprint'" />
    </div>
  </ProjectLayout>

  <!-- Confirm Actual Effort Modal -->
  <div class="popout-overlay" v-if="showEstimationForm">
    <div class="popout-modal">
      <PopoutLayout pageTitle="Actual Effort">
        <h2>Enter the actual effort for this sprint.</h2>
        <input type="number" placeholder="Enter actual effort" v-model="actualEffort" />
        <div class="button-container">
          <div class="function-button-blue-container">
            <button class="function-button-blue" @click="confirmEndSprint">Confirm</button>
          </div>
          <div class="function-button-red-container">
            <button class="function-button-red" @click="cancelEndSprint">Cancel</button>
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
import axios from 'axios'

export default {
  name: 'Sprint',
  components: { ProjectLayout, NotFound, PopoutLayout, Loading },

  mounted() {
    this.emitter.on('newSprint', this.addSprint);
  },

  beforeUnmount() {
    this.emitter.off('newSprint', this.addSprint);
  },

  data() {
    return {
      showEstimationForm: false,
      sprintCount: 0,
      selectedSprint: [],
      actualEffort: 0,
      sprints: [],
      canAddSprint: false,
      completedEstimation: 0,
      nullCompleted: 0,
      nullRemaining: 0,
      remainingEstimation: 0,
      averageEffort: 0.000,
    };
  },
  methods: {
    toggleDetails(id) {
      const sprint = this.sprints.find(sprint => sprint.id === id);
      sprint.expanded = !sprint.expanded;
    },

    noActiveSprint() {
      if (this.projectAuthority.isSM || this.projectAuthority.isCreator) {
        for (let i = 0; i < this.sprints.length; i++) {
          if (this.sprints[i].status !== 'In Progress') {
            this.canAddSprint = true;

          }
          else {
            this.canAddSprint = false;
            break;
          }
        }
      }

      else {
        this.canAddSprint = false;
      }
    },

    addSprint() {
      // Redirect to add sprint page
      this.$router.push("/add-sprint");
    },

    getStatusClass(status) {
      if (status === 'To Do') {
        return 'to-do';
      }
      
      else if (status === 'In Progress') {
        return 'in-progress';
      }
      else if (status === 'Completed') {
        return 'completed';
      }
      else {
        return 'others';
      }
    },

    getPriorityClass(priority) {
      return priority.toLowerCase().replace(' ', '-');
    },

    cancelEndSprint() {
      this.showEstimationForm = false;
      this.actualEffort = 0;
    },

    endSprint(sprint) {
      this.selectedSprint = sprint;
      this.showEstimationForm = true;
    },


    async confirmEndSprint() {
      if (this.actualEffort <= 0) {
        alert('The actual effort must be greater than 0.');
      }
      else {
        try {
          for (let i = 0; i < this.selectedSprint.sprintBacklog.length; i++) {
            if (this.selectedSprint.sprintBacklog[i].status === "Completed") {
              if (this.selectedSprint.sprintBacklog[i].estimation === "-") {
                this.nullCompleted += 1;
              }
              else {
                //convert to integer first
                this.completedEstimation += parseInt(this.selectedSprint.sprintBacklog[i].estimation);

              }
            }
            else {
              if (this.selectedSprint.sprintBacklog[i].estimation === "-") {
                this.nullRemaining += 1;
              }
              else {
                // convert to integer first
                this.remainingEstimation += parseInt(this.selectedSprint.sprintBacklog[i].estimation);
              }
            }
          }

          if (this.completedEstimation !== 0) {
            this.averageEffort = this.completedEstimation / this.actualEffort;
          }

          //loop through the active sprint
          const response = await axios.post('http://127.0.0.1:8000/api/endSprint', {
            sprintID: this.selectedSprint.id,
            projectID: this.currentProject,
            actualEffort: this.actualEffort,
            completedEstimation: this.completedEstimation,
            remainingEstimation: this.remainingEstimation,
            nullCompleted: this.nullCompleted,
            nullRemaining: this.nullRemaining,
            averageEffort: this.averageEffort,
          });

          if (response.status === 200) {
            this.sprints = response.data.sprint;
            this.actualEffort = 0;
            this.showEstimationForm = false;
            this.completedEstimation = 0;
            this.remainingEstimation = 0;
            this.nullCompleted = 0;
            this.nullRemaining = 0;

            alert("Sprint ended successfully.")
            this.getSprint();
            this.canAddSprint = true;
          }
        }
        catch (error) {
          alert(error);
        }
      }
    },

    toogleEstimationForm() {
      this.showEstimationForm = !this.showEstimationForm;
    },

    async getSprint() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/getSprint', {
          params: {
            projectID: this.currentProject,
          },
        });

        if (response.status === 200) {
          if (response.data.sprint) {
            this.sprints = response.data.sprint;
            //for each productbacklog push empty array to sprintbacklog
            this.sprints.forEach(backlog => {
              backlog.sprintBacklog = [];
              backlog.expanded = false;
            });
          }
          if (response.data.sprintBacklog) {
            // Loop through the sprint backlog
            for (let i = 0; i < response.data.sprintBacklog.length; i++) {

              // Find the index of the sprint
              const index = this.sprints.findIndex(backlog => backlog.id === response.data.sprintBacklog[i][0].sprintID);

              // If corresponding sprint is found
              if (index !== -1) {
                // Push each sprint backlog item to the sprint backlog array of the corresponding sprint
                for (let j = 0; j < response.data.sprintBacklog[i].length; j++) {
                  const sprintBacklogItem = response.data.sprintBacklog[i][j];
                  // Check if currentSprint is null and assign "-" if it is, otherwise use the value from sprintBacklogItem
                  const currentSprint = sprintBacklogItem.sprintID === null ? "-" : sprintBacklogItem.sprintID;
                  const estimation = sprintBacklogItem.estimation === 0 ? "-" : sprintBacklogItem.estimation;
                  // Check if sprint is null and assign "-" if it is, otherwise use the value from sprintBacklogItem
                  const sprint = sprintBacklogItem.sprintInvovled === null ? "-" : sprintBacklogItem.sprintInvovled;
                  this.sprints[index].sprintBacklog.push({
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
                    sprintInvovled: sprint,
                  });
                }
              }
            }
          }
          this.sprintCount = this.sprints.length;
        }
      }
      catch (error) {
        alert(error);
      }
    },
  },

  created() {
    this.getSprint().then(() => {
      this.noActiveSprint();
    });
  },
};
</script>

<style scoped>
.sprint-page {
  padding: 20px;
}

.sprint-container {
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  background-color: #fff;
}

.sprint-header {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  background-color: #082955;
  color: #fff;
}

.sprint-description {
  font-weight: bold;
  padding-left: 10px;
  font-size: 25px;
}


.toggle-button {
  padding: 5px;
}

.toggle-button i {
  color: #fff;
}

.status-container {
  margin-left: auto;
}

.end-sprint-container {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  padding-top: 20px;
}

.sprint-details-container {
  margin: 10px;
  padding: 10px;
}
</style>

<style scoped>
.sprint-page {
  padding: 20px;
}

.sprint-container {
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  overflow: hidden;
}

.sprint-header {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  background-color: #0E1D3D;
  color: #fff;
}

.sprint-description {
  font-weight: bold;
}


.toggle-button {
  padding: 5px;
}

.toggle-button i {
  color: #fff;
}


.status-container {
  margin-left: auto;
}

.end-sprint-container {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  padding-top: 20px;
}
</style>