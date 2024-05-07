<template>
    <div class ="outer-layer">
    <div class="popout-header">
      <h1>{{ pageTitle }}</h1> <!-- Display the dynamic header here -->
      <div class="popout-layout">
        <!-- Slot for dynamic content -->
        <slot></slot>
      </div>
    </div>
</div>
  </template>
  
  <script>
  
  export default {
    name: 'PopoutLayout',
    props: {
    pageTitle: {
      type: String,
      required: true
    }
  }
  }
  </script>
  
  <style>
.outer-layer{
    justify-content: center;
    align-items: center;
    padding-left: 35%;
    padding-right: 35%;
}

.popout-header h1{
    background-color:#0E1D3D;
    color: white;
    text-align:left;
    padding: 10px;
    padding-left:30px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    font-size:25px;

}
  .popout-layout {
    max-width: 100%;
    margin: 0 auto;
    padding: 10px 30px;
    border: 1px solid #ccc;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    background-color: #f9f9f9;
    
}

.popout-layout h2 {
    font-size: 20px;
    font-weight: bold;
    color: #0E1D3D;
    margin-top: 10px;
    padding-top: 5px;
    padding-bottom: 5px;
    text-align:left;
}

.popout-layout input,.popout-layout select {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 100% !important;
    
}

.popout-layout select {
    cursor: pointer;
    text-align: center;
}

</style>
  