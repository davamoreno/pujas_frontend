<script setup lang="ts">
import { useCustomerStore } from '~/stores/customer';

definePageMeta({
  layout: 'customer',
  middleware: 'customer-auth'
});

const config = useRuntimeConfig();
const customerStore = useCustomerStore();

// --- STATE ---
const search = ref("");
const filterStatus = ref("");
const filterOperasional = ref("");

// State untuk Logic Show More
const allTenants = ref<any[]>([]); // Array penampung semua data
const page = ref(1);
const isLoading = ref(false);
const hasMore = ref(true); // Penanda apakah masih ada data di server
const isInitialLoad = ref(true); // Penanda load pertama kali (untuk skeleton)

// --- FETCH FUNCTION ---
async function loadTenants(reset = false) {
  // Cegah double request
  if (isLoading.value && !reset) return;
  
  isLoading.value = true;

  // Jika reset (misal ganti filter), bersihkan data lama
  if (reset) {
    page.value = 1;
    allTenants.value = [];
    hasMore.value = true;
    isInitialLoad.value = true;
  }

  try {
    // Kita pakai $fetch manual (bukan useFetch) agar lebih mudah kontrol append data
    const response = await $fetch<any>(`${config.public.apiHost}/api/public/tenants`, {
      params: {
        page: page.value,
        search: search.value,
        status: filterStatus.value,
        operasional: filterOperasional.value
      }
    });

    const newData = response.data || [];
    const meta = response.meta;

    // 1. Gabungkan data baru ke array lama
    if (newData.length > 0) {
      allTenants.value.push(...newData);
    }

    // 2. Cek apakah ini halaman terakhir
    if (page.value >= meta.last_page) {
      hasMore.value = false;
    } else {
      page.value++; // Siapkan page number untuk request berikutnya
    }

  } catch (err) {
    console.error("Gagal memuat tenants", err);
  } finally {
    isLoading.value = false;
    isInitialLoad.value = false;
  }
}

// --- WATCHERS ---
// Kalau filter berubah, Reset dan Load ulang dari Page 1
// Kita pakai debounce sedikit di search agar tidak spam request
let searchTimeout: any;
watch([search, filterStatus, filterOperasional], ([newSearch, newStatus, newOps], [oldSearch]) => {
  if (newSearch !== oldSearch) {
    // Debounce khusus search text
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadTenants(true);
    }, 500);
  } else {
    // Filter dropdown langsung eksekusi
    loadTenants(true);
  }
});

// Load awal
onMounted(() => {
  loadTenants();
});
</script>

