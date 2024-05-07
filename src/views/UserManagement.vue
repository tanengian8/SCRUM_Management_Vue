<template>
    <ProjectLayout>
        <div class="user-management">
            <h1>User Management</h1>
        </div>
        <br>
        <div class="user-selection">
            <div class="filters">
                <div class="filter-box">
                    <div v-for="(role, index) in filterRoles" :key="index" class="user-role"
                        :class="{ active: role === selectedRole }" @click="filterUsers(role)">
                        {{ role }}
                    </div>
                </div>
            </div>
            <button class="function-button-blue" @click="toggleAddUserForm()" v-if="this.projectAuthority.isCreator">Add
                New User</button>
        </div>

        <div class="user-card user-header">
            <div class="user-info">
                <div style="width: 320px;">Name</div>
                <div style="width: 300px;">Username</div>
                <div style="width: 320px;">Email</div>
                <div style="width: 500px;">Role(s)</div>
                <div class="user-actions" style="width: 200px;" v-if="this.projectAuthority.isCreator">
                    <div>Action</div>
                </div>
            </div>
        </div>
        <div v-for="(user, index) in filteredUsers" :key="index" class="user-card">
            <div class="user-info">
                <div style="width: 320px;">{{ user.name }}</div>
                <div style="width: 300px;">{{ user.username }}</div>
                <div style="width: 320px;">{{ user.email }}</div>
                <div style="width: 500px;">
                    <div>
                        <div v-if="user.isSM" class="scrum-master">SCRUM Master</div>
                        <div v-if="user.isPO" class="product-owner">Product Owner</div>
                        <div v-if="user.isTM" class="team-member">Team Member</div>
                        <div v-if="user.isCreator" class="creator">Creator</div>
                    </div>
                </div>
                <div class="user-actions" style="width:200px;" v-if="this.projectAuthority.isCreator">
                    <button class="function-button-blue" @click="editUser(user)">Edit</button>
                    <!-- Use v-if to conditionally render the delete button -->
                    <button v-if="!user.isCreator" class="function-button-red" @click="deleteUser(user)">Delete</button>
                </div>
            </div>
        </div>

        <!-- Edit Modal -->
        <div class="popout-overlay" v-if="showEditForm">
            <div class="popout-modal">
                <PopoutLayout pageTitle="Edit User Role">
                    <div class="checkbox-container">
                        <div class="roles-checkbox">
                            <label class="role-checkbox scrum-master">
                                <input type="checkbox" v-model="editedUserIsSM">
                                <span class="checkmark"></span>
                                <div class="user-container">SCRUM Master</div>
                            </label>
                            <label class="role-checkbox team-member">
                                <input type="checkbox" v-model="editedUserIsTM">
                                <span class="checkmark"></span>
                                <div class="user-container">Team Member</div>
                            </label>
                            <label class="role-checkbox product-owner">
                                <input type="checkbox" v-model="editedUserIsPO">
                                <span class="checkmark"></span>
                                <div class="user-container">Product Owner</div>
                            </label>
                        </div>
                    </div>

                    <div class="button-container">
                        <div class="function-button-blue-container">
                            <button class="function-button-blue" @click="saveEditedRoles">Save Roles</button>
                        </div>
                        <div class="function-button-red-container">
                            <button class="function-button-red" @click="cancelEdit">Cancel</button>
                        </div>
                    </div>
                </PopoutLayout>
            </div>
        </div>

        <!-- Add User Modal -->
        <div class="popout-overlay" v-if="showAddUserForm">
            <div class="popout-modal">
                <PopoutLayout pageTitle="Add New User">
                    <AddUser @inviteUserSuccess="inviteUserSuccess" mode="existingProject" />
                    <div class="button-container">
                        <div class="function-button-blue-container">
                            <button class="function-button-blue" @click="inviteUser">Confirm</button>
                        </div>
                        <div class="function-button-red-container">
                            <button class="function-button-red" @click="toggleAddUserForm">Cancel</button>
                        </div>
                    </div>
                </PopoutLayout>
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
import ProjectLayout from "@/layout/ProjectLayout.vue";
import PopoutLayout from "@/layout/PopoutLayout.vue";
import AddUser from "@/components/AddUser.vue";
import Loading from "@/components/Loading.vue";
import axios from "axios";

