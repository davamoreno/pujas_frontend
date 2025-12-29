// middleware/customer-auth.ts
import { useCustomerStore } from '~/stores/customer';

export default defineNuxtRouteMiddleware((to, from) => {
  const customerStore = useCustomerStore();

  // [PENTING] Izinkan akses langsung ke halaman Tracking Order (/orders/...)
  // meskipun user tidak punya nama/sesi (karena habis refresh dari Xendit)
  if (to.path.startsWith('/orders/')) {
    return; // Lanjut, jangan diblokir
  }

  // Logic lama: Jika belum input nama & bukan di home, tendang ke home
  if (!customerStore.isGuestRegistered && to.path !== '/') {
    return navigateTo('/');
  }
});

// // middleware/customer-auth.ts
// import { useCustomerStore } from '~/stores/customer';

// export default defineNuxtRouteMiddleware((to, from) => {
//   const customerStore = useCustomerStore();

//   // Jika belum input nama, tendang ke Landing Page
//   if (
//     !customerStore.isGuestRegistered && 
//     to.path !== '/' && 
//     !to.path.startsWith('/orders/') 
//   ) {
//     return navigateTo('/');
//   }
// });