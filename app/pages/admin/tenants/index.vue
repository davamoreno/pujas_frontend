<script setup lang="ts">
import { useToast } from 'vue-toastification';
import { useTenant } from '~/composables/useTenant';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const authStore = useAuthStore();
const config = useRuntimeConfig();
const toast = useToast();

const searchInput = ref('');
const isToggling = ref<number | null>(null);

// === USE TENANT ===
const { tenants, tenantList, page, search, sortBy, sortDir, pending, error, refresh } = useTenant();

// Actions
function applySearch() {
  search.value = searchInput.value;
  page.value = 1;
}

// --- FUNGSI PAGINATION ---
function changePage(url: string | null) {
  if (!url) return;
  try {
    const urlObj = new URL(url);
    const pageParam = urlObj.searchParams.get('page');
    if (pageParam) page.value = parseInt(pageParam);
  } catch (e) { console.error(e); }
}

// ACTION: Toggle Status Akun
async function toggleTenantStatus(tenant: any) {
  isToggling.value = tenant.id;
  try {
    const { error } = await useFetch(`${config.public.apiHost}/api/tenants/${tenant.id}/toggle-active`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });

    if (error.value) throw error.value;

    toast.success(`Status Tenant ${tenant.nama} berhasil diubah.`);
    refresh(); 
  } catch (err: any) {
    toast.error("Gagal mengubah status tenant.");
  } finally {
    isToggling.value = null;
  }
}

// HELPER: Badge Status
function getOperasionalBadge(status: string) {
    const s = status.toLowerCase();
    if (s === 'buka') return { class: 'bg-success', label: 'BUKA' };
    if (s === 'tutup') return { class: 'bg-danger', label: 'TUTUP' };
    if (s === 'tutup_permanen') return { class: 'bg-dark', label: 'TUTUP PERMANEN' };
    return { class: 'bg-warning text-dark', label: 'TUTUP SEMENTARA' }; 
}
</script>

