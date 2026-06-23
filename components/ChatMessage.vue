<script setup lang="ts">
import type { ChatMessage } from '~/types'

const props = defineProps<{ message: ChatMessage }>()

const isUser = computed(() => props.message.role === 'user')

// ── Typing animation ──────────────────────────────────────────────────────
const stableText  = ref('')
const latestChunk = ref('')
const chunkKey    = ref(0)
const isTyping    = ref(false)

onMounted(() => {
  if (isUser.value) {
    stableText.value = props.message.content
  } else {
    animateText(props.message.content)
  }
})

async function animateText(text: string) {
  isTyping.value = true
  stableText.value = ''
  latestChunk.value = ''
  const CHUNK = 6
  const DELAY = 56

  for (let i = 0; i < text.length; i += CHUNK) {
    await new Promise(r => setTimeout(r, DELAY))
    stableText.value = text.slice(0, i)
    latestChunk.value = text.slice(i, Math.min(i + CHUNK, text.length))
    chunkKey.value++
  }

  stableText.value = text
  latestChunk.value = ''
  isTyping.value = false
}

// ── Copy ─────────────────────────────────────────────────────────────────
const copied = ref(false)

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(props.message.content)
  } catch {
    const el = document.createElement('textarea')
    el.value = props.message.content
    el.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
}
</script>

<template>
  <div class="flex flex-col gap-1.5" :class="isUser ? 'items-end' : 'items-start'">

    <!-- Meta label -->
    <div class="flex items-center gap-2 text-xs text-tum-blue-mid px-2">
      <template v-if="isUser">
        <span>{{ message.filename ? `📄 ${message.filename}` : 'Your input' }}</span>
      </template>
      <template v-else>
        <span>Output · <code class="text-tum-blue">{{ message.format }}</code></span>
      </template>
      <span class="text-tum-blue-light">{{ formatTime(message.timestamp) }}</span>
    </div>

    <!-- Bubble -->
    <div
      class="rounded-3xl overflow-hidden max-w-3xl w-full"
      :style="isUser
        ? 'background: #0065BD; border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 4px 18px rgba(0,101,189,0.3);'
        : 'background: rgba(255,255,255,0.65); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1.5px solid rgba(255,255,255,0.9); box-shadow: 0 4px 20px rgba(0,101,189,0.08);'"
    >
      <!-- Toolbar (AI only) -->
      <div
        v-if="!isUser"
        class="flex items-center justify-between px-4 py-2.5"
        style="background: rgba(255,255,255,0.5); border-bottom: 1px solid rgba(0,101,189,0.1);"
      >
        <span class="text-xs font-medium text-tum-blue-mid">
          {{ message.format === 'pytest' ? 'pytest' : 'unittest' }} · Python
        </span>
        <button
          @click="copyToClipboard"
          class="text-xs font-medium rounded-full px-3 py-1 transition-all hover:opacity-80"
          :style="copied
            ? 'color:#059669; background:rgba(255,255,255,0.55); border:1px solid rgba(255,255,255,0.85); box-shadow:inset 0 1px 0 rgba(255,255,255,0.95);'
            : 'color:#0065BD; background:rgba(255,255,255,0.45); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.85); box-shadow:inset 0 1px 0 rgba(255,255,255,0.95);'"
        >
          {{ copied ? '✓ Copied' : 'Copy' }}
        </button>
      </div>

      <!-- Code -->
      <pre
        class="text-sm p-4 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed font-mono"
        :class="isUser ? 'text-white' : 'text-tum-blue-dark'"
      ><code v-if="isUser">{{ message.content }}</code><code v-else>{{ stableText }}<span
            v-if="latestChunk"
            :key="chunkKey"
            style="animation: blur-appear 0.18s ease-out forwards;"
          >{{ latestChunk }}</span><span
            v-if="isTyping"
            style="display:inline-block;width:1.5px;height:0.85em;background:currentColor;vertical-align:text-bottom;margin-left:1px;opacity:0.6;animation:cursor-blink 0.65s step-end infinite;"
          /></code></pre>
    </div>

  </div>
</template>
