<template>
    <div class="not-found-image">
        <img src='C:\Users\tanen\Desktop\fyp-frontend\src\assets\404 webpage.png' alt="Not Found" />
    </div>
    <div class="message">
        <h1>{{ title }}</h1>
        <h2>{{ subtitle }}</h2>
    </div>
    <div class='create-button'>
        <button class="add-button" @click="performAction">
            {{ actionLabel }}
        </button>
    </div>
</template>

<script>
export default {
    name: 'NotFound',
    props: {
        title: {
            type: String,
            required: true
        },
        subtitle: {
            type: String,
            required: true
        },
        actionLabel: {
            type: String,
            required: true
        }
    },
    methods: {
        performAction() {
            // Determine which function to execute based on some condition
            if (this.actionLabel === 'New Sprint') {
                if (this.projectAuthority.isSM || this.projectAuthority.isCreator) {
                    this.emitter.emit("newSprint")
                }

                else {
                    alert('You do not have the authority to create a sprint');
                }

            } else if (this.actionLabel === 'Create Project') {
                this.emitter.emit("createProject")
            }

            else if (this.actionLabel === 'New Backlog') {
                if (this.projectAuthority.isPO || this.projectAuthority.isCreator) {
                    this.emitter.emit("newBacklog")
                }
                else {
                    alert('You do not have the authority to create a backlog');
                }
            }
            else {
                alert('No action defined for this button');
            }
        },
    }
};
</script>

<style scoped>
img {
    width: 90%;
    height: 90%;
    padding-left: 250px;
}

.add-button {
    bottom: 50px;
    right: 50px;
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    background-color: #0E1D3D;
    color: white;
    font-size: 20px;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 30%;
    height: 30%;
}

.create-button {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
}

.add-button:hover {
    background-color: #285EAB;
}
</style>
