<!-- https://vike.dev/Layout -->

<template>
  <div class="layout" un-font="sans">
    <Header />
    <main un-p="x-5 y-2">
      <slot />
    </main>
  </div>
</template>

<script lang="ts" setup>
import "virtual:uno.css";
import "@fontsource/m-plus-1p/japanese.css";
import "@fontsource/m-plus-1p/japanese-700.css";
import Header from "../components/Header.vue";
</script>

<style>
body {
  margin: 0;
  font-family: sans-serif;
}
* {
  box-sizing: border-box;
}
a {
  text-decoration: none;
}
</style>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
}
/* Page Transition Animation */
#page-content {
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
}
body.page-transition #page-content {
  opacity: 0;
}
</style>