export default {
    name: "UserManagement",
    components: { ProjectLayout, AddUser, PopoutLayout, Loading },
    data() {
        return {
            projectMembers: [],
            selectedRole: null, // Default selected role
            filteredUsers: [], // Array to store filtered users
            filterRoles: ["All", "Creator", "SCRUM Master", "Product Owner", "Team Member"], // Available roles
            editedUserIndex: null, // Index of the user being edited
            editedUserRoles: [], // Roles being edited
            showEditForm: false,
            showAddUserForm: false,
            editedUserIsSM: false,
            editedUserIsTM: false,
            editedUserIsPO: false,
            editedUserIsCreator: false,
        };
    },
    methods: {
        filterUsers(role) {
            this.selectedRole = role;
            switch (role) {
                case "All":
                    // Show all users
                    this.filteredUsers = this.projectMembers;
                    break;
                case "SCRUM Master":
                    // Filter users where isSM is true
                    this.filteredUsers = this.projectMembers.filter((user) => user.isSM);
                    break;
                case "Product Owner":
                    // Filter users where isPO is true
                    this.filteredUsers = this.projectMembers.filter((user) => user.isPO);
                    break;
                case "Creator":
                    // Filter users where isCreator is true
                    this.filteredUsers = this.projectMembers.filter((user) => user.isCreator);
                    break;
                case "Team Member":
                    // Filter users where isTM is true
                    this.filteredUsers = this.projectMembers.filter((user) => user.isTM);
                    break;
                default:
                    // If the role is not recognized, show all users
                    this.filteredUsers = this.projectMembers;
                    break;
            }
        },

        async deleteUser(user) {
            const isConfirmed = window.confirm("Are you sure you want to delete this user?");
            if (isConfirmed) {
                // Delete the user from the projectMembers array
                try {
                    const response = await axios.delete('http://127.0.0.1:8000/api/deleteProjectMember', {
                        data: {
                            projectID: this.currentProject,
                            userID: user.id,
                        },
                    });
                    if (response.status === 200) {
                        console.log("Test");
                        this.getProjectMembers();
                        this.filterUsers(this.selectedRole);
                    }
                }
                catch (error) {
                    console.log(error);
                }
            }
        },

        editUser(user) {
            this.editedUserIndex = this.projectMembers.findIndex((member) => member.id === user.id);
            this.showEditForm = true;
            // Convert to boolean values
            this.editedUserIsSM = !!user.isSM; // Double negation to convert to boolean
            this.editedUserIsTM = !!user.isTM;
            this.editedUserIsPO = !!user.isPO;
            this.editedUserIsCreator = !!user.isCreator;
        },


        async saveEditedRoles() {
            const user = this.projectMembers[this.editedUserIndex];
            if (!this.editedUserIsCreator && !this.editedUserIsSM && !this.editedUserIsTM && !this.editedUserIsPO) {
                // If the user is not a creator and no roles are checked, show an alert
                alert("At least one role must be selected");
                return; // Exit the method without saving
            }

            else {
                try {
                    const response = await axios.put('http://127.0.0.1:8000/api/updateProjectMemberRole', {
                        projectID: this.currentProject,
                        userID: user.id,
                        isSM: this.editedUserIsSM,
                        isTM: this.editedUserIsTM,
                        isPO: this.editedUserIsPO,
                    });

                    if (response.status === 200) {
                        this.getProjectMembers();
                        this.filterUsers(this.selectedRole);
                        this.showEditForm = false;
                        this.clearForm();
                    }

                } catch (error) {
                    console.log(error);
                }
            }
        },


        cancelEdit() {
            this.showEditForm = false;
        },

        toggleAddUserForm() {
            this.showAddUserForm = !this.showAddUserForm;
        },

        inviteUser() {
            this.emitter.emit('managementPageAddUser');
        },

        inviteUserSuccess() {
            alert("User(s) added successfully");
            this.getProjectMembers();
            this.filterUsers(this.selectedRole);
            this.showAddUserForm = false;
        },

        clearForm() {
            this.editedUserIsSM = false;
            this.editedUserIsTM = false;
            this.editedUserIsPO = false;
            this.editedUserIsCreator = false;
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
                console.log(error);
            }
        },
    },
    mounted() {
        this.getProjectMembers().then(() => {
            this.filterUsers("All");
        });
    },

    watch: {
        projectMembers: {
            handler() {
                this.filterUsers(this.selectedRole);
            },
            deep: true,
        },
    }



};
</script>

<style scoped>
.user-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    /* Center align the buttons horizontally */
}

.user-actions div {
    padding: 5px;
}

.user-selection {
    margin-top: 20px;
    margin-bottom: 20px;
    display: flex;
}

.filter-box {
    display: flex;
    align-items: center;
    /* Center the items vertically */
}

.user-role {
    background-color: #707980;
    color: #fff;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 5px;
}

.user-role.active {
    font-weight: bold;
}

.user-role:not(:last-child) {
    margin-right: 10px;
    /* Add margin between roles */
}

/* Styles for the role checkboxes */
.roles-checkbox {
    display: grid;
    grid-template-columns: auto auto;
    gap: 10px;
}

/* Styles for each role checkbox */
.role-checkbox {
    position: relative;
    margin-bottom: 10px;
    cursor: pointer;
    font-size: 15px;
}

/* Hide the default checkbox */
.role-checkbox input {

    position: absolute;
    opacity: 0;
    cursor: pointer;
}

/* Custom checkbox design */
.checkmark {
    position: absolute;
    top: 0;
    right: 0;
    /* Position the checkmark at the right */
    height: 32.5px;
    width: 32.5px;
    background-color: #e5dfdf;
    border-radius: 5px;
}


/* When the checkbox is checked, add a background color */
.role-checkbox input:checked~.checkmark {
    background-color: #2196F3;
}

/* Checkmark icon */
.checkmark:after {
    content: "";
    position: absolute;
    display: none;
}

/* Show the checkmark icon when the checkbox is checked */
.role-checkbox input:checked~.checkmark:after {
    display: block;

}

/* Style the checkmark icon */
.role-checkbox .checkmark:after {
    left: 14px;
    top: 9px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
}

.filters {
    display: flex;
    justify-content: space-between;
    flex: 1;
}

.user-container {
    margin-right: 30px;
    text-align: center;
}

.checkbox-container {
    margin-top: 20px;
}
</style>