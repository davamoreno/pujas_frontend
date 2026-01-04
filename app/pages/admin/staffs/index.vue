<script setup lang="ts">
import type { Staff } from '~/types/api/staff';
import type { PaginatedResponse } from '~/types/api/pagination';
import { useToast } from "vue-toastification"; // Pastikan sudah install toast

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});

const authStore = useAuthStore();
const config = useRuntimeConfig();
const toast = useToast();

// State
const page = ref(1);
const search = ref('');
const searchInput = ref('');
const sortBy = ref('id');
const sortDir = ref('asc');
const isToggling = ref<number | null>(null); // Untuk loading state per item

// Fetch Data
const { data: staffList, pending, refresh, error } = await useFetch<PaginatedResponse<Staff>>(
  () => {
    const params = new URLSearchParams();
    params.append('page', page.value.toString());
    if (search.value) params.append('search', search.value);
    params.append('sort_by', sortBy.value);
    params.append('sort_dir', sortDir.value);
    return `${config.public.apiHost}/api/staff?${params.toString()}`;
  }, 
  {
    lazy: true,
    onRequest({ options }) {
      if (authStore.token) {
        options.headers = new Headers(options.headers);
        options.headers.set('Authorization', `Bearer ${authStore.token}`);
        options.headers.set('Accept', 'application/json');
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) authStore.logout();
    }
  }
);
  
const staffData = computed(() => staffList.value?.data || []);
const currentUser = computed(() => authStore.user);

// Actions
function applySearch() {
  search.value = searchInput.value;
  page.value = 1;
}

function changePageByUrl(url: string | null) {
  if (!url) return;
  try {
    const urlObj = new URL(url);
    const pageParam = urlObj.searchParams.get('page');
    if (pageParam) page.value = parseInt(pageParam);
  } catch (e) { console.error(e); }
}

// Fungsi Baru: Toggle Status
async function toggleStaffStatus(staff: Staff) {
  if (staff.id === currentUser.value?.id) {
    toast.error("Anda tidak bisa menonaktifkan akun sendiri.");
    return;
  }

  isToggling.value = staff.id; // Set loading state

  try {
    const { error } = await useFetch(`${config.public.apiHost}/api/staff/${staff.id}/toggle-status`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });

    if (error.value) throw error.value;

    toast.success(`Status ${staff.nama} berhasil diubah.`);
    refresh(); // Refresh data tabel
  } catch (err: any) {
    toast.error(err.data?.message || "Gagal mengubah status staff.");
  } finally {
    isToggling.value = null;
  }
}
</script>