<template>
  <div class="container-fluid px-0">
    
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h1 class="h3 fw-bold text-dark mb-1">Kelola Tenant</h1>
        <p class="text-muted mb-0">Pantau status operasional dan kelola kontrak tenant.</p>
      </div>
      <NuxtLink to="/admin/tenants/create" class="btn btn-primary shadow-sm">
        <i class="bi bi-shop-window me-1"></i> Tambah Tenant Baru
      </NuxtLink>
    </div>

    <div class="card border-0 shadow-sm mb-4 rounded-3">
        <div class="card-body p-3">
            <div class="row g-3">
                <div class="col-12 col-md-4">
                    <select v-model="sortBy" class="form-select bg-light border-0 w-100">
                        <option value="id">Urutkan ID</option>
                        <option value="nama">Urutkan Nama</option>
                        <option value="created_at">Tenant Terbaru</option>
                    </select>
                </div>
                <div class="col-12 col-md-8">
                    <div class="input-group">
                        <span class="input-group-text bg-light border-0"><i class="bi bi-search"></i></span>
                        <input type="text" class="form-control bg-light border-0" placeholder="Cari tenant..." v-model="searchInput" @keyup.enter="applySearch">
                        <button class="btn btn-primary" @click="applySearch">Cari</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="pending" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="tenantList && tenantList.length > 0">
      
      <div class="d-none d-md-block"> 
        <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                  <thead class="bg-light">
                      <tr>
                          <th class="ps-4 py-3 text-secondary small fw-bold">PROFIL TENANT</th>
                          <th class="py-3 text-secondary small fw-bold">PEMILIK</th>
                          <th class="py-3 text-center text-secondary small fw-bold">OPERASIONAL</th>
                          <th class="py-3 text-center text-secondary small fw-bold">STATUS AKUN</th>
                          <th class="pe-4 py-3 text-end text-secondary small fw-bold">AKSI</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="tenant in tenantList" :key="'desktop-'+tenant.id">
                          <td class="ps-4">
                              <div class="d-flex align-items-center">
                                  <img :src="tenant.gambar_url || 'https://placehold.co/100'" 
                                       class="rounded-3 me-3 border shadow-sm" 
                                       style="width: 48px; height: 48px; object-fit: cover;">
                                  <div>
                                      <h6 class="mb-0 fw-bold text-dark">{{ tenant.nama }}</h6>
                                      <small class="text-muted" v-if="!tenant.is_active"><i class="bi bi-lock-fill"></i> Akun Non-Aktif</small>
                                  </div>
                              </div>
                          </td>

                          <td>
                              <div class="d-flex align-items-center">
                                  <div class="bg-light rounded-circle p-1 me-2 text-primary bg-opacity-10">
                                      <i class="bi bi-person-fill"></i>
                                  </div>
                                  <span class="fw-medium text-secondary">{{ tenant.staff?.nama || '-' }}</span>
                              </div>
                          </td>

                          <td class="text-center">
                              <span class="badge rounded-pill fw-normal px-3" :class="getOperasionalBadge(tenant.status_operasional).class">
                                  {{ getOperasionalBadge(tenant.status_operasional).label }}
                              </span>
                          </td>

                          <td class="text-center">
                              <span class="badge rounded-pill" :class="tenant.is_active ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-secondary bg-opacity-10 text-secondary border border-secondary'">
                                  {{ tenant.is_active ? 'AKTIF' : 'NON-AKTIF' }}
                              </span>
                          </td>

                          <td class="pe-4 text-end">
                              <div class="btn-group">
                                  <NuxtLink :to="`/admin/menu-items?tenant_id=${tenant.id}`" 
                                            class="btn btn-sm btn-light border" title="Lihat Menu">
                                      <i class="bi bi-list-ul"></i>
                                  </NuxtLink>
                                  <NuxtLink :to="`/admin/tenants/${tenant.id}/edit`" 
                                            class="btn btn-sm btn-light border" title="Edit Info">
                                      <i class="bi bi-pencil-square"></i>
                                  </NuxtLink>
                                  <button 
                                      class="btn btn-sm border"
                                      :class="tenant.is_active ? 'btn-outline-danger' : 'btn-outline-success'"
                                      :disabled="isToggling === tenant.id"
                                      @click="toggleTenantStatus(tenant)"
                                      :title="tenant.is_active ? 'Non-aktifkan Tenant' : 'Aktifkan Tenant'"
                                  >
                                      <span v-if="isToggling === tenant.id" class="spinner-border spinner-border-sm"></span>
                                      <i v-else :class="tenant.is_active ? 'bi bi-power' : 'bi bi-arrow-counterclockwise'"></i>
                                  </button>
                              </div>
                          </td>
                      </tr>
                  </tbody>
              </table>
          </div>
          
          <div class="card-footer bg-white border-top-0 py-3 d-flex justify-content-between align-items-center"
               v-if="tenants.total > tenants.per_page">
               <small class="text-muted">
                 Hal {{ tenants.current_page }} dari {{ tenants.last_page }} (Total {{ tenants.total }} data)
               </small>
               <div class="btn-group">
                 <button class="btn btn-sm btn-outline-secondary" 
                         :disabled="!tenants.prev_page_url" 
                         @click="changePage(tenants.prev_page_url)">
                    <i class="bi bi-chevron-left"></i> Prev
                 </button>
                 <button class="btn btn-sm btn-outline-secondary" 
                         :disabled="!tenants.next_page_url" 
                         @click="changePage(tenants.next_page_url)">
                    Next <i class="bi bi-chevron-right"></i>
                 </button>
               </div>
          </div>
        </div>
      </div>

      <div class="d-block d-md-none">
          <div class="row g-3">
            <div class="col-12" v-for="tenant in tenantList" :key="'mobile-'+tenant.id">
              <div class="card border-0 shadow-sm rounded-3">
                  <div class="card-body p-3">
                      <div class="d-flex align-items-center justify-content-between mb-3">
                          <div class="d-flex align-items-center gap-3">
                              <img :src="tenant.gambar_url || 'https://placehold.co/100'" class="rounded-3 me-1 border" style="width: 50px; height: 50px; object-fit: cover;">
                              <div>
                                  <h6 class="fw-bold mb-0 text-dark lh-sm">{{ tenant.nama }}</h6>
                                  <div class="d-flex align-items-center gap-2 mt-1">
                                      <span class="badge" :class="getOperasionalBadge(tenant.status_operasional).class" style="font-size: 0.65rem;">
                                          {{ getOperasionalBadge(tenant.status_operasional).label }}
                                      </span>
                                  </div>
                              </div>
                          </div>
                          <span class="badge rounded-pill" style="font-size: 0.7rem;" :class="tenant.is_active ? 'bg-success' : 'bg-secondary'">
                              {{ tenant.is_active ? 'Aktif' : 'Off' }}
                          </span>
                      </div>

                      <div class="bg-light rounded p-2 mb-3 d-flex align-items-center gap-2">
                          <i class="bi bi-person-fill text-muted"></i>
                          <span class="small text-muted">Pemilik: <strong>{{ tenant.staff?.nama || '-' }}</strong></span>
                      </div>

                      <div class="row g-2">
                          <div class="col-4">
                             <NuxtLink :to="`/admin/menu-items?tenant_id=${tenant.id}`" class="btn btn-sm btn-light border w-100 py-2">
                                Menu
                             </NuxtLink>
                          </div>
                          <div class="col-4">
                             <NuxtLink :to="`/admin/tenants/${tenant.id}/edit`" class="btn btn-sm btn-light border w-100 py-2">
                                Edit
                             </NuxtLink>
                          </div>
                          <div class="col-4">
                             <button class="btn btn-sm w-100 py-2"
                                      :class="tenant.is_active ? 'btn-outline-danger' : 'btn-outline-success'"
                                      @click="toggleTenantStatus(tenant)"
                                      :disabled="isToggling === tenant.id">
                                  <span v-if="isToggling === tenant.id" class="spinner-border spinner-border-sm" style="width: 0.8rem; height: 0.8rem;"></span>
                                  <span v-else>{{ tenant.is_active ? 'Matikan' : 'Hidupkan' }}</span>
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-center mt-4 pb-4 gap-2" v-if="tenants.total > tenants.per_page">
             <button class="btn btn-light shadow-sm px-4" 
                     :disabled="!tenants.prev_page_url" 
                     @click="changePage(tenants.prev_page_url)">
                Previous
             </button>
             <button class="btn btn-light shadow-sm px-4" 
                     :disabled="!tenants.next_page_url" 
                     @click="changePage(tenants.next_page_url)">
                Next
             </button>
          </div>
      </div>

    </div>

    <div v-else class="text-center py-5 bg-white rounded-3 shadow-sm mt-3">
      <i class="bi bi-shop-window fs-1 text-muted opacity-50 mb-3 d-block"></i>
      <h6 class="text-muted">Tidak ada tenant ditemukan.</h6>
    </div>

  </div>
</template>

<style scoped>
.btn { transition: all 0.2s; }
</style>