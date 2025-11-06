<script setup lang="ts">
  // Ambil data user dari state global
  const user = useAuthUser();
  const { logout } = useAuth();

  console.log("User di AppHeader:", user);

  const handleLogout = () => {
    // Panggil fungsi logout dari composable
    logout(); 
  }
</script>


<template>
<header class="app-header">
    
    <ClientOnly>
      <div class="user-profile ms-auto d-flex align-items-center">
        <button class="btn btn-outline-danger btn-sm" @click="handleLogout">
          <i class="bi bi-box-arrow-right"></i> Logout
        </button>
      </div>
      
      <template #fallback>
        <div class="profile-card skeleton ms-auto d-flex align-items-center">
        <div class="profile-image skeleton-element"></div>
        <div class="profile-info">
          <span class="skeleton-element"></span>
          </div>
        </div>
      </template>
      
    </ClientOnly>
    
  </header>
</template>

<style scoped>
  .app-header {
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    background-color: #ffffff;
    border-bottom: 1px solid #dee2e6;
    width: 100%;
  }
  .profile-card.skeleton {
    /* Add styles for your skeleton layout */
    background-color: #f0f0f0;
    padding: 20px;
    border-radius: 8px;
  }
  .profile-image.skeleton-element {
    width: 20px;
    height: 4px;
  }
  .profile-info .skeleton-element {
    height: 15px;
    width: 80%;
  }
  h3.skeleton-element {
    width: 60%;
  }
  p.skeleton-element {
    width: 90%;
  }
</style>