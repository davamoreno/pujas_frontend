export default defineNuxtRouteMiddleware((to, from) => {
  // useCookie bekerja di server & client, jadi kita tidak perlu 'process.server'
  const authToken = useAuthToken();

  // Jika tidak ada token
  if (!authToken.value) {
    // tendang ke login.

    return navigateTo('/admin/login');
  }

  // Jika ada token, biarkan.
});