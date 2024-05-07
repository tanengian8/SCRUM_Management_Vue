// store/index.js
import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

export default createStore({
    state: {
        currentProject: null,
        currentUser: {
            id: null,
            email: null
        },
        projectAuthority: {
            isPO: false,
            isTM: false,
            isSM: false,
            isCreator: false,
        },
        isLoading: false,
        planningPoker: null
    },
    mutations: {
        setCurrentProject(state, newProject) {
            state.currentProject = newProject;
        },
        setCurrentUser(state, userData) {
            state.currentUser = userData;
        },
        setProjectAuthority(state, authority) {
            state.projectAuthority = authority;
        },
        resetState(state) {
            state.currentProject = null;
            state.currentUser = {
                id: null,
                email: null
            };
            state.projectAuthority = {
                isPO: false,
                isTM: false,
                isSM: false,
                isCreator: false,
            };
        },
        setLoading(state, loadingState) {
            state.isLoading = loadingState;
        },

        setPlanningPoker(state, planningPoker) {
            state.planningPoker = planningPoker;
        }
    },
    actions: {
        setCurrentProject({ commit }, newProject) {
            commit('setCurrentProject', newProject);
        },
        setCurrentUser({ commit }, userData) {
            commit('setCurrentUser', userData);
        },
        setProjectAuthority({ commit }, authority) {
            commit('setProjectAuthority', authority);
        },
        resetState({ commit }) {
            commit('resetState');
        },
        setLoading({ commit }, loadingState) {
            commit('setLoading', loadingState);
        },
        setPlanningPoker({ commit }, planningPoker) {
            commit('setPlanningPoker', planningPoker);
        }
    },
    plugins: [createPersistedState()]
});
