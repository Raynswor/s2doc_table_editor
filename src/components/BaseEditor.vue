<template>
  <div class="base-editor">
    <slot name="content">
      <slot />
    </slot>
  </div>
</template>

<script setup lang="ts">
// Simplified BaseEditor - just a wrapper for the standalone version
</script>

<style scoped>
.base-editor {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>
