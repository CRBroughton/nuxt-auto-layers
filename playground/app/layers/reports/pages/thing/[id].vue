<script setup lang="ts">
const route = useRoute()
</script>

<template>
  {{ route.params.id }}
</template>
