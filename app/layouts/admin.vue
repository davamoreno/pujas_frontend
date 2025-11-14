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
  display: flex;
  height: 100vh;
  overflow: hidden;
  transition: margin-left 0.3s ease;
  position: relative;
}
.main-content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: #f8f9fa; /* Latar belakang konten utama */
}
.page-content {
  padding: 1.5rem;
  flex-grow: 1;
}

/* --- STYLE TOMBOL TOGGLE (disesuaikan untuk tema terang) --- */
.sidebar-toggle-btn {
  position: absolute;
  top: 60px; /* Posisikan di bawah header sidebar */
  left: 260px; /* Sesuaikan dengan lebar sidebar baru */
  transform: translate(-50%, -50%); 
  
  /* Styling tombol */
  background-color: #0d6efd; /* Warna biru primer */
  color: white;
  border: 2px solid #ffffff;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 10;
  cursor: pointer;
  transition: left 0.3s ease, background-color 0.2s;
}
.sidebar-toggle-btn:hover {
  background-color: #0b5ed7; /* Biru lebih gelap */
}

/* --- STYLE SAAT SIDEBAR TERTUTUP --- */
.admin-layout.sidebar-collapsed :deep(.app-sidebar) {
  width: 80px; /* Lebar saat tertutup */
}
.admin-layout.sidebar-collapsed .sidebar-toggle-btn {
  left: 80px; /* Posisi tombol saat tertutup */
}
.admin-layout.sidebar-collapsed :deep(.link-text) {
  opacity: 0;
  width: 0;
  height: 0;
  display: inline-block;
  overflow: hidden;
}
.admin-layout.sidebar-collapsed :deep(.sidebar-header h4) {
  display: none; /* Sembunyikan teks header */
}
.admin-layout.sidebar-collapsed :deep(.sidebar-header) {
  justify-content: center;
  padding-left: 0;
}
.admin-layout.sidebar-collapsed :deep(.nav-link) {
  text-align: center;
  padding: 0.75rem 0.5rem;
}
.admin-layout.sidebar-collapsed :deep(.nav-link i) {
  margin-right: 0;
  font-size: 1.2rem;
}
.admin-layout.sidebar-collapsed :deep(.sidebar-footer) {
  text-align: center;
}
</style>