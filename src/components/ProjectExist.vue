<template>
  <h1>Project</h1>
  <h2>Choose a project to manage.</h2>
  <div class="project-container">
    <div v-for="(project, index) in projectList" :key="index" class="project-box" @click="selectProject(project.id)">
      <span>{{ project.name }}</span>
    </div>
    <div class="project-box add-project" @click="addProject">
      <span>+</span>
    </div>
  </div>
</template>

<script>
import ProjectLayout from '@/layout/ProjectLayout.vue';
import axios from 'axios';

export default {
  name: 'ProjectExist',
  components: {
    ProjectLayout,
  },
  props: {
    projectList: Array, // Define prop as an array

  },

  data() {
    return {
    };
  },

  methods: {
    async selectProject(projectID) {
      //ask user confirm if they want choose this project to manage, if yes tell them it will overwrite the current project
      if (confirm('Are you sure you want to choose this project?')) {
        //get user data for the project
        try {
          const response = await axios.get('http://127.0.0.1:8000/api/getUserProjectDetails', {
            params: {
              projectID: projectID,
            },
          });

          if (response.data) {
            //set current token to the project token
            localStorage.setItem('authToken', response.data.token);
            console.log(response.data.token);

            //set current project to the project
            this.setCurrentProject(response.data.user.projectID);
            this.setProjectAuthority({
              isSM: response.data.user.isSM,
              isPO: response.data.user.isPO,
              isTM: response.data.user.isTM,
              isCreator: response.data.user.isCreator,
            });

            //redirect to backlog page
            this.$router.push('/backlog');
          }

        } catch (error) {
          console.error(error);
        }
      }
    },

    addProject() {
      console.log(this.projectList);
      this.emitter.emit('createProject');
    },
  },


};
</script>


<style scoped>
.project-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  /* Start new rows at the left */
  background-color: #f1f1f3;
  /* Background color for the content area */
  padding: 20px;
  /* Add some padding */
}

.project-box {
  flex: 0 1 calc(25% - 60px);
  height: 150px;
  background-color: #b8d5ef;
  /* Light blue background color */
  margin: 30px;
  /* Increased margin to increase the gap between boxes */
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.project-box:hover {
  background-color: #83a6d6;
  /* Slightly darker blue background color on hover */
}

.add-project {
  flex: 0 1 calc(25% - 60px);
  height: 150px;
  background-color: #4b6fbc;
  /* Blueish color for the + button */
  margin: 30px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-project:hover {
  background-color: #4b99d9;
  /* Slightly darker blueish color on hover */
}


.project-box span,
.add-project span {
  color: #2C5282;
  /* Dark blue text color */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  /* Font family */
  font-size: 20px;
  /* Font size */
  font-weight: bold;
  /* Bold font weight */
}

.add-project span {
  font-size: 40px;
  /* Larger font size for the + button */
  color: white;
  /* White text color for the + button */
}
</style>
