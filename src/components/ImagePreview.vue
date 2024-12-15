<template>
  <div v-if="visible" class="image-preview-overlay" @click="close">
    <div class="image-preview-content">
      <img :src="imageUrl" alt="Preview" @click.stop>
      <button class="close-button" @click="close">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  imageUrl: string
}>()

const emit = defineEmits<{
  close: []
}>()

const close = () => {
  emit('close')
}
</script>

<style scoped>
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.image-preview-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.image-preview-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.close-button {
  position: absolute;
  top: -40px;
  right: -40px;
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
  padding: 10px;
}

.close-button:hover {
  color: #ddd;
}
</style> 