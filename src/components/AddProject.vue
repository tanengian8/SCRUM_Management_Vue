<template>
    <PopoutLayout pageTitle="Add New Project">
        <h2 style="margin-top:0px">Project Name</h2>
        <input type="text" v-model="projectName" placeholder="Enter project name">
        <AddUser @createProjectSuccess="clearProjectName" mode="newProject" />
        <div class="button-container">
            <div class="function-button-blue-container">
                <button class="function-button-blue" @click.prevent="addProject">Confirm</button>
            </div>
            <div class="function-button-red-container">
                <button class="function-button-red" @click.prevent="cancel">Cancel</button>
            </div>
        </div>
    </PopoutLayout>
</template>


<script>
import PopoutLayout from '@/layout/PopoutLayout.vue';
import AddUser from '@/components/AddUser.vue';
import axios from 'axios';
export default {
    name: 'AddProject',
    components: {
        PopoutLayout,
        AddUser
    },

    data() {
        return {
            projectName: '',
        };
    },
    methods: {
        cancel() {
            this.$emit('togglePopout');
            this.emitter.off('addProject');

        },

        async addProject() {
            if (this.projectName === '') {
                alert('Please enter a project name');
            }
            else {

                this.emitter.emit('addProject', this.projectName);
                //to remove any existing emitter event as VueJS will emit new event with the old one still active
                //so means if I use addProject twice, it will emit twice
                this.emitter.off('addProject');
            }
        },

        clearProjectName() {
            this.projectName = '';
            this.$emit('togglePopout');

            //update project list once project is added
            this.emitter.emit("refreshProject");
        },
    }
};


</script>

<style scoped>
.add-button {
    background-color: #4b6fbc;
}

.add-button:hover {
    background-color: #83a6d6;
}

.cancel-button {
    background-color: #ff6b6b;
    ;
}

.cancel-button:hover {
    background-color: #ff8787;
}

.button-container {
    display: flex;
    justify-content: center;
}

.cancel-button-container,
.add-button-container {
    padding: 10px;
    margin: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
</style>