<template>
  <div class ="outer-layer">
    <div class = "loading-container">
  <i class="fa fa-spinner fa-spin"></i></div>
</div>
</template>

<script>
import "font-awesome/css/font-awesome.min.css";
export default {
  name: 'Loading',
}
</script>

<style>
.loading-container{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 40px;
}

</style>
