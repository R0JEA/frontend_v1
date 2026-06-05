<script setup lang="ts">
import type { ChatMessage } from '~/types'

const props = defineProps<{ message: ChatMessage }>()

const copied = ref(false)

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(props.message.content)
  } catch {
    // Fallback for browsers without Clipboard API
    const el = document.createElement('textarea')
    el.value = props.message.content
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

const isUser = computed(() => props.message.role === 'user')
</script>

<template>
  <div class="flex flex-col gap-1 max-w-4xl" :class="isUser ? 'ml-auto items-end' : 'mr-auto items-start'">

    <!-- Meta label -->
    <div class="flex items-center gap-2 text-xs text-slate-500 px-1">
      <template v-if="isUser">
        <span>{{ message.filename ? `📄 ${message.filename}` : '👤 You' }}</span>
      </template>
      <template v-else>
        <span>🤖 Generated · <code class="text-slate-400">{{ message.format }}</code></span>
      </template>
      <span>{{ formatTime(message.timestamp) }}</span>
    </div>

    <!-- Bubble -->
    <div
      class="rounded-xl overflow-hidden w-full"
      :class="isUser
        ? 'bg-blue-950/50 border border-blue-800/40'
        : 'bg-slate-800 border border-slate-700'"
    >
      <!-- Toolbar (assistant only) -->
      <div
        v-if="!isUser"
        class="flex items-center justify-between px-4 py-2 bg-slate-700/40 border-b border-slate-700"
      >
        <span class="text-xs font-medium text-slate-400">
          {{ message.format === 'pytest' ? 'pytest' : 'unittest' }} · Python
        </span>
        <button
          @click="copyToClipboard"
          class="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <span v-if="copied" class="text-green-400">✓ Copied</span>
          <span v-else>Copy</span>
        </button>
      </div>

      <!-- Code content -->
      <pre class="text-sm font-mono p-4 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed"
           :class="isUser ? 'text-blue-100' : 'text-slate-100'"
      ><code>{{ message.content }}</code></pre>
    </div>

  </div>
</template>
