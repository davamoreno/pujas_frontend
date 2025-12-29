<script setup lang="ts">
import { useCartStore } from '~/stores/cart';
const route = useRoute();
const cartStore = useCartStore();
const isActive = (path: string) => route.path.startsWith(path);
</script>

<template>
  <div class="d-md-none"> 
    
    <div style="height: 70px;"></div>

    <nav class="navbar fixed-bottom bg-white border-top shadow-lg pb-safe" style="height: 65px; z-index: 1030;">
      <div class="container h-100">
        <div class="row w-100 mx-0 h-100">

          <div class="col-4 px-0 h-100">
            <NuxtLink to="/tenants" class="nav-link-mobile" :class="isActive('/tenants') ? 'text-primary' : 'text-secondary opacity-75'">
              <i class="bi fs-4 mb-1" :class="isActive('/tenants') ? 'bi-shop-window' : 'bi-shop'"></i>
              <span class="small fw-bold" style="font-size: 0.7rem;">Menu</span>
            </NuxtLink>
          </div>

          <div class="col-4 px-0 h-100">
            <NuxtLink to="/checkout" class="nav-link-mobile" :class="isActive('/checkout') ? 'text-primary' : 'text-secondary opacity-75'">
              <div class="position-relative">
                <i class="bi fs-4 mb-1" :class="isActive('/checkout') ? 'bi-basket2-fill' : 'bi-basket2'"></i>
                <span v-if="cartStore.totalQty > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white" style="font-size: 0.6rem;">
                  {{ cartStore.totalQty }}
                </span>
              </div>
              <span class="small fw-bold" style="font-size: 0.7rem;">Keranjang</span>
            </NuxtLink>
          </div>

          <div class="col-4 px-0 h-100">
            <NuxtLink to="/orders/history" class="nav-link-mobile" :class="isActive('/orders') ? 'text-primary' : 'text-secondary opacity-75'">
              <i class="bi fs-4 mb-1" :class="isActive('/orders') ? 'bi-receipt-cutoff' : 'bi-receipt'"></i>
              <span class="small fw-bold" style="font-size: 0.7rem;">Pesanan</span>
            </NuxtLink>
          </div>

        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.nav-link-mobile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-decoration: none;
  transition: color 0.2s;
}
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
</style>