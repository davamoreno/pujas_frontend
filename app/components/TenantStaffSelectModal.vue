<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

// 1. Tentukan event yang akan dikirim ke parent
const emit = defineEmits(['staff-selected']);

// 2. Siapkan state
const authStore = useAuthStore();
const config = useRuntimeConfig();

// 3. State khusus untuk modal ini
const page = ref(1);
const search = ref('');
const searchInput = ref('');
const sortBy = ref('id');
const sortDir = ref('asc');

// Interface
interface Staff {
    id: number;
    nama: string;
    username: string;
}
interface PaginatedResponse<T> {
    data: T[];
    links: any;
    meta: any;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

// 4. Fetch data (hanya untuk modal ini)
const { data: staffData, pending, error } = useFetch<PaginatedResponse<Staff>>(() => {
    const params = new URLSearchParams();
    params.append('available_for_tenant', 'true'); 
    params.append('page', page.value.toString());
    if (search.value) {
      params.append('search', search.value);
    }
    params.append('sort_by', sortBy.value);
    params.append('sort_dir', sortDir.value);
    return `${config.public.apiHost}/api/staff?${params.toString()}`;
  }, {
    lazy: true,
    watch: [page, search, sortBy, sortDir],
    onRequest({ options }) {
      options.headers = new Headers(options.headers);
      options.headers.set('Authorization', `Bearer ${authStore.token}`);
    }
});

const staffList = computed(() => staffData.value?.data || []);

// 5. Fungsi helper modal
function applySearch() {
  page.value = 1;
  search.value = searchInput.value;
}

function changePageByUrl(url: string | null) {
  if (!url) return;
  const pageQuery = new URL(url).searchParams.get('page');
  if (pageQuery) page.value = Number(pageQuery);
}

// 6. Fungsi EMIT (mengirim data ke parent)
function selectStaff(staff: Staff) {
  emit('staff-selected', staff);
}
</script>

<template>
  <div class="modal fade" id="staffPilihModal" tabindex="-1" aria-labelledby="staffPilihModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="staffPilihModalLabel">Pilih Pemilik Tenant</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          
          <div class="input-group mb-3">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Cari nama atau username staff..." 
              v-model="searchInput"
              @keyup.enter="applySearch"
            >
            <button class="btn btn-outline-secondary" type="button" @click="applySearch">
              <i class="bi bi-search"></i>
            </button>
          </div>

          <div v-if="pending" class="text-center p-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else-if="error" class="alert alert-danger">Gagal memuat data staff.</div>
          <div v-else-if="staffList.length > 0">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Username</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="staff in staffList" :key="staff.id">
                    <td>{{ staff.nama }}</td>
                    <td>{{ staff.username }}</td>
                    <td>
                      <button 
                        class="btn btn-sm btn-primary" 
                        data-bs-dismiss="modal" 
                        @click="selectStaff(staff)"
                      >
                        Pilih
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <nav v-if="staffData && staffData.total > staffData.per_page" class="d-flex justify-content-center mt-3">
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: !staffData.prev_page_url }">
                  <a class="page-link" href="#" @click.prevent="changePageByUrl(staffData.prev_page_url)">Prev</a>
                </li>
                <li class="page-item disabled">
                  <span class="page-link">
                    Halaman {{ staffData.current_page }} dari {{ staffData.last_page }}
                  </span>
                </li>
                <li class="page-item" :class="{ disabled: !staffData.next_page_url }">
                  <a class="page-link" href="#" @click.prevent="changePageByUrl(staffData.next_page_url)">Next</a>
                </li>
              </ul>
            </nav>
          </div>
          <div v-else class="alert alert-info">
            Tidak ada pemilik tenant yang tersedia atau cocok dengan pencarian.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table { 
    vertical-align: middle; 
}
</style>