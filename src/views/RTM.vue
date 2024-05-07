<template>
  <ProjectLayout>
    <div v-if="backlogCount == 0">
      <NotFoundV2 :title="'Oops, looks like you dont have a backlog yet.'"
                :subtitle="'Dont worry! Create your first backlog and the RTM will be auto-generated!'" />
    </div>

    <div class="requirement-traceability-matrix" v-else>
      <h1>Requirement Traceability Matrix</h1>
      <SearchBar @input-change="handleSearch" style="padding-bottom:20px;" />
      <table class="main-table">
        <thead>
          <tr>
            <th style="width: 450px;">Description</th>
            <th style="width: 100px;">Priority</th>
            <th style="width: 100px;">Status</th>
            <th style="width: 100px;">Action</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(requirement, index) in rtm" :key="'requirement-' + index">
            <tr>
              <td>{{ requirement.description }}</td>
              <td>
                <div :class="getPriorityClass(requirement.priority)">{{ requirement.priority }}</div>
              </td>
              <td>
                <div :class="getStatusClass(requirement.status)">{{ requirement.status }}</div>
              </td>
              <td>
                <button class="detail-button" @click="toggleSubTable(requirement)">
                  {{ requirement.showDetails ? 'Hide Details' : 'Show Details' }}
                </button>
              </td>
            </tr>
            <tr v-if="requirement.showDetails" :key="'sprintBacklog-' + index">
              <td :colspan="colspan">
                <table class="sub-table" v-if="!requirement.sprintEmpty">
                  <thead>
                    <tr>
                      <th style="width: 400px;">Description</th>
                      <th style="width: 200px;">Category</th>
                      <th style="width: 80px;">Priority</th>
                      <th style="width: 80px;">Status</th>
                      <th style="width: 80px;">Estimation</th>
                      <th style="width: 150px;">Assigned To</th>
                      <th style="width: 150px;">Current Sprint</th>
                      <th style="width: 150px;">Sprint Invovled</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(detail, idx) in requirement.sprintBacklog" :key="'detail-' + idx">
                      <td>{{ detail.description }}</td>
                      <td>{{ detail.category }}</td>
                      <td>
                        <div :class="getPriorityClass(detail.priority)">{{ detail.priority }}</div>
                      </td>
                      <td>
                        <div :class="getStatusClass(detail.status)">{{ detail.status }}</div>
                      </td>
                      <td>{{ detail.estimation }} {{ detail.estimationUnit }}</td>
                      <td>{{ detail.assignedTo }}</td>
                      <td>{{ detail.sprintID }} </td>
                      <td>{{ detail.sprintInvovled }}</td>
                    </tr>
                  </tbody>
                </table>
                <h2 style="padding-bottom:5px;" v-else>
                  No sprint backlog items found.
                </h2>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </ProjectLayout>
  <div class="popout-overlay" v-if="isLoading">
    <div class="popout-modal">
      <Loading />
    </div>
  </div>
</template>

<script>
import ProjectLayout from '@/layout/ProjectLayout.vue';
import SearchBar from '@/components/SearchBar.vue';
import Loading from '@/components/Loading.vue';
import axios from 'axios';
import NotFoundV2 from '@/components/NotFoundV2.vue';
import _ from 'lodash';

