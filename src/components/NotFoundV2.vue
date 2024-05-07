<template>
    <div class="not-found-image">
        <img src='C:\Users\tanen\Desktop\fyp-frontend\src\assets\404 webpage.png' alt="Not Found"/>
    </div>
    <div class="message">
        <h1>{{ title }}</h1>
        <h2>{{ subtitle }}</h2>
    </div>
</template>

<script>
export default {
    name: 'NotFoundV2',
    props: {
        title: {
            type: String,
            required: true
        },
        subtitle: {
            type: String,
            required: true
        },
    },
};
</script>

<style scoped>

img {
    width:90%;
    height:90%;
    padding-left:250px;
}

</style>
