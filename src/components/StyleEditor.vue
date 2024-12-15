<template>
  <div class="style-editor">
    <h3>样式设置</h3>
    <div class="style-form">
      <div class="form-group">
        <label>字体</label>
        <select v-model="localStyle.font">
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
        </select>
      </div>

      <div class="form-group">
        <label>字体大小</label>
        <input 
          type="number" 
          v-model="localStyle.fontSize" 
          min="12" 
          max="48"
        >
      </div>

      <div class="form-group">
        <label>字体颜色</label>
        <input 
          type="color" 
          v-model="localStyle.color"
        >
      </div>

      <div class="form-group">
        <label>背景颜色</label>
        <input 
          type="color" 
          v-model="localStyle.background"
        >
      </div>

      <div class="form-group">
        <label>不透明度</label>
        <input 
          type="range" 
          v-model="localStyle.opacity" 
          min="0" 
          max="1" 
          step="0.1"
        >
        <span>{{ Math.round(localStyle.opacity * 100) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Template } from '../types/template'

const props = defineProps<{
  template: Template
}>()

const emit = defineEmits<{
  update: [template: Template]
}>()

// 创建本地样式副本
const localStyle = ref({
  font: props.template.style?.font || 'Arial',
  fontSize: props.template.style?.fontSize || 20,
  color: props.template.style?.color || '#000000',
  background: props.template.style?.background || '#ffffff',
  opacity: props.template.style?.opacity || 1
})

// 监听样式变化并触发更新
watch(localStyle, (newStyle) => {
  const updatedTemplate = {
    ...props.template,
    style: newStyle
  }
  emit('update', updatedTemplate)
}, { deep: true })
</script>

<style scoped>
.style-editor {
  margin-top: 20px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #333;
}

.style-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 14px;
  color: #666;
}

input, select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input[type="color"] {
  height: 40px;
  padding: 2px;
}

input[type="range"] {
  width: 100%;
}
</style> 