export default {
  name: 'Rtm',
  components: { ProjectLayout, SearchBar, Loading, NotFoundV2 },
  data() {
    return {
      rtm: [],
      backlogCount: 0,
      tempRTM: [],
      sprint: [],
    };
  },
  computed: {
    colspan() {
      return Object.keys(this.rtm[0]).length;
    }
  },
  methods: {
    toggleSubTable(requirement) {
      requirement.showDetails = !requirement.showDetails;
    },

    getPriorityClass(priority) {
      return priority.toLowerCase();
    },

    getStatusClass(status) {
      return status.toLowerCase().replace(' ', '-');
    },

    handleSearch(keyword) {
      let result = [];

      //reset rtm to its original state every time user initiate a sprint
      //else user will only search in the result[]
      this.rtm = _.cloneDeep(this.tempRTM);

      // Step 1: Search through the rtm array
      for (let rtmItem of this.rtm) {
        if (
          rtmItem.description.toLowerCase().includes(keyword.toLowerCase()) ||
          rtmItem.priority.toLowerCase().includes(keyword.toLowerCase()) ||
          rtmItem.status.toLowerCase().includes(keyword.toLowerCase())
        ) {
          // Found match in rtm, add it to result
          result.push(rtmItem);
        }

        else if (
          rtmItem.sprintBacklog.length > 0
        ) {
          //Step 2: Search through the sprint backlog array
          for (let sprintBacklogItem of rtmItem.sprintBacklog) {
            if (
              sprintBacklogItem.description.toLowerCase().includes(keyword.toLowerCase()) ||
              sprintBacklogItem.category.toLowerCase().includes(keyword.toLowerCase()) ||
              sprintBacklogItem.priority.toLowerCase().includes(keyword.toLowerCase()) ||
              sprintBacklogItem.status.toLowerCase().includes(keyword.toLowerCase()) ||
              sprintBacklogItem.assignedTo.toLowerCase().includes(keyword.toLowerCase()) ||
              sprintBacklogItem.estimation.toString().includes(keyword) ||
              sprintBacklogItem.estimationUnit.toLowerCase().includes(keyword.toLowerCase()) ||
              sprintBacklogItem.sprintID.toLowerCase().includes(keyword.toLowerCase())  ||
              sprintBacklogItem.sprintInvovled.toLowerCase().includes(keyword.toLowerCase()) 
            ) {
              //see if rtmItem is already in result, if not only push to prevent duplicates
              if (!result.includes(rtmItem)) {
                rtmItem.showDetails = true;
                result.push(rtmItem);

              }
            }
          }
        }
      }
      this.rtm = result;
    },


    deepCloneRTM() {
      this.tempRTM = _.cloneDeep(this.rtm);
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
            this.rtm = response.data.productBacklog;
            //for each productbacklog push empty array to sprintbacklog
            this.rtm.forEach(backlog => {
              backlog.sprintBacklog = [];
              backlog.showDetails = false;
              backlog.sprintEmpty = true;
            });
          }
          if (response.data.sprintBacklog) {
            // Loop through the sprint backlog
            for (let i = 0; i < response.data.sprintBacklog.length; i++) {

              // Find the index of the product backlog
              const index = this.rtm.findIndex(backlog => backlog.id === response.data.sprintBacklog[i][0].productBacklogID);

              // If corresponding product backlog is found
              if (index !== -1) {
                this.rtm[index].sprintEmpty = false;
                // Push each sprint backlog item to the sprint backlog array of the corresponding product backlog
                for (let j = 0; j < response.data.sprintBacklog[i].length; j++) {
                  const sprintBacklogItem = response.data.sprintBacklog[i][j];
                  // Check if currentSprint is null and assign "-" if it is, otherwise use the value from sprintBacklogItem
                  const currentSprint = sprintBacklogItem.sprintID === null ? "-" : sprintBacklogItem.sprintID;
                  const estimation = sprintBacklogItem.estimation === 0 ? "-" : sprintBacklogItem.estimation;
                  // Check if sprint is null and assign "-" if it is, otherwise use the value from sprintBacklogItem
                  const sprint = sprintBacklogItem.sprintInvovled === null ? "-" : sprintBacklogItem.sprintInvovled;
                  this.rtm[index].sprintBacklog.push({
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
          this.backlogCount = this.rtm.length;
        }
      }
      catch (error) {
        alert(error);
      }
    },

    async getSprintName() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/getSprint', {
          params: {
            projectID: this.currentProject,
          },
        });

        if (response.status === 200) {
          if (response.data.sprintBacklog) {
            this.sprints = response.data.sprint;
            console.log(this.sprints);

            // Iterate through sprintbacklog
            this.rtm.forEach(backlog => {
              backlog.sprintBacklog.forEach(async sprintBacklog => {
                // Convert sprintID to sprint name
                this.sprints.forEach(sprint => {
                  if (sprintBacklog.sprintID === sprint.id) {
                    sprintBacklog.sprintID = sprint.description;
                  }
                });

                // Convert sprintInvovled to sprint names
                if (sprintBacklog.sprintInvovled !== "-") {
                  let sprintInvovled = sprintBacklog.sprintInvovled.split(",").map(str => parseInt(str));
                  let sprintInvovledName = [];

                  for (let i = 0; i < sprintInvovled.length; i++) {
                    const sprintID = sprintInvovled[i];
                    const sprint = this.sprints.find(sprint => sprint.id === sprintID);
                    if (sprint) {
                      sprintInvovledName.push(sprint.description);
                    }
                  }

                  sprintBacklog.sprintInvovled = sprintInvovledName.join(", ");
                }
              });
            });
          }
        }
      } catch (error) {
        alert(error);
      }
    }

  },

  async created() {
    await this.getBacklogs();
    await this.getSprintName();
    this.deepCloneRTM(); 
  },

  watch: {
    rtm: {
      // Empty handler function
      handler() { },
      // Set deep to true if `rtm` is an array or object and you want to watch for nested changes
      deep: true
    }
  }


};
</script>

<style scoped>
.requirement-traceability-matrix {
  margin: 20px;
}

.detail-button {
  background-color: #4b6fbc;
  /* Dark blue button */
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.detail-button:hover {
  background-color: #83a6d6;
  /* Lighter blue on hover */
}
</style>
