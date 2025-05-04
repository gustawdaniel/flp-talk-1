<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import {ref} from "vue";
const url = ref('');

</script>

<template>
  <main>
    <input v-model="url" placeholder="Url">
    <button>Summary</button>
  </main>
</template>
