<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import SplitPane from '@/components/layout/SplitPane.vue'
import ConnectionPanel from '@/components/connection/ConnectionPanel.vue'
import RequestBuilder from '@/components/request/RequestBuilder.vue'
import ResponsePanel from '@/components/response/ResponsePanel.vue'
import HistoryPanel from '@/components/history/HistoryPanel.vue'
import { ref } from 'vue'

const showHistory = ref(true)
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <AppHeader />

    <div class="flex-1 flex overflow-hidden">
      <!-- History Sidebar -->
      <div
        v-show="showHistory"
        class="w-[220px] shrink-0"
      >
        <HistoryPanel />
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <ConnectionPanel />

        <!-- Toggle history button -->
        <button
          :aria-label="showHistory ? 'Hide history panel' : 'Show history panel'"
          class="absolute top-[88px] left-0 z-10 bg-bg-secondary border border-border rounded-r px-1 py-2 text-[10px] text-text-muted hover:text-text-primary"
          :class="showHistory ? 'left-[220px]' : 'left-0'"
          @click="showHistory = !showHistory"
        >
          {{ showHistory ? '<' : '>' }}
        </button>

        <SplitPane class="flex-1">
          <template #top>
            <RequestBuilder />
          </template>
          <template #bottom>
            <ResponsePanel />
          </template>
        </SplitPane>
      </div>
    </div>
  </div>
</template>
