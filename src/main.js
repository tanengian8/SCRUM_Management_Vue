/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'
import mitt from 'mitt'
// Composables
import { createApp } from 'vue'

import router from './router'
import store from './store' // Import Vuex store
import './assets/style/global.css'
import projectState from './mixins/projectState'

const emitter = mitt()
const app = createApp(App).use(router).use(store).mixin(projectState) // Use the Vuex store
app.config.globalProperties.emitter = emitter;
registerPlugins(app)

app.mount('#app')
