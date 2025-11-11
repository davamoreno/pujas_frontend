// middleware/admin.ts
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  if (!authStore.isLoggedIn) {
    return navigateTo('/admin/login');
  }

  // Gunakan getter 'isAdmin' kita
  if (!authStore.isAdmin) { 
    // Jika bukan Admin, tendang ke dasbor
    return navigateTo('/admin/dashboard');
  }
});