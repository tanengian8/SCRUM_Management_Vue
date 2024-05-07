<template>
    <div class="login-page">
        <div class="background-image"></div>
        <div class="login-container">
            <div class="left-section">
                <h1 style="color:white">SCRUM MANAGEMENT</h1>
            </div>
            <div class="right-section">
                <div class="login-register-buttons">
                    <button class="login" :class="{ bold: isLogin }" @click="toggleLogin">Login</button>
                    <button class="register" :class="{ bold: !isLogin }" @click="toggleRegister">Register</button>
                    <hr>
                </div>

                <div v-if="isLogin">
                    <form>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" v-model="loginEmail" placeholder="Enter your email"
                                ref="loginEmail" />
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" v-model="loginPassword"
                                placeholder="Enter your password" />
                        </div>
                        <button class="login-button" @click.prevent="login">Login</button>

                    </form>
                </div>
                <div v-else>
                    <form>
                        <div class="form-group">
                            <label for="name">Name</label>
                            <input type="text" id="name" v-model="name" placeholder="Enter your name" />
                        </div>
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" v-model="username" placeholder="Enter your username" />
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" v-model="email" placeholder="Enter your email" ref="email" />
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" v-model="password" placeholder="Enter your password" />
                        </div>
                        <div class="form-group">
                            <label for="confirm-password">Confirm Password</label>
                            <input type="password" id="confirm-password" v-model="confirmPassword"
                                placeholder="Confirm your password" />
                        </div>
                        <div class="form-group">
                            <label for="address-line-1">Address Line 1</label>
                            <input type="text" id="address-line-1" v-model="addressLine1"
                                placeholder="Enter your address line 1" />
                        </div>
                        <div class="form-group">
                            <label for="address-line-2">Address Line 2</label>
                            <input type="text" id="address-line-2" v-model="addressLine2"
                                placeholder="Enter your address line 2" />
                        </div>
                        <div class="form-group">
                            <label for="phone-number">Phone Number</label>
                            <input type="text" id="phone-number" v-model="phoneNumber"
                                placeholder="Enter your phone number" />
                        </div>
                        <button class="register-button" @click.prevent="register">Register</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <div class="popout-overlay" v-if="isLoading">
        <div class="popout-modal">
            <Loading />
        </div>
    </div>
</template>

<script>
import axios from '../plugins/axiosConfig';
import Loading from '@/components/Loading.vue';


export default {
    name: 'Login',
    components: {
        Loading
    },
    data() {
        return {
            loginEmail: '',
            loginPassword: '',
            isLogin: true,
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            name: '',
            addressLine1: '',
            addressLine2: '',
            phoneNumber: '',

        };
    },
    methods: {
        toggleLogin() {
            this.isLogin = true;
        },
        toggleRegister() {
            this.isLogin = false;
        },

        async login() {
            if (this.loginEmail === '' || this.loginPassword === '') {
                alert('Please enter your email and password.');
                return false;
            }

            //trigger email checking manually
            const isEmailValid = this.$refs.loginEmail.checkValidity();
            if (!isEmailValid) {
                alert('Please enter a valid email.');
                return false;
            }

            try {
                // Send a POST request to your Laravel backend login endpoint
                const response = await axios.post('http://127.0.0.1:8000/api/login', {
                    //pass in csrf token manually
                    //pass it into the header
                    email: this.loginEmail,
                    password: this.loginPassword
                });

                if (response.status === 200) {
                    const token = response.data.token;

                    // Store the token in local storage
                    localStorage.setItem('authToken', token);

                    //set current logged in user details
                    this.setCurrentUser({ id: response.data.user.id, email: response.data.user.email });

                    // Redirect to project page
                    this.$router.push('/project');
                } else {
                    alert('Login failed. Please check your credentials.');
                }

            } catch (error) {
                alert('Login failed. Please check your credentials.');
                // If the request fails, log the error and return false to indicate unsuccessful login
                console.error('Login failed:', error);
                return false;
            }
        },

        async register() {
            try {
                //trigger email checking manually
                const isEmailValid = this.$refs.email.checkValidity();
                if (!isEmailValid) {
                    alert('Please enter a valid email.');
                    return false;
                }

                if (this.password !== this.confirmPassword) {
                    throw new Error('Passwords do not match. Please try again.');
                }

                if (this.email === '' || this.password === '' || this.name === '' || this.addressLine1 === '' || this.addressLine2 === '' || this.phoneNumber === '' || this.username === '') {
                    throw new Error('Please fill in all fields.');
                }

                const response = await axios.post('http://127.0.0.1:8000/api/register', {
                    email: this.email,
                    password: this.password,
                    name: this.name,
                    address1: this.addressLine1,
                    address2: this.addressLine2,
                    phoneNumber: this.phoneNumber,
                    username: this.username
                });

                if (response.status === 201) {
                    // Display success message
                    alert('Registration successful. Please login to continue.');
                    // Clear all fields
                    this.email = '';
                    this.password = '';
                    this.name = '';
                    this.addressLine1 = '';
                    this.addressLine2 = '';
                    this.phoneNumber = '';
                    this.username = '';
                    this.confirmPassword = '';
                    this.isLogin = true;
                }
            } catch (error) {
                if (error.response) {
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
                    alert('Registration failed:' + error.message);
                }
            }
        }
    }
};

