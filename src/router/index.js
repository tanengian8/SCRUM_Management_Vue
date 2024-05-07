
import { createRouter, createWebHistory } from 'vue-router'
import Project from '../views/Project.vue'
import Backlog from '../views/Backlog.vue'
import Sprint from '../views/Sprint.vue'
import UserManagement from '../views/UserManagement.vue'
import Rtm from '../views/RTM.vue'
import ScrumBoard from '../views/ScrumBoard.vue'
import Estimation from '../views/Estimation.vue'
import AddSprint from '../views/AddSprint.vue'
import Notification from '../views/Notification.vue'
import PlanningPoker from '@/views/PlanningPoker.vue'
import login from '@/views/Login.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: login,
    meta: {
      title: 'Login'
    }
  },

  {
    path: '/project',
    name: 'Project',
    component: Project,
    meta: {
      title: 'Project'
    }
  },


  {
    path: '/backlog',
    name: 'Backlog',
    component: Backlog,
    meta: {
      title: 'Backlog'
    }
  },

  {
    path: '/sprint',
    name: 'Sprint',
    component: Sprint,
    meta: {
      title: 'Sprint'
    }
  },

  {
    path: '/add-sprint',
    name: 'AddSprint',
    component: AddSprint,
    meta: {
      title: 'Add Sprint'
    }
  },

  {
    path: '/user-management',
    name: 'UserManagement',
    component: UserManagement,
    meta: {
      title: 'User Management'
    }
  },

  {
    path: '/rtm',
    name: 'RTM',
    component: Rtm,
    meta: {
      title: 'RTM'
    }
  },

  {
    path: '/scrum-board',
    name: 'ScrumBoard',
    component: ScrumBoard,
    meta: {
      title: 'Scrum Board'
    }
  },

  {
    path: '/estimation',
    name: 'Estimation',
    component: Estimation,
    meta: {
      title: 'Estimation'
    }
  },

  {
    path: '/notification',
    name: 'Notification',
    component: Notification,
    meta: {
      title: 'Notification'
    }
  },

  {
    path: '/planning-poker',
    name: 'PlanningPoker',
    component: PlanningPoker,
    meta: {
      title: 'Planning Poker'
    }
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken');
  if (token || to.path === '/') {
    document.title = to.meta.title || 'SCRUM Project Management';
    next();
  } else {
    // No token found and not already on the login page, redirect to login
    next('/');
  }
})

export default router