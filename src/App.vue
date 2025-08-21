<template>
  <div id="app">
    <CreativeWall />
  </div>
</template>

<script setup lang="ts">
import CreativeWall from './components/CreativeWall.vue'
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Klee+One:wght@400;600&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Klee One', cursive;
  background: #1a1a1a;
  min-height: 100vh;
  overflow: hidden;
}

#app {
  width: 100vw;
  height: 100vh;
  padding: 15px;
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
}

</style>