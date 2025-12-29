<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useToast } from "vue-toastification";

definePageMeta({
  layout: 'admin',
  middleware: 'auth' // Atau 'auth'
});

const authStore = useAuthStore();
const config = useRuntimeConfig();
const router = useRouter();
const route = useRoute();
const toast = useToast();

// Ambil ID Menu Item dari URL
const menuItemId = route.params.id as string;

// === 1. State Form ===
const form = reactive({
  nama: '',
  deskripsi: '',
  harga: '',
  qty: '',
  kategori_id: null as number | null,
  is_tersedia: true,
  gambar_url: null as File | null,
  current_image: '' // Untuk preview gambar lama
});

// === 2. Fetch Data Kategori (Untuk Dropdown) ===
const { data: categories } = useFetch<any[]>(`${config.public.apiHost}/api/kategori-menu`, {
  headers: { 'Authorization': `Bearer ${authStore.token}` }
});

// === 3. Fetch Data Menu Item (YANG MAU DI-EDIT) ===
const { data: itemData, pending: itemPending, error: itemError } = await useFetch<any>(
  () => `${config.public.apiHost}/api/menu-items/${menuItemId}`,
  {
    headers: { 'Authorization': `Bearer ${authStore.token}` }
  }
);

 watch(itemData, (res : any) => {
  if (!res) return;

  const newData = res.data ?? res; // kalau respons tidak pakai wrapper

  console.log("Data diterima:", newData);

  form.nama = newData.nama;
  form.deskripsi = newData.deskripsi || '';
  form.harga = newData.harga;
  form.qty = newData.qty;

  form.kategori_id = newData.kategori.id || newData.kategori?.id || null;
  form.is_tersedia = Boolean(newData.is_tersedia);
  form.current_image = newData.gambar_url;
}, { immediate: true });

// === 4. Handle Upload & Submit ===
const submitPending = ref(false);
const submitError = ref<string | null>(null);
const data = computed(() => itemData.value?.data || itemData.value || {});
const previewImageUrl = computed(() => {
   if (form.gambar_url instanceof File) {
    return URL.createObjectURL(form.gambar_url);
  }
  return form.current_image;
});

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    form.gambar_url = target.files[0];
  }
}

async function handleSubmit() {
  submitPending.value = true;
  submitError.value = null;

  const formData = new FormData();
  formData.append('nama', form.nama);
  formData.append('deskripsi', form.deskripsi);
  formData.append('harga', String(form.harga));
  formData.append('qty', String(form.qty));
  if (form.kategori_id) formData.append('kategori_id', String(form.kategori_id));
  formData.append('is_tersedia', form.is_tersedia ? '1' : '0');
  
  if (form.gambar_url) {
    formData.append('gambar_url', form.gambar_url);
  }
  
  // Method Spoofing untuk PUT
  formData.append('_method', 'PUT');

  try {
    await $fetch(`${config.public.apiHost}/api/menu-items/${menuItemId}`, {
      method: 'POST', 
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json'
      },
      body: formData
    });

    toast.success('Menu berhasil diperbarui!');
    await router.push('/admin/menu-items');

  } catch (err: any) {
    console.error(err);
    if (err.statusCode === 422) {
      submitError.value = Object.values(err.data.errors).flat().join('\n');
    } else {
      submitError.value = err.data?.message || 'Gagal update menu.';
    }
    toast.error("Gagal memperbarui menu.");
  } finally {
    submitPending.value = false;
  }
}

console.log(`Current image URL: ${form.current_image}`);
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Edit Menu: {{ data?.nama || 'Memuat...' }}</h1>
      <NuxtLink to="/admin/menu-items" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left"></i> Kembali
      </NuxtLink>
    </div>

    <div v-if="itemPending" class="text-center p-5">
      <div class="spinner-border" role="status"></div>
      <p class="mt-2">Memuat data menu...</p>
    </div>

    <div v-else-if="itemError" class="alert alert-danger">
      Gagal memuat data: {{ itemError.message }}
    </div>

    <div v-else class="card shadow-sm border-0">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          
          <div class="row g-4">
            <div class="col-md-5 mb-3 text-center">
               <div class="image-wrapper">
                 <img v-if="form.gambar_url" :src="previewImageUrl" class="preview-image" >
                 <img v-else-if="form.current_image" :src="previewImageUrl" class="preview-image">
                 <span v-else class="no-image">Tidak ada gambar</span>
               </div>
                 <label for="gambar" class="form-label btn btn-sm btn-primary w-100 mt-3">
                   <i class="bi bi-camera"></i> Ganti Gambar
                 </label>
                 <input class="d-none" type="file" id="gambar" @change="handleFileUpload" accept="image/*">
            </div>

            <div class="col-md-7">
              <div class="mb-3">
                <label class="form-label">Nama Menu</label>
                <input type="text" v-model="form.nama" class="form-control" required>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                   <label class="form-label">Kategori</label>
                   <select v-model="form.kategori_id" class="form-select" required>
                     <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                       {{ cat.nama }}
                     </option>
                   </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Harga (Rp)</label>
                  <input type="number" v-model="form.harga" class="form-control" min="0" required>
                </div>
              </div>

              <div class="row">
                 <div class="col-md-6 mb-3">
                   <label class="form-label">Stok</label>
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
            <button type="submit" class="btn btn-success" :disabled="submitPending">
              <span v-if="submitPending" class="spinner-border spinner-border-sm me-1"></span>
              Update Menu
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-wrapper {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eaeaea;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain; /* ⭐ gambar tidak akan ter-crop */
  padding: 10px;
}

.no-image {
  color: #888;
  font-size: 14px;
}

</style>