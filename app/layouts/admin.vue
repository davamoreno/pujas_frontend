<script setup lang="ts">
  const isSidebarCollapsed = useSidebarState();
  const { isCollapsed, toggle } = isSidebarCollapsed;
  // const client = process.client;
  // const toggleSidebar = () => {
  //   isSidebarCollapsed.value = !isSidebarCollapsed.value;
  // }

  // watch(isSidebarCollapsed, (newVal) => {
  //   // Simpan status sidebar di localStorage
  //   if (client) {
  //     localStorage.setItem('sidebar-collapsed', newVal ? 'true' : 'false');
  //   }
  // });
  // // Muat status sidebar dari localStorage saat komponen dimuat
  // onMounted(() => {
  //   if (client) {
  //     const savedState = localStorage.getItem('sidebar-collapsed');
  //     isSidebarCollapsed.value = savedState === 'true';
  //   }
  // });
</script>

<template>
  <div class="admin-layout" :class="{ 'sidebar-collapsed': isCollapsed }">
    
    <AppSidebar />
    
    <button class="sidebar-toggle-btn" @click="toggle">
      <i :class="isCollapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
    </button>

    <div class="main-content-wrapper">
      <main class="page-content">
        <slot />
      </main>
    </div>

  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden; /* Mencegah scroll horizontal saat transisi */
}

/* --- LOGIKA UTAMA AGAR KONTEN TIDAK TERTUTUP --- */
.main-content-wrapper {
  /* 1. Beri jarak kiri sebesar lebar sidebar (260px) */
  margin-left: 260px; 
  
  /* 2. Transisi halus agar gesernya barengan sama sidebar */
  transition: margin-left 0.3s ease; 
  
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.page-content {
  padding: 1.5rem;
  flex-grow: 1;
}

/* --- STYLE TOMBOL TOGGLE --- */
.sidebar-toggle-btn {
  position: fixed; /* Ganti ke fixed agar ikut navbar */
  top: 30px; /* Sesuaikan ketinggian */
  left: 260px; /* Posisi awal (lebar sidebar) */
  transform: translateX(-50%); /* Center di garis batas */
  
  background-color: #0d6efd;
  color: white;
  border: 2px solid #ffffff;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1050; /* Pastikan di atas sidebar */
  cursor: pointer;
  transition: left 0.3s ease, background-color 0.2s;
}

.sidebar-toggle-btn:hover {
  background-color: #0b5ed7;
}

/* --- LOGIKA SAAT SIDEBAR TERTUTUP (COLLAPSED) --- */

/* 1. Kecilkan Sidebar */
.admin-layout.sidebar-collapsed :deep(.app-sidebar) {
  width: 80px;
}

/* 2. Sesuaikan Margin Konten Utama (KUNCI PERBAIKAN) */
.admin-layout.sidebar-collapsed .main-content-wrapper {
  margin-left: 80px; /* Geser balik konten ke kiri */
}

/* 3. Geser Tombol Toggle */
.admin-layout.sidebar-collapsed .sidebar-toggle-btn {
  left: 80px;
}

/* --- STYLE ELEMEN DALAM SIDEBAR SAAT TERTUTUP --- */
/* (Menggunakan :deep() karena elemen ini ada di dalam child component AppSidebar) */

.admin-layout.sidebar-collapsed :deep(.link-text) {
  opacity: 0;
  width: 0;
  display: none; /* Gunakan none agar layout flex tidak kacau */
}

.admin-layout.sidebar-collapsed :deep(.sidebar-header h4) {
  display: none;
}

.admin-layout.sidebar-collapsed :deep(.sidebar-header) {
  justify-content: center;
  padding-left: 0;
}

.admin-layout.sidebar-collapsed :deep(.nav-link) {
  justify-content: center; /* Ikon ke tengah */
  padding: 0.75rem 0;
}

.admin-layout.sidebar-collapsed :deep(.nav-link i) {
  margin-right: 0; /* Hapus jarak ikon */
  font-size: 1.2rem;
}

.admin-layout.sidebar-collapsed :deep(.sidebar-footer) {
  display: flex;
  justify-content: center;
}
.admin-layout.sidebar-collapsed :deep(.logout-btn) {
  justify-content: center;
  padding: 0.5rem;
}
</style>