<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

// 1. Terapkan Layout dan Middleware
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});

const authStore = useAuthStore();
const config = useRuntimeConfig();
const router = useRouter();

// === 2. Fetch data staff (Sama seperti sebelumnya) ===
const { data: staffList, pending: staffPending, error: staffFetchError } = useFetch<any[]>(() => `${config.public.apiHost}/api/staff`, {
  lazy: true,
  headers: { 'Authorization': `Bearer ${authStore.token}` }
});


const pemilikTenantList = computed(() => {
  return staffList.value?.filter(staff => staff.role.nama == 'Pemilik Tenant') || []; 
});

// === 3. State untuk form (Sekarang jadi Objek) ===
const form = reactive({
  nama: '',
  staff_id: null as number | null,
  status: 'Aman/Halal',
  is_active: true,
  gambar_url: null as File | null // <-- [BARU] untuk menampung file
});

// === 4. State untuk submit (Sama) ===
const submitPending = ref(false);
const submitError = ref<string | null>(null);

// === 5. [BARU] Fungsi untuk menangani upload file ===
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    form.gambar_url = target.files[0];
  }
}

// === 6. [DIPERBARUI] Fungsi Submit ===
async function handleSubmit() {
  submitPending.value = true;
  submitError.value = null;

  // [PENTING] Kita harus menggunakan FormData untuk mengirim file
  const formData = new FormData();
  formData.append('nama', form.nama);
  if (form.staff_id) {
    formData.append('staff_id', String(form.staff_id));
  }
  formData.append('status', form.status);
  formData.append('is_active', form.is_active ? '1' : '0'); // Kirim 1 atau 0
  if (form.gambar_url) {
    formData.append('gambar_url', form.gambar_url); // Kirim file
  }

  try {
    await $fetch(`${config.public.apiHost}/api/tenants`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json'
        // Kita TIDAK perlu set 'Content-Type', browser akan otomatis
        // mengaturnya ke 'multipart/form-data' saat mengirim FormData
      },
      body: formData // Kirim FormData, bukan objek JSON
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
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Tambah Tenant Baru</h1>
      <NuxtLink to="/admin/tenants" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left"></i> Kembali ke Daftar
      </NuxtLink>
    </div>

    <div class="card">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          
          <div class="mb-3">
            <label for="nama" class="form-label">Nama Tenant</label>
            <input type="text" v-model="form.nama" class="form-control" id="nama" required>
          </div>

          <div class="mb-3">
            <label for="staff" class="form-label">Pemilik Tenant (Staff)</label>
            <div v-if="staffPending">...</div>
            <div v-else-if="staffFetchError">Gagal memuat staff.</div>
            <select v-else v-model="form.staff_id" class="form-select" id="staff" required>
              <option :value="null" disabled>-- Pilih seorang staff --</option>
              <option v-for="staff in pemilikTenantList" :key="staff.id" :value="staff.id">
                {{ staff.nama }} (Username: {{ staff.username }})
              </option>
            </select>
          </div>
          
          <div class="mb-3">
            <label for="gambar" class="form-label">Gambar Tenant</label>
            <input class="form-control" type="file" id="gambar" @change="handleFileUpload">
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
            <label class="form-check-label" for="is_active">Aktifkan Tenant saat dibuat</label>
          </div>

          <hr>
          <div v-if="submitError" class="alert alert-danger">
            <strong>Gagal menyimpan!</strong><br> {{ submitError }}
          </div>
          <button type="submit" class="btn btn-primary" :disabled="submitPending">
            {{ submitPending ? 'Menyimpan...' : 'Simpan Tenant' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>