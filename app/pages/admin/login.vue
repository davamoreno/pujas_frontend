<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const router = useRouter();
// 1. Variabel untuk menyimpan input form
const username = ref('');
const password = ref('');

// 2. Variabel untuk status loading dan pesan error
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

// 3. Ambil runtime config untuk alamat API (jika perlu)
// Untuk sekarang, kita akan hardcode URL API backend
const config = useRuntimeConfig();

// 4. Fungsi yang dijalankan saat form disubmit
async function handleLogin() {
  isLoading.value = true;
  errorMessage.value = null;

  try {
    // 5. Gunakan useFetch bawaan Nuxt untuk memanggil API
    const { data, error } : {data : any, error : any} = await useFetch( `${config.public.apiHost}/api/auth/login`, {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value,
      },
      // Kita tidak perlu header 'Content-Type', useFetch otomatis menanganinya
    });

    // 6. Cek jika ada error dari server (misal: 401 Unauthorized)
    if (error.value) {
      throw new Error(error.value.data.error || 'Username atau password salah.');
    }

      // 7. JIKA BERHASIL:
    await authStore.login(data.value);
    
    // --- LANGKAH SELANJUTNYA ---
    // Kita akan simpan 'data.value.access_token'
    // dan redirect user ke halaman dashboard.
    // Untuk sekarang, cukup log di console.

  } catch (err: any) {
    // 8. Tangani error
    errorMessage.value = err.message;
  } finally {
    // 9. Set loading kembali ke false
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h3>Login Staff</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleLogin">
              
              <div v-if="errorMessage" class="alert alert-danger">
                {{ errorMessage }}
              </div>

              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="username" 
                  v-model="username" 
                  required
                >
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password" 
                  v-model="password" 
                  required
                >
              </div>
              <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
                {{ isLoading ? 'Loading...' : 'Login' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* CSS opsional untuk membuat layout di tengah halaman */
body {
  background-color: #f8f9fa;
}
</style>