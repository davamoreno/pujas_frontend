<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const config = useRuntimeConfig();

// 1. Variabel Input
const username = ref('');
const password = ref('');
const showPassword = ref(false); // State untuk toggle lihat password

// 2. Status UI
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

// 3. Fungsi Login
async function handleLogin() {
  isLoading.value = true;
  errorMessage.value = null;

  try {
    const { data, error } : {data : any, error : any} = await useFetch(`${config.public.apiHost}/api/auth/login`, {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value,
      },
    });

    if (error.value) {
      throw new Error(error.value.data.error || 'Username atau password salah.');
    }

    await authStore.login(data.value);
    
    // Redirect ke dashboard (opsional, sesuaikan dengan rute kamu)
    // router.push('/admin/dashboard');

  } catch (err: any) {
    errorMessage.value = err.message;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="login-page d-flex align-items-center justify-content-center min-vh-100">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-5 col-lg-4">
          
          <div class="card shadow-lg border-0 rounded-4">
            <div class="card-body p-5">
              
              <div class="text-center mb-4">
                <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px;">
                  <i class="bi bi-shield-lock-fill fs-3"></i>
                </div>
                <h4 class="fw-bold text-dark">Admin Portal</h4>
                <p class="text-muted small">Silakan masuk untuk mengelola sistem</p>
              </div>

              <transition name="fade">
                <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center p-2 small" role="alert">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{{ errorMessage }}</div>
                </div>
              </transition>

              <form @submit.prevent="handleLogin">
                
                <div class="mb-3">
                  <label for="username" class="form-label fw-semibold small text-secondary">Username</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0 text-muted">
                      <i class="bi bi-person"></i>
                    </span>
                    <input 
                      type="text" 
                      class="form-control bg-light border-start-0 ps-0" 
                      id="username" 
                      placeholder="Masukkan username"
                      v-model="username" 
                      required
                    >
                  </div>
                </div>

                <div class="mb-4">
                  <label for="password" class="form-label fw-semibold small text-secondary">Password</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0 text-muted">
                      <i class="bi bi-lock"></i>
                    </span>
                    <input 
                      :type="showPassword ? 'text' : 'password'" 
                      class="form-control bg-light border-start-0 border-end-0 ps-0" 
                      id="password" 
                      placeholder="Masukkan password"
                      v-model="password" 
                      required
                    >
                    <button 
                      class="btn btn-light border border-start-0 text-muted" 
                      type="button"
                      @click="showPassword = !showPassword"
                    >
                      <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary w-100 py-2 fw-bold rounded-3 shadow-sm" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ isLoading ? 'Memproses...' : 'Masuk' }}
                </button>

              </form>
            </div>
            
            <div class="card-footer bg-white border-0 text-center py-3">
              <small class="text-muted">&copy; 2024 Admin System</small>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Background Gradient yang Elegan */
.login-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Styling Input agar focus lebih halus */
.form-control:focus {
  box-shadow: none;
  border-color: #dee2e6; /* Sesuaikan warna border saat fokus */
}

/* Input group styling fix untuk border */
.input-group-text {
  border-right: 0;
}
.form-control {
  border-left: 0;
}

/* Animasi sederhana untuk alert */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>