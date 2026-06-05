<script setup lang="ts">
// Root path redirects to the chat view.
// The global auth middleware will intercept unauthenticated users and send them to /login first.
await navigateTo('/chat', { replace: true })
</script>
