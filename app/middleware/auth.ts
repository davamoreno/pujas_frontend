import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  // useCookie bekerja di server & client, jadi kita tidak perlu 'process.server'
  const authStore = useAuthStore();

  // Jika tidak ada token
  if (!authStore.isLoggedIn) {
    // tendang ke login.

    return navigateTo('/admin/login');
  }

  // Jika ada token, biarkan.
});