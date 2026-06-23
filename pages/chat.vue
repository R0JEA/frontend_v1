<script setup lang="ts">
import type { OutputFormat } from '~/types'

const { messages, loading, error, generate, clearHistory } = useChat()
const { logout } = useAuth()

const config = useRuntimeConfig()
const testModeAvailable = config.public.testModeAvailable as boolean

const MODELS = [
  { value: 'model1', label: 'Model 1' },
  { value: 'model2', label: 'Model 2' },
]

const model = ref(MODELS[0].value)
const testMode = ref(false)
const format = ref<OutputFormat>('pytest')
const code = ref('')
const filename = ref<string | undefined>()
const chatContainer = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

async function handleGenerate() {
  if (!code.value.trim() || !model.value || loading.value) return
  const currentCode = code.value
  const currentFilename = filename.value
  code.value = ''
  filename.value = undefined
  await generate(currentCode, format.value, model.value, currentFilename, testMode.value)
}

function handleKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') handleGenerate()
}

function triggerFileInput() { fileInput.value?.click() }

function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.name.endsWith('.py')) {
    alert('Please upload a .py Python file.')
    ;(event.target as HTMLInputElement).value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    code.value = (e.target?.result as string) ?? ''
    filename.value = file.name
  }
  reader.readAsText(file)
  ;(event.target as HTMLInputElement).value = ''
}

watch(messages, async () => {
  await nextTick()
  if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
}, { deep: true })

// Waveform: magenta → blue → cyan (kept from design brief)
function waveColor(i: number, total: number): string {
  const hue = Math.round(288 - (i / (total - 1)) * 103)
  return `hsl(${hue}, 88%, 62%)`
}
const WAVE_DUR = [0.9, 1.1, 0.8, 1.3, 1.0, 1.25, 0.85, 1.15]
function waveDuration(i: number) { return `${WAVE_DUR[i % WAVE_DUR.length]}s` }
function waveDelay(i: number) { return `${(i % 10) * 0.08}s` }

// Glass styles — neutral (header pills, selects) and primary (action button)
const glass = 'background: rgba(255,255,255,0.38); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 2px 10px rgba(0,101,189,0.07), inset 0 1px 0 rgba(255,255,255,0.95);'
const glassPrimary = 'background: #0065BD; border: 1px solid rgba(255,255,255,0.35); box-shadow: 0 4px 18px rgba(0,101,189,0.35), inset 0 1px 0 rgba(255,255,255,0.25);'
</script>

