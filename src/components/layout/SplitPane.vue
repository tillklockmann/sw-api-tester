<script setup lang="ts">
import { ref } from 'vue'

const splitRatio = ref(55) // percent for top pane
const isDragging = ref(false)
const container = ref<HTMLElement | null>(null)

function startDrag() {
  isDragging.value = true
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e: MouseEvent) {
  if (!container.value || !isDragging.value) return
  const rect = container.value.getBoundingClientRect()
  const percent = ((e.clientY - rect.top) / rect.height) * 100
  splitRatio.value = Math.min(85, Math.max(15, percent))
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}
</script>

<template>
  <div
    ref="container"
    class="flex flex-col h-full overflow-hidden"
    :class="{ 'select-none': isDragging }"
  >
    <div :style="{ height: splitRatio + '%' }" class="overflow-auto">
      <slot name="top" />
    </div>

    <div
      class="h-1.5 bg-border hover:bg-accent cursor-row-resize shrink-0 transition-colors"
      @mousedown.prevent="startDrag"
    />

    <div :style="{ height: (100 - splitRatio) + '%' }" class="overflow-auto">
      <slot name="bottom" />
    </div>
  </div>
</template>
