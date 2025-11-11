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
  username: '',
  password: '',
  role_id: '',
});

const roleList = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const showPassword = ref(false); 


onMounted(async () => {
  try {
    const res = await $fetch(`${config.public.apiHost}/api/roles`, {
      headers: {
        Authorization: `Bearer ${authToken.value}`,
        Accept: 'application/json',
      },
    });
    roleList.value = res;
  } catch (err: any) {
    error.value = 'Gagal memuat daftar role.';
  }
});


const submitStaff = async () => {
  if (!form.value.nama || !form.value.username || !form.value.password || !form.value.role_id) {
    error.value = 'Semua field wajib diisi.';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await $fetch(`${config.public.apiHost}/api/staff`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form.value),
    });

    router.push('/admin/staff'); 
  } catch (err: any) {
    error.value = 'Gagal menambahkan staff. Coba lagi.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container py-4">
    <h1 class="h4 mb-4">Tambah Staff Baru</h1>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div class="card shadow-sm p-4">
      <form @submit.prevent="submitStaff">
        <!-- Nama Staff -->
        <div class="mb-3">
          <label class="form-label fw-semibold">Nama Lengkap</label>
          <input
            type="text"
            v-model="form.nama"
            class="form-control"
            placeholder="Masukkan nama lengkap staff..."
          />
        </div>

        <!-- Username -->
        <div class="mb-3">
          <label class="form-label fw-semibold">Username</label>
          <input
            type="text"
            v-model="form.username"
            class="form-control"
            placeholder="Masukkan username staff..."
          />
        </div>

        <!-- Password  -->
        <div class="mb-3 position-relative">
          <label class="form-label fw-semibold">Password</label>
          <div class="input-group">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password"
              class="form-control pe-5"
              placeholder="Masukkan password..."
            />
            <button
              type="button"
              class="btn btn-outline-secondary d-flex align-items-center"
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>

        <!-- Role -->
        <div class="mb-3">
          <label class="form-label fw-semibold">Role Staff</label>
          <select v-model="form.role_id" class="form-select">
            <option value="" disabled>Pilih Role</option>
            <option v-for="role in roleList" :key="role.id" :value="role.id">
              {{ role.nama }}
            </option>
          </select>
        </div>

        <!-- Tombol Aksi -->
        <div class="d-flex justify-content-end mt-4 gap-2">
          <NuxtLink to="/admin/staff" class="btn btn-outline-secondary">
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
.card {
  max-width: 600px;
  margin: auto;
}
.form-control,
.form-select {
  border-radius: 8px;
}
.input-group .btn {
  border-radius: 0 8px 8px 0 !important;
}
.input-group input {
  border-radius: 8px 0 0 8px !important;
}
</style>