<template>
  <div
    class="flex flex-col h-screen"
    style="background: linear-gradient(135deg, #fce4ec 0%, #f3e5f5 30%, #e8eaf6 60%, #e3f2fd 80%, #e0f7fa 100%)"
  >

    <!-- ── Header ── -->
    <header
      class="flex items-center justify-between px-5 py-3 flex-shrink-0"
      style="background: rgba(255,255,255,0.5); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.75);"
    >
      <div class="flex items-center gap-2.5">
        <span class="text-xl">🐍</span>
        <span class="font-semibold text-sm text-tum-blue-dark tracking-tight">TU PyTest</span>
      </div>

      <div class="flex items-center gap-2.5">

        <!-- Test Mode toggle -->
        <button
          v-if="testModeAvailable"
          @click="testMode = !testMode"
          class="flex items-center gap-2 rounded-full px-3 py-1.5 transition-all"
          :style="glass"
          :title="testMode ? 'Test mode ON' : 'Test mode OFF'"
        >
          <span class="text-xs font-semibold text-tum-blue">Test Mode</span>
          <div class="relative flex items-center w-7 h-4 rounded-full" style="background: rgba(0,101,189,0.18);">
            <span
              class="absolute inline-block w-3 h-3 rounded-full bg-white shadow transition-all duration-200"
              :class="testMode ? 'left-3.5' : 'left-0.5'"
            />
          </div>
        </button>

        <div class="h-5 w-px" style="background: rgba(0,101,189,0.2)" />

        <!-- Model selector -->
        <label class="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 cursor-pointer" :style="glass">
          <span class="text-xs text-tum-blue font-medium whitespace-nowrap">Model</span>
          <select
            v-model="model"
            :disabled="testMode"
            class="text-xs text-tum-blue-dark font-medium bg-transparent outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option v-for="m in MODELS" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </label>

        <!-- Format selector -->
        <label class="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 cursor-pointer" :style="glass">
          <span class="text-xs text-tum-blue font-medium">Format</span>
          <select
            v-model="format"
            class="text-xs text-tum-blue-dark font-medium bg-transparent outline-none cursor-pointer"
          >
            <option value="pytest">pytest</option>
            <option value="unittest">unittest</option>
          </select>
        </label>

        <!-- Clear -->
        <button
          v-if="messages.length > 0"
          @click="clearHistory"
          class="text-xs text-tum-blue font-medium rounded-full px-3 py-1.5 transition-opacity hover:opacity-70"
          :style="glass"
        >
          Clear
        </button>

        <!-- Sign out -->
        <button
          @click="logout"
          class="text-xs text-tum-blue-dark font-medium rounded-full px-3.5 py-1.5 transition-opacity hover:opacity-70"
          :style="glass"
        >
          Sign out
        </button>
      </div>
    </header>

    <!-- ── Chat area ── -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto px-4 py-6 space-y-5">

      <!-- Empty state -->
      <div v-if="messages.length === 0 && !loading" class="flex flex-col items-center justify-center h-full text-center py-16">
        <div class="text-6xl mb-5">⚗️</div>
        <h2 class="text-xl font-bold text-tum-blue-dark mb-2">Generate Unit Tests</h2>
        <p class="text-tum-blue-mid text-sm max-w-sm leading-relaxed">
          Paste a Python function or upload a
          <code class="text-tum-blue bg-white/60 px-1.5 py-0.5 rounded-lg text-xs">.py</code>
          file, pick your format and model, then hit Generate.
        </p>
        <p v-if="testModeAvailable" class="mt-4 text-xs text-tum-blue-mid">
          Enable <span class="font-semibold text-tum-blue">Test Mode</span> to try without a backend.
        </p>
        <p class="text-tum-blue-light text-xs mt-2">Ctrl + Enter to submit</p>
      </div>

      <!-- Messages -->
      <ChatMessage v-for="msg in messages" :key="msg.id" :message="msg" />

      <!-- Soundwave loading -->
      <div v-if="loading" class="flex flex-col items-center gap-4 py-6">
        <div class="flex items-center gap-[3px]" style="height: 52px;">
          <div
            v-for="i in 48" :key="i"
            :style="{
              width: '3px', height: '44px', borderRadius: '99px', transformOrigin: 'center',
              background: waveColor(i, 48),
              animation: `wave-bar ${waveDuration(i)} ease-in-out infinite`,
              animationDelay: waveDelay(i),
            }"
          />
        </div>
        <span class="text-xs text-tum-blue-mid font-medium">
          {{ 'Generating tests…' }}
        </span>
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="rounded-2xl px-4 py-3 text-sm text-red-500 max-w-xl"
        style="background: rgba(254,202,202,0.45); border: 1px solid rgba(252,165,165,0.5);"
      >
        <span class="font-semibold">Error:</span> {{ error }}
      </div>

    </div>

    <!-- ── Input area ── -->
    <div
      class="flex-shrink-0 p-4"
      style="background: rgba(255,255,255,0.5); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-top: 1px solid rgba(255,255,255,0.75);"
    >
     

      <!-- File indicator -->
      <div v-if="filename" class="flex items-center gap-2 mb-2 text-xs text-tum-blue-mid">
        <span>📄</span>
        <span class="font-mono">{{ filename }}</span>
        <button @click="filename = undefined" class="text-tum-blue-light hover:text-tum-blue ml-1 transition-colors">✕</button>
      </div>

      <div class="flex flex-col gap-3">
        <!-- Textarea -->
        <textarea
          v-model="code"
          @keydown="handleKeydown"
          rows="7"
          spellcheck="false"
          placeholder="Paste your Python function here…"
          class="w-full rounded-2xl px-4 py-3 text-sm font-mono text-tum-blue-dark placeholder:text-tum-blue-light
                 outline-none resize-none leading-relaxed"
          style="background: rgba(255,255,255,0.7); border: 1.5px solid rgba(0,101,189,0.2); box-shadow: inset 0 1px 0 rgba(255,255,255,0.9);"
        />

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <input ref="fileInput" type="file" accept=".py" class="hidden" @change="handleFileSelect" />
            <button
              @click="triggerFileInput"
              class="flex items-center gap-1.5 text-xs text-tum-blue font-medium rounded-full px-4 py-2 transition-opacity hover:opacity-70"
              :style="glass"
            >
              <span>📎</span>
              <span>Upload .py</span>
            </button>
            <span class="text-xs text-tum-blue-light hidden sm:inline">or paste · Ctrl+Enter</span>
          </div>

          <button
            @click="handleGenerate"
            :disabled="!code.trim() || !model || loading"
            class="rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-opacity
                   disabled:opacity-40 disabled:cursor-not-allowed"
            :style="glassPrimary"
          >
            {{ loading ? 'Generating…' : 'Generate Tests' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
