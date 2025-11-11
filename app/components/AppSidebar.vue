<script setup lang="ts">
  const authStore = useAuthStore();
  const user = computed(() => authStore.user);
</script>

<template>
  <aside class="app-sidebar">
    <div class="sidebar-header">
      <h4>Admin Dashboard</h4>
    </div>
    <nav class="nav-list">
      <ul class="list-unstyled">
        <li><NuxtLink to="/admin/dashboard" class="nav-link"><i class="bi bi-grid-fill"></i> Dashboard</NuxtLink></li>
        <li><NuxtLink to="/admin/tenants" class="nav-link"><i class="bi bi-shop"></i> Tenants</NuxtLink></li>
        <li><NuxtLink to="/admin/menu-items" class="nav-link"><i class="bi bi-card-list"></i> Menu Items</NuxtLink></li>
        <li><NuxtLink to="/admin/staff" class="nav-link"><i class="bi bi-people-fill"></i> Staff</NuxtLink></li>
        </ul>
    </nav>
    <div class="sidebar-footer">
      <div class="fw-bold">{{ user?.nama }}</div>
      <small class="fw-bold">Login as: {{ user?.role }}</small>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 250px;
  background-color: #343a40;
  color: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  transition: width 0.3s ease; 
}
.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #495057;
  text-align: center;
}

.sidebar-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid #495057;
  text-align: center;
}
.nav-list .nav-link {
  color: #adb5bd;
  padding: 0.75rem 1rem;
  display: block;
  text-decoration: none;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}
.nav-list .nav-link:hover, .nav-list .router-link-active {
  color: white;
  background-color: #495057;
}
.nav-list .nav-link i {
  margin-right: 10px;
}
</style>