<template>
  <nav v-if="meta && meta.total > meta.per_page" class="card-footer d-flex justify-content-between align-items-center">
    <div>
      Menampilkan <strong>{{ meta.from }}</strong> - <strong>{{ meta.to }}</strong> dari <strong>{{ meta.total }}</strong> data
    </div>
    <div class="btn-group">
      <button class="btn btn-outline-secondary" :disabled="!meta.prev_page_url" @click="go(meta.prev_page_url)">
        <i class="bi bi-chevron-left"></i> Prev
      </button>
      <button class="btn btn-outline-secondary" :disabled="!meta.next_page_url" @click="go(meta.next_page_url)">
        Next <i class="bi bi-chevron-right"></i>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
const props = defineProps<{
  meta: {
    from: number;
    to: number;
    total: number;
    per_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
  } | null;
}>();

function go(url: string | null) {
  if (!url) return;
  try {
    const u = new URL(url);
    const p = u.searchParams.get('page');
    if (p) {
      // emit event via global custom event? better: use router push or caller will handle by passing page handler
      // We'll use native dispatch event to keep component simple
      window.dispatchEvent(new CustomEvent('tenant:changePage', { detail: Number(p) }));
    }
  } catch (e) {
    console.error(e);
  }
}
</script>

<style scoped>
.card-footer { border-top: 1px solid #e9ecef; }
</style>