<template>
  <div class="container-fluid px-0">
    
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h1 class="h3 fw-bold text-dark mb-1">Manajemen Staff</h1>
        <p class="text-muted mb-0">Kelola akun admin dan pemilik tenant.</p>
      </div>
      <NuxtLink 
        v-if="currentUser?.role === 'Admin'" 
        to="/admin/staffs/create" 
        class="btn btn-primary shadow-sm"
      >
        <i class="bi bi-plus-lg me-1"></i> Tambah Staff Baru
      </NuxtLink>
    </div>

    <div class="card border-0 shadow-sm mb-4 rounded-3">
      <div class="card-body p-3">
        <div class="row g-3">
          <div class="col-md-5 d-flex gap-2">
             <select v-model="sortBy" class="form-select bg-light border-0">
                <option value="id">ID</option>
                <option value="nama">Nama</option>
                <option value="created_at">Tanggal Dibuat</option>
             </select>
             <select v-model="sortDir" class="form-select bg-light border-0">
                <option value="asc">A - Z (Naik)</option>
                <option value="desc">Z - A (Turun)</option>
             </select>
          </div>
          
          <div class="col-md-7">
            <div class="input-group">
              <span class="input-group-text bg-light border-0 ps-3">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input 
                type="text" 
                class="form-control bg-light border-0" 
                placeholder="Cari nama staff atau username..." 
                v-model="searchInput"
                @keyup.enter="applySearch"
              >
              <button class="btn btn-primary px-4" type="button" @click="applySearch">
                Cari
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="pending" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-2 small">Memuat data staff...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger border-0 shadow-sm d-flex align-items-center">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <div>Gagal memuat data: {{ error.message }}</div>
    </div>

    <div v-else-if="staffList">
      
      <div class="card border-0 shadow-sm rounded-3 d-none d-md-block overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4 py-3 text-secondary text-uppercase small font-weight-bold">Info Staff</th>
                <th class="py-3 text-secondary text-uppercase small font-weight-bold">Role</th>
                <th class="py-3 text-center text-secondary text-uppercase small font-weight-bold">Status</th>
                <th class="pe-4 py-3 text-end text-secondary text-uppercase small font-weight-bold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="staff in staffData" :key="staff.id">
                <td class="ps-4">
                  <div class="d-flex align-items-center">
                    <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold me-3" style="width: 40px; height: 40px;">
                      {{ staff.nama.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <h6 class="mb-0 fw-bold text-dark">{{ staff.nama }}</h6>
                      <small class="text-muted">@{{ staff.username }}</small>
                    </div>
                  </div>
                </td>

                <td>
                  <span class="badge rounded-pill fw-normal px-3 py-2" 
                    :class="staff?.role?.nama === 'Admin' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-info bg-opacity-10 text-info'">
                    {{ staff?.role?.nama }}
                  </span>
                </td>

                <td class="text-center">
                   <span class="badge rounded-pill fw-normal" 
                         :class="staff.is_active ? 'bg-success' : 'bg-secondary'">
                      {{ staff.is_active ? 'Aktif' : 'Non-Aktif' }}
                   </span>
                </td>

                <td class="pe-4 text-end">
                  <div class="btn-group">
                    <NuxtLink :to="`/admin/staffs/${staff.id}/edit`" class="btn btn-sm btn-light border text-muted" title="Edit">
                      <i class="bi bi-pencil-fill"></i>
                    </NuxtLink>
                    
                    <button 
                      class="btn btn-sm border"
                      :class="staff.is_active ? 'btn-outline-danger' : 'btn-outline-success'"
                      @click="toggleStaffStatus(staff)"
                      :disabled="isToggling === staff.id || staff.id === currentUser?.id"
                      :title="staff.is_active ? 'Non-aktifkan' : 'Aktifkan'"
                    >
                      <span v-if="isToggling === staff.id" class="spinner-border spinner-border-sm" role="status"></span>
                      <i v-else :class="staff.is_active ? 'bi bi-person-x-fill' : 'bi bi-person-check-fill'"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-footer bg-white border-top-0 py-3 d-flex justify-content-between align-items-center">
           <small class="text-muted">
             Hal {{ staffList.current_page }} dari {{ staffList.last_page }} (Total {{ staffList.total }})
           </small>
           <div class="btn-group">
             <button class="btn btn-sm btn-outline-light text-dark border" :disabled="!staffList.prev_page_url" @click="changePageByUrl(staffList.prev_page_url)">
                <i class="bi bi-chevron-left"></i>
             </button>
             <button class="btn btn-sm btn-outline-light text-dark border" :disabled="!staffList.next_page_url" @click="changePageByUrl(staffList.next_page_url)">
                <i class="bi bi-chevron-right"></i>
             </button>
           </div>
        </div>
      </div>
      
      <div class="d-block d-md-none">
        <div v-for="staff in staffData" :key="staff.id" class="card border-0 shadow-sm mb-3 rounded-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
               <div class="d-flex align-items-center">
                  <div class="bg-light rounded-circle p-2 me-2">
                     <i class="bi bi-person-fill fs-4 text-muted"></i>
                  </div>
                  <div>
                     <h6 class="fw-bold mb-0">{{ staff.nama }}</h6>
                     <small class="text-muted">@{{ staff.username }}</small>
                  </div>
               </div>
               <span class="badge rounded-pill" :class="staff.is_active ? 'bg-success' : 'bg-secondary'">
                  {{ staff.is_active ? 'Aktif' : 'Off' }}
               </span>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-3">
               <span class="badge rounded-pill fw-normal px-2" 
                    :class="staff?.role?.nama === 'Admin' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-info bg-opacity-10 text-info'">
                    {{ staff?.role?.nama }}
               </span>
            </div>

            <div class="d-grid gap-2 d-flex">
              <NuxtLink :to="`/admin/staffs/${staff.id}/edit`" class="btn btn-sm btn-light border flex-grow-1">
                <i class="bi bi-pencil-square me-1"></i> Edit
              </NuxtLink>
              
              <button 
                class="btn btn-sm flex-grow-1"
                :class="staff.is_active ? 'btn-outline-danger' : 'btn-outline-success'"
                @click="toggleStaffStatus(staff)"
                :disabled="isToggling === staff.id || staff.id === currentUser?.id"
              >
                 <span v-if="isToggling === staff.id" class="spinner-border spinner-border-sm" role="status"></span>
                 <span v-else>
                    <i :class="staff.is_active ? 'bi bi-person-x' : 'bi bi-person-check'"></i>
                    {{ staff.is_active ? 'Non-aktifkan' : 'Aktifkan' }}
                 </span>
              </button>
            </div>
          </div>
        </div>
        
        <div class="d-flex justify-content-center mt-3 gap-2">
             <button class="btn btn-light shadow-sm" :disabled="!staffList.prev_page_url" @click="changePageByUrl(staffList.prev_page_url)">Prev</button>
             <button class="btn btn-light shadow-sm" :disabled="!staffList.next_page_url" @click="changePageByUrl(staffList.next_page_url)">Next</button>
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
/* Sedikit styling tambahan untuk badge avatar */
.avatar-placeholder {
  font-size: 1.1rem;
}
/* Transisi halus untuk hover row */
.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}
</style>