<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
});

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useToast } from 'vue-toastification';

const router = useRouter();
const authStore = useAuthStore();
const config = useRuntimeConfig();
const toast = useToast();

interface Role {
  id: number;
  nama: string;
}

const {data: roles, pending: rolesPending, error:  rolesError} = await useFetch<Role[]>(`${config.public.apiHost}/api/roles`, {
  lazy : true,
  onRequest({ request, options }) {
    options.headers = new Headers(options.headers);
    options.headers.set('Authorization', `Bearer ${authStore.token}`);
    options.headers.set('Accept', 'application/json');
  },
  onResponseError({ request, response, options }) {
    if (response.status === 401) {
      // Token mungkin sudah tidak valid, redirect ke halaman login
      authStore.logout();
    }
  }
});


const form = ref({
  nama: '',
  username: '',
  password: '',
  role_id: null as number | null,
});

const submitLoading = ref(false);
const submitError = ref<string | null>(null);
const showPassword = ref(false); 



async function submitStaff() {
  if (!form.value.nama || !form.value.username || !form.value.password || !form.value.role_id) {
    submitError.value = 'Semua field wajib diisi.';
    return;
  }

  submitLoading.value = true;
  submitError.value = null;

  try {
    await $fetch(`${config.public.apiHost}/api/staff`, {
      method: 'POST',
      headers: {
        'Authorization' : `Bearer ${authStore.token}`,
        'Accept' : 'application/json',
      },
      body: form.value,
    });

    toast.success(`Staff ${form.value.nama} berhasil ditambahkan!`);

    await router.push('/admin/staffs'); 
  } catch (err: any) {
    console.error(err);
    if(err.status === 422) {
      submitError.value = `Gagal Validasi: ${Object.values(err.data.errors).join(', ')}`;
      toast.error(submitError.value);
    } else {
      submitError.value = err.data?.message || 'Terjadi kesalahan server.';
      toast.error(submitError.value);
    }
  } finally {
    submitLoading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Tambah Staff Baru</h1>
      <NuxtLink to="/admin/staffs" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left"></i> Kembali ke Daftar
      </NuxtLink>
    </div>

    <div class="card">
      <div class="card-body">
        <form @submit.prevent="submitStaff">
          
          <div class="mb-3">
            <label for="nama" class="form-label">Nama Lengkap</label>
            <input type="text" v-model="form.nama" class="form-control" id="nama" required>
          </div>
          
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input type="text" v-model="form.username" class="form-control" id="username" required>
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
              minlength="8"
              required
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
          <div class="form-text">Minimal 8 karakter.</div>
        </div>
          
          <div class="mb-3">
            <label for="role" class="form-label">Peran (Role)</label>
            <div v-if="rolesPending">Memuat...</div>
            <select v-else v-model="form.role_id" class="form-select" id="role" required>
              <option :value="null" disabled>-- Pilih peran --</option>
              <option v-for="role in roles" :key="role.id" :value="role.id">
                {{ role.nama }}
              </option>
            </select>
          </div>
          
          <hr>
          <div v-if="submitError" class="alert alert-danger">
            <strong>Gagal menyimpan!</strong><br> {{ submitError }}
          </div>
          
          <button type="submit" class="btn btn-primary" :disabled="submitLoading">
            {{ submitLoading ? 'Menyimpan...' : 'Simpan Staff' }}
          </button>
        </form>
      </div>
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
