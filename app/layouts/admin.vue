<script setup lang="ts">
  // Ambil "saklar" global
  const isSidebarCollapsed = useSidebarState();

  // Buat fungsi toggle-nya di sini
  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
  }
</script>

<template>
  <div class="admin-layout" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    
    <AppSidebar />
    
    <button class="sidebar-toggle-btn" @click="toggleSidebar">
      <i :class="isSidebarCollapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
    </button>
    
    <div class="main-content-wrapper">
      <AppHeader />
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
  position: relative; /* Penting untuk positioning tombol */
}
.main-content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: #f8f9fa;
}
.page-content {
  padding: 1.5rem;
  flex-grow: 1;
}

/* --- STYLE UNTUK TOMBOL BARU --- */

.sidebar-toggle-btn {
  position: absolute;
  /* Atur posisi vertikal di tengah */
  top: 50%; 
  
  /* Posisi horizontal awal (lebar sidebar) */
  left: 250px; 

  @media screen and (max-width: 768px) {
    left: 210px; /* Sesuaikan jika sidebar lebih kecil di layar kecil */
  }

  @media screen and (max-width: 576px) {
    left: 200px; /* Sesuaikan jika sidebar lebih kecil di layar kecil */
  }

  @media screen and (max-width: 425px) {
    left: 195px; /* Sesuaikan jika sidebar lebih kecil di layar kecil */
  }
  @media screen and   (max-width: 375px) {
    left: 175px; /* Sesuaikan jika sidebar lebih kecil di layar kecil */
  }
  @media screen and (max-width: 320px) {
    left: 150px; /* Sesuaikan jika sidebar lebih kecil di layar kecil */
  }
  /* Trik centering: geser 50% lebar/tinggi-nya sendiri */
  transform: translate(-50%, -50%); 
  
  /* Styling tombol */
  background-color: #343a40;
  border: 1px solid #343a40;
  border-radius: 50%; /* Bulat */
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10; /* Di atas segalanya */
  cursor: pointer;
  
  /* Transisi mulus untuk pergerakan */
  transition: left 0.3s ease;
}
.sidebar-toggle-btn:hover {
  background-color: #000000;
}


/* --- STYLE SAAT SIDEBAR TERTUTUP --- */

/* Ini adalah kelas dinamis kita */
.admin-layout.sidebar-collapsed .app-sidebar {
  width: 0px; 
  padding: 0px;
}

/* Pindahkan tombol ke posisi baru (lebar sidebar collapsed) */
.admin-layout.sidebar-collapsed .sidebar-toggle-btn {
  left: 0px;
}

/* Sembunyikan semua teks di sidebar (style ini dari sebelumnya) */
.admin-layout.sidebar-collapsed :deep(.link-text) {
  opacity: 0;
  width: 0;
  height: 0;
  display: inline-block;
  overflow: hidden;
}
.admin-layout.sidebar-collapsed :deep(.app-sidebar .sidebar-header) {
  text-align: center;
}
.admin-layout.sidebar-collapsed :deep(.app-sidebar .nav-link) {
  text-align: center;
  padding: 0.75rem 0.5rem;
}
.admin-layout.sidebar-collapsed :deep(.nav-link i) {
  margin-right: 0;
  font-size: 0;
}
</style>