<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
});

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';


const router = useRouter();
const authToken = useAuthToken();
const config = useRuntimeConfig();

const form = ref({
  nama: '',
  staff_id: '',
  image: null as File | null,
});
const imagePreview = ref<string | null>(null);
const staffList = ref<any[]>([]);
const loading = ref(false);
const error = ref('');

// Ambil daftar staff
onMounted(async () => {
  try {
    const res = await $fetch(`${config.public.apiHost}/api/staff`, {
      headers: {
        Authorization: `Bearer ${authToken.value}`,
        Accept: 'application/json',
      },
    });
    staffList.value = res;
  } catch (err: any) {
    error.value = 'Gagal memuat data staff.';
  }
});

// ✅ Upload Gambar
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file && file.type.startsWith('image/')) {
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 5MB!');
      return;
    }
    form.value.image = file;
    imagePreview.value = URL.createObjectURL(file);
  } else {
    alert('File bukan gambar!');
    form.value.image = null;
    imagePreview.value = null;
    if (target) target.value = '';
  }
};


const cancelImage = () => {
  form.value.image = null;
  imagePreview.value = null;
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
};


const submitTenant = async () => {
  if (!form.value.nama || !form.value.staff_id) {
    error.value = 'Nama tenant dan pemilik harus diisi.';
    return;
  }

  loading.value = true;
  error.value = '';

  const formData = new FormData();
  formData.append('nama', form.value.nama);
  formData.append('staff_id', form.value.staff_id);
  if (form.value.image) formData.append('gambar', form.value.image);

  try {
    await $fetch(`${config.public.apiHost}/api/tenant`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${authToken.value}`,
      },
    });

    router.push('/admin/tenant');
  } catch (err: any) {
    error.value = 'Gagal menambahkan tenant. Coba lagi.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container py-4">
    <h1 class="h4 mb-4">Tambah Tenant Baru</h1>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div class="card shadow-sm p-4">
      <form @submit.prevent="submitTenant">
        <!-- Nama Tenant -->
        <div class="mb-3">
          <label class="form-label fw-semibold">Nama Tenant</label>
          <input
            type="text"
            v-model="form.nama"
            class="form-control"
            placeholder="Masukkan nama tenant..."
          />
        </div>

        <!-- Pemilik Tenant -->
        <div class="mb-3">
          <label class="form-label fw-semibold">Pemilik (Staff)</label>
          <select v-model="form.staff_id" class="form-select">
            <option value="" disabled>Pilih Pemilik Tenant</option>
            <option v-for="staff in staffList" :key="staff.id" :value="staff.id">
              {{ staff.nama }}
            </option>
          </select>
        </div>

        <!-- Upload Gambar -->
        <div class="mb-3">
          <label class="form-label fw-semibold">Foto Tenant</label>

          <div
            class="upload-area text-center p-4 border rounded"
            @click="$refs.fileInput.click()"
          >
            <input
              id="file-input"
              type="file"
              ref="fileInput"
              accept="image/*"
              @change="handleImageUpload"
              hidden
            />
            <div v-if="!imagePreview">
              <i class="bi bi-cloud-arrow-up fs-1 text-muted"></i>
              <p class="mt-2 mb-0 fw-semibold text-secondary">
                Klik atau seret gambar ke sini
              </p>
              <small class="text-muted">PNG, JPG, GIF (maks 5MB)</small>
            </div>

            <!-- Preview -->
            <div v-else class="preview-box mt-2">
              <img
                :src="imagePreview"
                alt="Preview"
                class="img-thumbnail"
                width="150"
              />
              <div class="mt-2">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  @click="cancelImage"
                >
                  Hapus Gambar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tombol Aksi -->
        <div class="d-flex justify-content-end mt-4 gap-2">
          <NuxtLink to="/admin/tenants" class="btn btn-outline-secondary">
            Batal
          </NuxtLink>
          <button type="submit" class="btn btn-dark" :disabled="loading">
            {{ loading ? 'Menyimpan...' : 'Tambah' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.upload-area {
  border: 2px dashed #ccc;
  cursor: pointer;
  transition: border-color 0.3s, background-color 0.3s;
}
.upload-area:hover {
  border-color: #666;
  background-color: #fafafa;
}
.preview-box img {
  border-radius: 10px;
  transition: transform 0.2s;
}
.preview-box img:hover {
  transform: scale(1.03);
}
</style>