</script>

<style>
/* Login Page Styles */
.login-page {
    position: relative;
    height: 100vh;
    background-color: #0E1D3D;
    /* Dark blue background */
    overflow: hidden;
}

.background-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('C:\Users\tanen\Desktop\fyp-frontend\src\assets\codioful-formerly-gradienta-bKESVqfxass-unsplash 1.png');
    /* Replace 'your-background-image-url.jpg' with your image path */
    background-size: cover;
    filter: brightness(0.7);
    /* Adjust brightness of the background image */
}

/* Login Container Styles */
.login-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    /* 90% of the page width */
    max-width: 1200px;
    /* Maximum width of the container */
    background-color: #fff;
    /* White background */
    border-radius: 8px;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
    /* Shadow effect */
    display: flex;
    overflow: hidden;
    /* Hide overflowing content */
}

/* Left Section Styles */
.left-section {
    flex: 0.5;
    padding: 20px;
    color: #fff;
    /* Dark blue text */
    background-color: #0E1D3D;
    /* Dark blue background */
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Right Section Styles */
.right-section {
    flex: 1;
    padding: 20px;
}

/* Login/Register Buttons Styles */
.login-register-buttons {
    margin-bottom: 20px;
    text-align: center;
}

.login-register-buttons button {
    font-family: 'Poppins', sans-serif;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 20px;
}

.register {
    margin-left: 30px;
}

.login {
    margin-right: 30px;
}

.login-register-buttons button:hover {
    font-weight: bold;
    /* Make text bold on hover */
}

hr {
    width: 45%;
    /* Adjust the width as needed */
    margin-left: 200px;
    margin-top: 10px;
}

.bold {
    font-weight: bold;
    /* Make text bold */
}

/* Form Styles */
form {
    margin-top: 20px;
}

.form-group {
    margin-bottom: 20px;
    text-align: left;
}

label {
    display: block;
    font-weight: bold;
    color: #0E1D3D;
    /* Dark blue text */
    margin-bottom: 5px;
}

input[type="text"],
input[type="email"],
input[type="password"] {
    width: calc(100% - 20px);
    /* Subtract padding from width */
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
}

.login-button,
.register-button {
    width: 30%;
    padding: 10px;
    background-color: #0E1D3D;
    color: #fff;
    border: none;
    border-radius: 5px;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    /* Center horizontally */
    text-decoration: none;
    font-weight: bold;
}

.login-button:hover,
.register-button:hover {
    background-color: #285EAB;
    /* Lighter shade of blue on hover */
}
</style>./axiosConfig