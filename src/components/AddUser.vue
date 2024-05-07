<template>
    <div class="invite-users">
        <h2 style='padding-bottom:10px'>Invite User</h2>
        <div class="user-input">
            <input type="email" v-model="newUserEmail" placeholder="Enter user email" ref="newUserEmail">
            <button class="function-button-blue" @click="inviteAction">Invite</button>
        </div>
        <h2> List of User(s) Invited</h2>
        <table v-if="invitedUsers.length > 0" class="sub-table">
            <thead>
                <tr>
                    <th style="width:400px;">Email</th>
                    <th style="width:300px;">Role</th>
                    <th style="width:200px;">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(user, index) in invitedUsers" :key="index" class="user">
                    <td style="width: 400px;">{{ user.email }}</td>
                    <td style="width: 300px;">
                        <select v-model="user.role" :class="getRoleClass(user.role)" @change="handleRoleChange(user)">
                            <option value="SCRUM Master">SCRUM Master</option>
                            <option value="Team Member">Team Member</option>
                            <option value="Product Owner">Product Owner</option>
                        </select>
                    </td>
                    <td style="width: 200px;">
                        <v-icon color="#ff6b6b" icon="mdi-delete" @click="removeUser(index)"></v-icon>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-else class="no-user">No user invited yet.</div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'AddUser',
    props: {
        mode: String  // Define mode prop
    },

    data() {
        return {
            newUserEmail: '',
            invitedUsers: [],
        };
    },

    mounted() {
        this.emitter.on('managementPageAddUser', this.managementPageAddUser);
        // Listen for addProject event and it has parameter of projectName
        this.emitter.on("addProject", (projectName) => {
            this.addProject(projectName);
        });
    },

    beforeUnmount() {
        this.emitter.off('managementPageAddUser', this.managementPageAddUser);
        this.emitter.off("addProject", (projectName) => {
            this.addProject(projectName);
        });
    },

    methods: {
        async managementPageAddUser() {
            if (this.invitedUsers.length === 0) {
                alert('Please invite at least one user.');
            } else {
                try {
                    const response = await axios.post('http://127.0.0.1:8000/api/addUserToProject', {
                        projectID: this.currentProject,
                        invitedUsers: this.invitedUsers
                    });

                    if (response.status === 201) {
                        this.$emit('InviteUserSuccess');
                    }

                } catch (error) {
                    alert('Invite User Fail:' + error.message);
                }
            }
        },

        async addProject(projectName) {
            try {
                const response = await axios.post('http://127.0.0.1:8000/api/createProject', {
                    projectName: projectName,
                    invitedUsers: this.invitedUsers
                });

                if (response.status === 201) {
                    // Display success message
                    alert('Create project successful.');
                    this.$emit('createProjectSuccess');
                }
            } catch (error) {
                if (error.response && error.response.status === 422) {
                    // Handle validation errors
                    const validationErrors = error.response.data.errors;
                    // Iterate through validationErrors object and display them
                    for (const key in validationErrors) {
                        if (Object.hasOwnProperty.call(validationErrors, key)) {
                            alert(validationErrors[key][0]);
                        }
                    }
                } else {
                    // Handle other errors
                    alert('Create Project Fail:' + error.message);
                }
            }
        },

        async addProjectUser() {
            if (this.newUserEmail === '') {
                alert('Please enter an email');
            }

            else if (this.newUserEmail === this.currentUser.email) {
                alert('You cannot invite yourself.');
            }

            else {
                try {
                    //manually trigger email validation as is not form email input, html doesn't recognize input type email
                    const isEmailValid = this.$refs.newUserEmail.checkValidity();
                    if (!isEmailValid) {
                        alert('Please enter a valid email');

                    }

                    else {
                        if (!this.invitedUsers.find(user => user.email === this.newUserEmail)) {

                            const response = await axios.get('http://127.0.0.1:8000/api/checkUserExist', {
                                params: {
                                    email: this.newUserEmail
                                }
                            });

                            //if resposne.data.userID exist
                            if (response.data.userID) {
                                //add into invitedUsers array
                                this.invitedUsers.push({ id: response.data.userID, email: this.newUserEmail, role: 'Team Member' });
                                this.newUserEmail = ''; // Clear input after adding user
                            }

                            else {
                                alert('User is not a registered user.');
                            }


                        }
                        else {
                            alert('User is already invited.');
                        }
                    }

                } catch (error) {
                    alert('Invite User Fail:' + error.message);
                }
            }
        },

        async addManagementUser() {
            if (this.newUserEmail === '') {
                alert('Please enter an email');
                return;
            }

            if (this.newUserEmail === this.currentUser.email) {
                alert('You cannot invite yourself.');
                return;
            }

            try {
                //manually trigger email validation as is not form email input, html doesn't recognize input type email
                const isEmailValid = this.$refs.newUserEmail.checkValidity();
                if (!isEmailValid) {
                    alert('Please enter a valid email');

                }

                else {
                    if (!this.invitedUsers.find(user => user.email === this.newUserEmail)) {

                        const response = await axios.get('http://127.0.0.1:8000/api/checkUserExist', {
                            params: {
                                email: this.newUserEmail
                            }
                        });

                        //if resposne.data.userID exist
                        if (response.data.userID) {
                            const responseExist = await axios.get('http://127.0.0.1:8000/api/checkUserExistProject',
                                {
                                    params: {
                                        userID: response.data.userID,
                                        projectID: this.currentProject
                                    }
                                });

                            if (responseExist.data.exist) {
                                alert('User is already invited.');
                            }

                            else {
                                this.invitedUsers.push({ id: response.data.userID, email: this.newUserEmail, role: 'Team Member' });
                                console.log(this.invitedUsers);
                                this.newUserEmail = ''; // Clear input after adding user
                            }

                        }

                        else {
                            alert('User is not a registered user.');
                        }
                    }
                    else {
                        alert('User is already invited.');
                    }
                }

            } catch (error) {

                alert('Invite User Fail:' + error.message);
            }

        },

        async inviteAction() {
            if (this.mode === 'existingProject') {
                this.addManagementUser();
            } else {
                this.addProjectUser();
            }
        },

        removeUser(index) {
            const isConfirmed = window.confirm("Are you sure you want to delete this user?");
            if (isConfirmed) {
                this.invitedUsers.splice(index, 1);
            }
        },

        //to find the class for the role
        getRoleClass(role) {
            return role.toLowerCase().replace(' ', '-');
        },

        //remove focus from select element after role change
        handleRoleChange(user) {
            document.activeElement.blur();
        }
    }
}

</script>

<style scoped>
.user-input {
    display: flex;
    align-items: baseline;
    /* Change from center to baseline */
}

select:focus {
    background-color: white;
    /* Set the background color of the dropdown selections to white when focused */
    color: black;
    /* Set the text color of the dropdown selections to black when focused */
}

.no-user {
    margin-top: 20px;
    text-align: center;
}
</style>