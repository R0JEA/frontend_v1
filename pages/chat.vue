<script setup lang="ts">
import type { OutputFormat } from '~/types'

const { messages, loading, error, generate, clearHistory } = useChat()
const { logout } = useAuth()

const config = useRuntimeConfig()
const testModeAvailable = config.public.testModeAvailable as boolean

const testMode = ref(false)
const format = ref<OutputFormat>('pytest')
const MODELS = [
  { value: 'model1', label: 'Model 1' },
  { value: 'model2', label: 'Model 2' },
]

const model = ref(MODELS[0].value)
const code = ref('')
const filename = ref<string | undefined>()
const chatContainer = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

async function handleGenerate() {
  if (!code.value.trim() || loading.value) return
  const currentCode = code.value
  const currentFilename = filename.value
  code.value = ''
  filename.value = undefined
  await generate(currentCode, format.value, model.value, currentFilename, testMode.value)
}

function handleKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    handleGenerate()
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

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
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}, { deep: true })
</script>

<template>
  <div class="flex flex-col h-screen bg-slate-950 text-white">

    <!-- ── Header ── -->
    <header class="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-700/60 flex-shrink-0">
      <div class="flex items-center gap-2.5">
        <span class="text-xl">🐍</span>
        <span class="font-semibold text-sm tracking-tight">PyTest Generator</span>
      </div>

      <div class="flex items-center gap-4">

        <!-- Test Mode toggle — hidden when NUXT_PUBLIC_TEST_MODE_AVAILABLE=false -->
        <button
          v-if="testModeAvailable"
          @click="testMode = !testMode"
          class="flex items-center gap-2 group"
          :title="testMode ? 'Test mode ON — using mock responses' : 'Test mode OFF — click to use mock responses'"
        >
          <span :class="['text-xs font-medium transition-colors', testMode ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200']">
            Test Mode
          </span>
          <!-- Toggle pill -->
          <div :class="['relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
            testMode ? 'bg-amber-500' : 'bg-slate-600 group-hover:bg-slate-500']">
            <span :class="['pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out',
              testMode ? 'translate-x-4' : 'translate-x-0']" />
          </div>
        </button>

        <!-- Model selector -->
        <div class="flex items-center gap-2">
          <label class="text-xs text-slate-400 font-medium">Model:</label>
          <select
            v-model="model"
            :disabled="testMode"
            class="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg px-2.5 py-1.5
                   focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer
                   disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option v-for="m in MODELS" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>

        <!-- Format selector -->
        <div class="flex items-center gap-2">
          <label class="text-xs text-slate-400 font-medium">Format:</label>
          <select
            v-model="format"
            class="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg px-2.5 py-1.5
                   focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="pytest">pytest</option>
            <option value="unittest">unittest</option>
          </select>
        </div>

        <!-- Clear -->
        <button
          v-if="messages.length > 0"
          @click="clearHistory"
          class="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded"
        >
          Clear
        </button>

        <!-- Logout -->
        <button
          @click="logout"
          class="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300
                 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>

    <!-- ── Chat area ── -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto px-4 py-6 space-y-5">

      <!-- Empty state -->
      <div v-if="messages.length === 0 && !loading" class="flex flex-col items-center justify-center h-full text-center py-16">
        <div class="text-6xl mb-4 opacity-80">⚗️</div>
        <h2 class="text-lg font-semibold text-white mb-2">Generate Unit Tests</h2>
        <p class="text-slate-400 text-sm max-w-md leading-relaxed">
          Paste a Python function below or upload a
          <code class="text-blue-400 bg-slate-800 px-1 py-0.5 rounded text-xs">.py</code> file,
          choose <strong class="text-slate-200">pytest</strong> or <strong class="text-slate-200">unittest</strong>,
          and click <strong class="text-slate-200">Generate Tests</strong>.
        </p>
        <p v-if="testModeAvailable" class="mt-4 text-xs text-slate-600">
          Use the <span class="text-amber-500/70">Test Mode</span> toggle to get mock responses without a backend.
        </p>
        <p class="text-slate-600 text-xs mt-2">Tip: Ctrl + Enter to submit</p>
      </div>

      <!-- Messages -->
      <ChatMessage
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
      />

      <!-- Loading indicator -->
      <div v-if="loading" class="flex items-center gap-3 pl-1">
        <div class="flex gap-1.5">
          <span class="w-2 h-2 rounded-full animate-bounce"
            :class="testMode ? 'bg-amber-500' : 'bg-blue-500'"
            style="animation-delay: 0ms" />
          <span class="w-2 h-2 rounded-full animate-bounce"
            :class="testMode ? 'bg-amber-500' : 'bg-blue-500'"
            style="animation-delay: 150ms" />
          <span class="w-2 h-2 rounded-full animate-bounce"
            :class="testMode ? 'bg-amber-500' : 'bg-blue-500'"
            style="animation-delay: 300ms" />
        </div>
        <span class="text-sm text-slate-400">
          {{ testMode ? 'Generating mock tests…' : 'Generating tests…' }}
        </span>
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="bg-red-950/50 border border-red-700/50 rounded-xl px-4 py-3 text-red-300 text-sm max-w-2xl"
      >
        <span class="font-semibold">Error:</span> {{ error }}
      </div>

    </div>

    <!-- ── Input area ── -->
    <div class="flex-shrink-0 border-t border-slate-700/60 bg-slate-900 p-4"
         :class="testMode ? 'border-t-amber-500/30' : ''">

      <!-- Test mode banner -->
      <div v-if="testMode" class="flex items-center gap-2 mb-3 text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
        <span>⚡</span>
        <span>Test mode — response will be a random pre-written sample, not real AI output.</span>
      </div>

      <!-- File loaded indicator -->
      <div v-if="filename" class="flex items-center gap-2 mb-2 text-xs text-slate-400">
        <span>📄</span>
        <span class="font-mono">{{ filename }}</span>
        <button @click="filename = undefined" class="text-slate-600 hover:text-slate-300 ml-0.5 transition-colors">✕</button>
      </div>

      <div class="flex flex-col gap-3">
        <textarea
          v-model="code"
          @keydown="handleKeydown"
          rows="7"
          spellcheck="false"
          class="w-full bg-slate-800 border rounded-xl px-4 py-3 text-sm font-mono text-slate-100
                 placeholder-slate-600 focus:outline-none focus:ring-2 focus:border-transparent resize-none leading-relaxed"
          :class="testMode
            ? 'border-amber-500/30 focus:ring-amber-500/50'
            : 'border-slate-700 focus:ring-blue-500'"
          placeholder="Paste your Python function here…"
        />

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <input ref="fileInput" type="file" accept=".py" class="hidden" @change="handleFileSelect" />
            <button
              @click="triggerFileInput"
              class="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700
                     text-slate-300 hover:text-white text-xs px-3 py-2 rounded-lg transition-colors"
            >
              <span>📎</span>
              <span>Upload .py file</span>
            </button>
            <span class="text-xs text-slate-600 hidden sm:inline">or paste code · Ctrl+Enter to submit</span>
          </div>

          <button
            @click="handleGenerate"
            :disabled="!code.trim() || !model || loading"
            class="text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors flex items-center gap-2
                   disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed"
            :class="testMode
              ? 'bg-amber-600 hover:bg-amber-500'
              : 'bg-blue-600 hover:bg-blue-500'"
          >
            <span v-if="loading">Generating…</span>
            <span v-else>Generate Tests</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
