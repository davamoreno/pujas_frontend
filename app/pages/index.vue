    <!-- pages/index.vue -->
<template>
  <h1>
    Selamat datang di halaman utama!
  </h1>
  <button @click="$router.push('/login')">
    Kembali ke Halaman Login
  </button>
</template>

<script setup lang="ts">
// You can add script logic here if needed

</script>

<style scoped>
/* Add component-specific styles here */
div {
  padding: 20px;
  text-align: center;
}
</style>