<template>
  <div class="container py-4 pb-5 mb-5">

    <div class="mb-5 fade-in-down">
      <h6 class="text-muted text-uppercase mb-1 small ls-1">Mau makan apa hari ini?</h6>
      <h2 class="fw-bold">Hai, <span class="text-primary">{{ customerStore.nama }}</span> 👋</h2>
    </div>

    <div class="mb-4 position-relative">
      <input 
        v-model="search"
        type="text" 
        class="form-control form-control-lg border-0 shadow-sm ps-5" 
        placeholder="Cari kantin favoritmu..."
      >
      <i class="bi bi-search position-absolute text-muted" style="top: 15px; left: 20px;"></i>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-6">
        <select v-model="filterStatus" class="form-select form-select-lg shadow-sm">
          <option value="">Semua Status Halal</option>
          <option value="Aman/Halal">Aman / Halal</option>
          <option value="Beberapa menu tidak halal">Beberapa Tidak Halal</option>
        </select>
      </div>

      <div class="col-6">
        <select v-model="filterOperasional" class="form-select form-select-lg shadow-sm">
          <option value="">Semua Operasional</option>
          <option value="buka">Buka</option>
          <option value="tutup">Tutup</option>
          <option value="istirahat">Istirahat</option>
          <option value="sibuk">Sibuk</option>
          <option value="tutup-permanent">Tutup Permanent</option>
        </select>
      </div>
    </div>

    <div class="row g-4">

      <template v-if="isInitialLoad && isLoading">
        <div class="col-6 col-md-4 col-lg-3" v-for="n in 8" :key="n">
          <CustomerSkeletonCard />
        </div>
      </template>

      <template v-else-if="!isInitialLoad && allTenants.length === 0">
        <div class="col-12 text-center py-5">
          <img src="https://placehold.co/150/f0f0f0/cccccc?text=Empty" class="mb-3 rounded opacity-50" width="100">
          <p class="text-muted">Tidak ada kantin ditemukan.</p>
        </div>
      </template>

      <template v-else>
        <div 
          class="col-6 col-md-4 col-lg-3" 
          v-for="tenant in allTenants" 
          :key="tenant.id"
        >
          <NuxtLink 
            :to="`/tenants/${tenant.id}`" 
            class="text-decoration-none"
            :class="{ 'disabled-link': tenant.status_operasional !== 'buka' }"
          >
            <div class="card h-100 border-0 shadow-sm hover-card overflow-hidden">

              <div class="position-relative" style="height: 180px; overflow: hidden;">
                <img 
                  :src="tenant.gambar_url || 'https://placehold.co/400x300?text=No+Image'" 
                  class="card-img-top object-fit-cover"
                >
                
                <span 
                  class="badge rounded-pill position-absolute top-0 start-0 m-2 shadow-sm d-flex align-items-center gap-1 px-2 py-1"
                  :class="tenant.status === 'Aman/Halal' ? 'bg-white text-success' : 'bg-white text-warning'"
                  style="font-size: 0.7rem; backdrop-filter: blur(4px); --bs-bg-opacity: 0.95;"
                >
                  <i class="bi" :class="tenant.status === 'Aman/Halal' ? 'bi-patch-check-fill' : 'bi-exclamation-triangle-fill'"></i>
                  {{ tenant.status === 'Aman/Halal' ? 'Halal' : 'Non-Halal' }}
                </span>

                <span 
                  class="badge rounded-pill position-absolute top-0 end-0 m-2 shadow-sm"
                  :class="{
                    'bg-success': tenant.status_operasional === 'buka',
                    'bg-danger': tenant.status_operasional !== 'buka'
                  }"
                  style="font-size: 0.7rem;"
                >
                  {{ tenant.status_operasional.toUpperCase() }}
                </span>
              </div>

              <div class="card-body p-3">
                <h6 class="card-title fw-bold text-dark mb-1 text-truncate">{{ tenant.nama }}</h6>
                <div class="d-flex align-items-center text-muted small">
                  <i class="bi bi-geo-alt-fill text-danger me-1" style="font-size: 0.8rem;"></i> 
                  <span class="text-truncate">Kantin Pujasera</span>
                </div>
              </div>

            </div>
          </NuxtLink>
        </div>
      </template>

    </div>

    <div v-if="hasMore && allTenants.length > 0" class="text-center mt-5">
      <button 
        @click="loadTenants(false)" 
        class="btn btn-outline-primary rounded-pill px-5 py-2 fw-bold shadow-sm"
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
        {{ isLoading ? 'Memuat...' : 'Tampilkan Lebih Banyak' }}
      </button>
    </div>

    <div v-else-if="!hasMore && allTenants.length > 0" class="text-center mt-5 pt-3 border-top">
      <small class="text-muted">
        <i class="bi bi-check-circle-fill text-success me-1"></i> Semua kantin sudah ditampilkan
      </small>
    </div>

  </div>
</template>

<style scoped>
.disabled-link {
  pointer-events: none;
  opacity: 0.6;
  filter: grayscale(0.8);
}

.hover-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in-down {
  animation: fadeInDown 0.6s ease-out;
}

.card-img-top {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}
.hover-card:hover .card-img-top {
  transform: scale(1.05); /* Zoom effect dikit pas hover */
}

.object-fit-cover {
  object-fit: cover;
}
</style>