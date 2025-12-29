<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import type { Staff } from '~/types/api/staff';
import type { PaginatedResponse } from '~/types/api/pagination';
import type { Tenant } from '~/types/api/tenant';


const selectedStaffName = ref('');

// 1. Terapkan Layout dan Middleware
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});

const authStore = useAuthStore();
const config = useRuntimeConfig();
const router = useRouter();
const route = useRoute(); // <-- [BARU] Untuk mendapatkan ID dari URL
const tenantId = route.params.id as string;


// === 2. State untuk form (Sama, tapi akan kita isi) ===
const form = ref({
  nama: '',
  staff_id: null as number | null,
  status: 'Aman/Halal',
  is_active: true,
  gambar_url: null as File | null,
  current_gambar_url: null as string | null
});

onMounted(() => {
  // console.log('Editing tenant ID:', tenantId);
});

// === 3. Fetch data staff untuk dropdown (Sama seperti create.vue) ===
const { data: staffList, pending: staffPending, error: staffFetchError } = useFetch<PaginatedResponse<Staff>>(() => `${config.public.apiHost}/api/staff`, {
  headers: { 'Authorization': `Bearer ${authStore.token}` }
});
const pemilikTokoList = computed(() => {
  return staffList.value?.data?.filter(staff => staff?.role?.nama === 'Pemilik Tenant') || [];
});

// === 4. [BARU] Fetch data tenant yang ingin di-edit ===
const { data: tenantData, pending: tenantPending, error: tenantFetchError } = await useFetch<Tenant>(() => `${config.public.apiHost}/api/tenants/${tenantId}`, {
  headers: { 'Authorization': `Bearer ${authStore.token}` },
  // 'watch' akan otomatis mengisi form saat data datang
});

watch(tenantData, (newTenant) => {
  if (newTenant) {
    form.value.nama = newTenant.nama;
    form.value.staff_id = newTenant.staff?.id || null;
    selectedStaffName.value = newTenant.staff ? `${newTenant.staff.nama} (${newTenant.staff.username})` : '';
    form.value.status = newTenant.status;
    form.value.is_active = Boolean(newTenant.is_active) ? true : false;
    form.value.current_gambar_url = newTenant.gambar_url;
  }
}, { immediate: true });

// === 5. State untuk submit (Sama) ===
const submitPending = ref(false);
const submitError = ref<string | null>(null);

// === 6. Fungsi file upload (Sama) ===
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    form.value.gambar_url = target.files[0];
  }
}

async function handleSubmit() {
  submitPending.value = true;
  submitError.value = null;

  const formData = new FormData();
  formData.append('nama', form.value.nama);
  if (form.value.staff_id) {
    formData.append('staff_id', String(form.value.staff_id));
  }
  formData.append('status', form.value.status);
  formData.append('is_active', form.value.is_active ? '1' : '0');
  if (form.value.gambar_url) {
    formData.append('gambar_url', form.value.gambar_url); // Kirim file baru jika ada
  }
  
  // [PENTING] Tambahkan _method: 'PUT' untuk method spoofing
  formData.append('_method', 'PUT');

  try {
    // Kita harus pakai 'POST' karena 'PUT' dengan FormData bermasalah
    await $fetch(`${config.public.apiHost}/api/tenants/${tenantId}`, {
      method: 'POST', // <-- Tetap POST, tapi _method di body akan membuatnya jadi PUT
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json'
      },
      body: formData
    });

    await router.push('/admin/tenants');

  } catch (err: any) {
    console.error(err);
    if (err.statusCode === 422) {
      submitError.value = `Gagal Validasi: ${Object.values(err.data.errors).join(', ')}`;
    } else {
      submitError.value = err.data?.message || 'Terjadi kesalahan server.';
    }
  } finally {
    submitPending.value = false;
  }
}

function onStaffSelected(staff: Staff) {
  form.value.staff_id = staff.id;
  selectedStaffName.value = `${staff.nama} (${staff.username})`;
}
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Edit Tenant: {{ tenantData?.nama || 'Memuat...' }}</h1>
      <NuxtLink to="/admin/tenants" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left"></i> Kembali ke Daftar
      </NuxtLink>
    </div>

    <div v-if="tenantPending" class="text-center p-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Memuat data tenant...</p>
    </div>

    <div v-else-if="tenantFetchError" class="alert alert-danger">
      Gagal memuat data tenant: {{ tenantFetchError.message }}
    </div>

    <div v-else class="card">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          
          <div class="mb-3">
            <label for="nama" class="form-label">Nama Tenant</label>
            <input type="text" v-model="form.nama" class="form-control" id="nama" required>
          </div>

          <div class="mb-3">
            <label for="staff" class="form-label">Pemilik Tenant (Staff)</label>
            <div class="input-group">
              <input type="text" class="form-control" :value="selectedStaffName" readonly>
              <button 
                class="btn btn-outline-secondary" 
                type="button" 
                data-bs-toggle="modal" 
                data-bs-target="#staffPilihModal"
              >
                Pilih
              </button>
            </div>
          </div>
          
          <div class="mb-3">
            <label for="gambar" class="form-label">Ganti Gambar Tenant</label>
            <input class="form-control" type="file" id="gambar" @change="handleFileUpload">
            <div class="form-text">Kosongkan jika tidak ingin mengganti gambar.</div>
            <img v-if="form.current_gambar_url" :src="form.current_gambar_url" alt="Gambar tenant" class="img-thumbnail mt-2" width="150">
          </div>

          <div class="mb-3">
            <label for="status" class="form-label">Status</label> 
            <select v-model="form.status" class="form-select" id="status">
              <option value="Aman/Halal">Aman/Halal</option>
              <option value="Beberapa menu tidak halal">Beberapa menu tidak halal</option>
            </select>
          </div>
          
          <div class="form-check form-switch mb-3">
            <input class="form-check-input" type="checkbox" v-model="form.is_active" id="is_active">
            <label class="form-check-label" for="is_active">Tenant Aktif</label>
          </div>

          <hr>
          <div v-if="submitError" class="alert alert-danger">
            <strong>Gagal update!</strong><br> {{ submitError }}
          </div>
          <button type="submit" class="btn btn-primary" :disabled="submitPending">
            {{ submitPending ? 'Menyimpan...' : 'Update Tenant' }}
          </button>
        </form>
      </div>
    </div>
    <TenantStaffSelectModal @staff-selected="onStaffSelected" />
  </div>
</template>

<style scoped>
.img-thumbnail {
  max-width: 150px;
  height: auto;
}
</style>