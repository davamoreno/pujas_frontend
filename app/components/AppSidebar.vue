<script setup lang="ts">
  import { useAuthStore } from '~/stores/auth';
  const authStore = useAuthStore();
  const handleLogout = () => {
    authStore.logout();
  }
</script>

<template>
  <aside class="app-sidebar">
    <div class="sidebar-header">
      <img src="" alt="Logo" class="sidebar-logo">
      <h4 class="link-text ms-2">Pujasera PNB</h4>
    </div>
    
    <nav class="nav-list">
      <ul class="list-unstyled" v-if="authStore.user?.role === 'Admin'">
        <li><NuxtLink to="/admin/dashboard" class="nav-link"><i class="bi bi-grid-fill"></i> <span class="link-text">Dashboard</span></NuxtLink></li>
        <li><NuxtLink to="/admin/tenants" class="nav-link"><i class="bi bi-shop"></i> <span class="link-text">Kelola Tenant</span></NuxtLink></li>
        <li><NuxtLink to="/admin/staffs" class="nav-link"><i class="bi bi-people-fill"></i> <span class="link-text">Kelola Pedagang</span></NuxtLink></li>
        <li><NuxtLink to="/admin/laporan" class="nav-link"><i class="bi bi-bar-chart-fill"></i> <span class="link-text">Rekap Laporan</span></NuxtLink></li>
        <li><NuxtLink to="/admin/manajemen-pesanan" class="nav-link"><i class="bi bi-clock-history"></i> <span class="link-text">Manajemen Pesanan</span></NuxtLink></li>
      </ul>
      <ul class="list-unstyled" v-else-if="authStore.user?.role === 'Pemilik Tenant'">
        <li><NuxtLink to="/admin/dashboard" class="nav-link"><i class="bi bi-grid-fill"></i> <span class="link-text">Dashboard</span></NuxtLink></li>
        <li><NuxtLink to="/admin/menu-items" class="nav-link"><i class="bi bi-card-list"></i> <span class="link-text">Kelola Menu</span></NuxtLink></li>
        <li><NuxtLink to="/admin/manajemen-pesanan" class="nav-link"><i class="bi bi-clock-history"></i> <span class="link-text">Manajemen Pesanan</span></NuxtLink></li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <button class="nav-link logout-btn" @click="handleLogout">
        <i class="bi bi-box-arrow-left"></i> <span class="link-text">Keluar</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
/* 1. Sidebar dibuat FIXED agar menempel terus di layar */
.app-sidebar {
  width: 260px;
  background-color: #ffffff;
  color: #333;
  height: 100vh;
  position: fixed; /* KUNCI: Agar sidebar diam di tempat */
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-right: 1px solid #dee2e6;
  z-index: 1000; /* Agar di atas konten lain */
  overflow-y: auto; /* Agar bisa discroll jika menu banyak */
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
  padding-left: 0.5rem;
}
.sidebar-logo {
  height: 32px;
  width: 32px;
}
.sidebar-header h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0;
  color: #212529;
}

/* 2. Perbaikan Tombol Navigasi */
.nav-list .nav-link {
  color: #495057;
  padding: 0.75rem 1rem;
  display: flex; /* KUNCI: Gunakan Flexbox */
  align-items: center; /* Agar Icon dan Teks sejajar vertikal (tengah) */
  text-decoration: none;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
  width: 100%; /* Pastikan lebar penuh */
}

.nav-list .nav-link:hover {
  color: #0d6efd;
  background-color: #e7f0ff;
}

.nav-list .router-link-active {
  color: #fff;
  background-color: #0d6efd;
  box-shadow: 0 2px 6px rgba(13, 110, 253, 0.3); /* Tambah bayangan sedikit biar manis */
}

/* Ikon fix width agar teks lurus rata kiri */
.nav-list .nav-link i {
  margin-right: 12px;
  width: 20px;
  text-align: center;
  flex-shrink: 0; /* Agar ikon tidak gepeng kalau teks panjang */
  font-size: 1.1rem;
}

.link-text {
  line-height: 1.2; /* Jaga jarak baris jika teks panjang */
}

/* Sidebar Footer */
.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6; /* Opsional: pemisah area logout */
}

.logout-btn {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: #dc3545;
  display: flex; /* Flex juga untuk logout */
  align-items: center;
}
.logout-btn:hover {
  background-color: #f8d7da;
  color: #a71d2a;
}
</style>