import { mapState, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState(['currentProject']),
    ...mapState(['currentUser']),
    ...mapState(['projectAuthority']),
    ...mapState(['isLoading']),
    ...mapState(['planningPoker'])
    
  },
  methods: {
    ...mapActions(['setCurrentProject']),
    ...mapActions(['setCurrentUser']),
    ...mapActions(['setProjectAuthority']),
    ...mapActions(['resetState']),
    ...mapActions(['setLoading']),
    ...mapActions(['setPlanningPoker'])
  }
  
};
