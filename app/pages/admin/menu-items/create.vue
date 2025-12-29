<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useToast } from "vue-toastification";

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

const authStore = useAuthStore();
const config = useRuntimeConfig();
const router = useRouter();
const toast = useToast();

// --- 1. Fetch Data Kategori untuk Dropdown ---
const { data: categories } = await useFetch<any[]>(`${config.public.apiHost}/api/kategori-menu`, {
  lazy: true,
  headers: { 'Authorization': `Bearer ${authStore.token}` }
});

// --- 2. State Form ---
const form = reactive({
  nama: '',
  deskripsi: '',
  harga: '', // String biar bisa kosong dulu
  qty: '',
  kategori_id: null as number | null,
  is_tersedia: true,
  gambar_url: null as File | null
});

const submitPending = ref(false);
const submitError = ref<string | null>(null);
const imagePreview = computed(() => {
  if (form.gambar_url) {
    return URL.createObjectURL(form.gambar_url);
  }
  return null;
});

// --- 3. Handle File Upload ---
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    form.gambar_url = target.files[0];
  }
}

// --- 4. Submit Function ---
async function handleSubmit() {
  submitPending.value = true;
  submitError.value = null;

  // Gunakan FormData karena ada File Upload
  const formData = new FormData();
  formData.append('nama', form.nama);
  formData.append('deskripsi', form.deskripsi || '');
  formData.append('harga', form.harga);
  formData.append('qty', form.qty);
  if (form.kategori_id) formData.append('kategori_id', String(form.kategori_id));
  formData.append('is_tersedia', form.is_tersedia ? '1' : '0');
  if (form.gambar_url) formData.append('gambar_url', form.gambar_url);

  try {
    await $fetch(`${config.public.apiHost}/api/menu-items`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: formData
    });

    toast.success('Menu berhasil ditambahkan!');
    router.push('/admin/menu-items');

  } catch (err: any) {
    console.error(err);
    if (err.statusCode === 422) {
      // Tampilkan error validasi dari Laravel
      submitError.value = Object.values(err.data.errors).flat().join('\n');
    } else {
      submitError.value = err.data?.message || 'Terjadi kesalahan server.';
    }
    toast.error("Gagal menyimpan menu.");
  } finally {
    submitPending.value = false;
  }
}
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Tambah Menu Baru</h1>
      <NuxtLink to="/admin/menu-items" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left"></i> Kembali
      </NuxtLink>
    </div>

    <div class="card shadow-sm border-0">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          
          <div class="row">
            <div class="col-md-4 mb-3 text-center">
               <div class="border rounded p-3 d-flex align-items-center justify-content-center bg-light" style="height: 200px;">
                 <span v-if="!form.gambar_url" class="text-muted">Preview Gambar</span>
                 <img v-else :src="imagePreview" class="img-fluid" style="max-height: 100%;">
               </div>
               <div class="mt-2">
                 <label for="gambar" class="form-label btn btn-sm btn-primary w-100">
                   <i class="bi bi-upload"></i> Pilih Gambar
                 </label>
                 <input class="d-none" type="file" id="gambar" @change="handleFileUpload" accept="image/*">
               </div>
            </div>

            <div class="col-md-8">
              <div class="mb-3">
                <label class="form-label">Nama Menu <span class="text-danger">*</span></label>
                <input type="text" v-model="form.nama" class="form-control" required>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                   <label class="form-label">Kategori <span class="text-danger">*</span></label>
                   <select v-model="form.kategori_id" class="form-select" required>
                     <option :value="null" disabled>Pilih Kategori</option>
                     <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                       {{ cat.nama }}
                     </option>
                   </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Harga (Rp) <span class="text-danger">*</span></label>
                  <input type="number" v-model="form.harga" class="form-control" min="0" required>
                </div>
              </div>

              <div class="row">
                 <div class="col-md-6 mb-3">
                   <label class="form-label">Stok Awal <span class="text-danger">*</span></label>
                   <input type="number" v-model="form.qty" class="form-control" min="0" required>
                 </div>
                 <div class="col-md-6 mb-3">
                   <label class="form-label">Status</label>
                   <div class="form-check form-switch mt-2">
                     <input class="form-check-input" type="checkbox" v-model="form.is_tersedia" id="is_tersedia">
                     <label class="form-check-label" for="is_tersedia">
                       {{ form.is_tersedia ? 'Tersedia' : 'Habis / Tidak Aktif' }}
                     </label>
                   </div>
                 </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Deskripsi</label>
                <textarea v-model="form.deskripsi" class="form-control" rows="3"></textarea>
              </div>
            </div>
          </div>

          <hr>
          
          <div v-if="submitError" class="alert alert-danger">{{ submitError }}</div>
          
          <div class="d-flex justify-content-end gap-2">
            <NuxtLink to="/admin/menu-items" class="btn btn-light">Batal</NuxtLink>
            <button type="submit" class="btn btn-primary" :disabled="submitPending">
              <span v-if="submitPending" class="spinner-border spinner-border-sm me-1"></span>
              Simpan Menu
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>