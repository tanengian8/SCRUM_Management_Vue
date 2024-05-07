<template>
    <ProjectLayout>
        <div v-if="projectCount > 0">
            <ProjectExist :projectList="projectList" />
        </div>
        <div v-else>
            <NotFound :title="'Oops, looks like you dont have a project yet.'"
                :subtitle="'Dont worry! Start your first project by clicking the button below!'"
                :actionLabel="'Create Project'" />
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
import NotFound from '@/components/NotFound.vue'
import ProjectExist from '@/components/ProjectExist.vue'
import AddProject from '@/components/AddProject.vue'
import Loading from '@/components/Loading.vue'
import axios from 'axios';

export default {
    name: 'Project',
    components: {
        ProjectExist,
        NotFound,
        ProjectLayout,
        AddProject,
        Loading,
    },

    data() {
        return {
            projectList: [],
            projectCount: 0,
            showAddProjectForm: false,
            dataFinishLoading: false,
        };
    },

    mounted() {
        this.emitter.on('createProject', this.manageEventProject);
        this.emitter.on('refreshProject', this.getProjectList);
    },

    beforeUnmount() {
        this.emitter.off('createProject', this.manageEventProject);
        this.emitter.off('refreshProject', this.getProjectList);
    },

    methods: {
        manageEventProject() {
            this.showAddProjectForm = !this.showAddProjectForm;
        },

        async getProjectList() {
            this.projectList= [];
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/getProjectList');
                if (response.data.projects) {
                    console.log(response.data.projects); 

                    // Use forEach method for iterating response.data.projects
                    //cannot use for loop as it will also return the index
                    response.data.projects.forEach((project) => {
                        this.projectList.push(project);
                    });

                    // Update project count after data is pushed
                    this.projectCount = this.projectList.length;
                }
            } catch (error) {
                console.error(error);
            }
        }

    },

    created() {
        this.getProjectList();
    },
};

</script>

<style scoped></style>
