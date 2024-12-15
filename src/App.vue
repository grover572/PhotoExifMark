<script setup lang="ts">
import HomeView from './views/HomeView.vue'
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>照片EXIF信息处理器</h1>
    </header>
    <HomeView />
  </div>
</template>

<style>
:root {
  --primary-color: #1890ff;
  --primary-hover: #40a9ff;
  --primary-active: #096dd9;
  --text-primary: #2c3e50;
  --text-secondary: #666;
  --border-color: #e8e8e8;
  --background-light: #f5f5f5;
}

body {
  margin: 0;
  background-color: var(--background-light);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.app {
  min-height: 100vh;
}

.app-header {
  background: white;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

h1 {
  text-align: center;
  color: var(--text-primary);
  font-size: 1.8rem;
  margin: 0;
}

button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

button:hover {
  background-color: var(--primary-hover);
}

button:active {
  background-color: var(--primary-active);
}

.icon {
  width: 1.2em;
  height: 1.2em;
}
</style>
