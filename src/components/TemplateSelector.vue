<template>
  <div class="template-selector">
    <h3>选择模板</h3>
    <div class="templates-grid">
      <div
        v-for="template in templates"
        :key="template.id"
        class="template-item"
        :class="{ active: isSelected(template) }"
        @click="$emit('select', template)"
      >
        <div class="template-preview">
          <img :src="template.preview" :alt="template.name">
        </div>
        <div class="template-name">{{ template.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Template } from '../types/template'

const props = defineProps<{
  templates: Template[]
  selectedTemplate: Template | null
}>()

defineEmits<{
  select: [template: Template]
}>()

const isSelected = (template: Template) => {
  return template.id === props.selectedTemplate?.id
}
</script>

<style scoped>
.template-selector {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #333;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.template-item {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.template-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.template-item.active {
  border-color: var(--primary-color);
}

.template-preview {
  aspect-ratio: 16/9;
  background: #f5f5f5;
  overflow: hidden;
}

.template-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-name {
  padding: 8px;
  text-align: center;
  font-size: 14px;
  color: #666;
}
</style> 