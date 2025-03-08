<script setup lang="ts">
const stuff = getTestUtil()

const something = somethingSpecial()

const plugin = examplePlugin()
</script>

<template>
    <button class="button">
        {{ stuff }} - {{ something }} - {{ plugin }}
    </button>
</template>

<style scoped>
.button {
    background-color: red;
}
</style>