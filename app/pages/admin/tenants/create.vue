<script setup lang="ts">
import { useToast } from 'vue-toastification';

// 1. Terapkan Layout dan Middleware
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});

const authStore = useAuthStore();
const config = useRuntimeConfig();
const router = useRouter();
const toast = useToast();

// Interface
interface Staff {
  id: number;
  nama: string;
  username: string;
}

// === 3. State untuk form (Jauh lebih simpel) ===
const form = reactive({
  nama: '',
  staff_id: null as number | null,
  status: 'Aman/Halal',
  is_active: true,
  gambar_url: null as File | null
});
const selectedStaffName = ref('Belum dipilih');

// === 4. State untuk submit (Sama) ===
const submitPending = ref(false);
const submitError = ref<string | null>(null);

// === 5. [BARU] Fungsi untuk MENERIMA event dari modal ===
function onStaffSelected(staff: Staff) {
  form.staff_id = staff.id;
  selectedStaffName.value = `${staff.nama} (${staff.username})`;
}

// === 6. Fungsi file upload (Sama) ===
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    form.gambar_url = target.files[0];
  }
}

// === 7. Fungsi Submit (Sama) ===
async function handleSubmit() {
  submitPending.value = true;
  submitError.value = null;

  const formData = new FormData();
  formData.append('nama', form.nama);
  if (form.staff_id) {
    formData.append('staff_id', String(form.staff_id));
  } else {
    submitError.value = "Pemilik tenant wajib dipilih.";
    submitPending.value = false;
    return;
  }
  formData.append('status', form.status);
  formData.append('is_active', form.is_active ? '1' : '0');
  if (form.gambar_url) {
    formData.append('gambar_url', form.gambar_url);
  }

  try {
    await $fetch(`${config.public.apiHost}/api/tenants`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: formData
    });
    toast.success(`Tenant ${form.nama} berhasil ditambahkan!`);
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
        <i class="bi bi-arrow-left"></i> Kembali
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
            <label class="form-check-label" for="is_active">Aktifkan Tenant</label>
          </div>

          <hr>
          <div v-if="submitError" class="alert alert-danger">{{ submitError }}</div>
          <button type="submit" class="btn btn-primary" :disabled="submitPending">
            {{ submitPending ? 'Menyimpan...' : 'Simpan Tenant' }}
          </button>
        </form>
      </div>
    </div>

    <TenantStaffSelectModal @staff-selected="onStaffSelected" />

  </div>
</template>

<style scoped>
</style>