<template>
  <div class="card mb-4">
    <div class="card-body">
      <div class="row g-3 align-items-center">
        <div class="col-md-5">
          <div class="row">
            <div class="col-auto">
              <label for="sort_by" class="col-form-label">Urutkan:</label>
            </div>
            <div class="col">
              <select v-model="modelSortBy" class="form-select">
                <option value="nama">Nama</option>
                <option value="id">ID</option>
                <option value="created_at">Terakhir Dibuat</option>
              </select>
            </div>
            <div class="col">
              <select v-model="modelSortDir" class="form-select">
                <option value="asc">Ascending (A-Z)</option>
                <option value="desc">Descending (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="col-md-7">
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              :placeholder="placeholder || 'Cari...'"
              v-model="localSearch"
              @keyup.enter="apply"
            />
            <button class="btn btn-outline-secondary" type="button" @click="apply">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { defineEmits, defineProps } from 'vue';

const props = defineProps({
  search: { type: String, required: true },
  sortBy: { type: String, required: true },
  sortDir: { type: String, required: true },
  placeholder: { type: String, required: false }
});
const emit = defineEmits(['update:search', 'update:sortBy', 'update:sortDir', 'searchApplied']);

const localSearch = ref(props.search);
const modelSortBy = ref(props.sortBy);
const modelSortDir = ref(props.sortDir);

watch(() => props.search, v => localSearch.value = v);
watch(() => props.sortBy, v => modelSortBy.value = v);
watch(() => props.sortDir, v => modelSortDir.value = v);

watch(modelSortBy, (v) => emit('update:sortBy', v));
watch(modelSortDir, (v) => emit('update:sortDir', v));

function apply(){
  emit('update:search', localSearch.value);
  emit('searchApplied');
}
</script>

<style scoped>
/* small nicety */
.input-group .form-control { min-width: 220px; }
</style>
