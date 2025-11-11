<template>
  <div class="food-order-page container-fluid py-0">
    <!-- Header -->
    <div class="w-100 bg-light shadow-sm mb-3">
      <div class="container d-flex align-items-center justify-content-center py-3">
        <h2 class="fw-bold mb-0">Wr. Bu Mang</h2>
      </div>
    </div>

    <!-- Nama Pemesan + Icon Keranjang -->
    <div class="d-flex justify-content-between align-items-center mb-3 px-3">
      <div>
        <p class="mb-0 fw-semibold small text-secondary">Nama Pemesan</p>
        <p class="mb-0 fw-bold">Mumuchang</p>
      </div>
      <button
        class="btn position-relative rounded-circle shadow-sm p-2"
        style="background-color: #ffffff; border: 1px solid rgba(0,0,0,0.06);"
      >
        <img src="/images/keranjang 2.jpg" alt="Keranjang" class="cart-icon" />
        <span
          class="badge bg-danger position-absolute top-0 start-100 translate-middle p-1 border border-light rounded-circle"
          >{{ cart.length }}</span
        >
      </button>
    </div>

    <!-- Search Bar -->
    <div class="px-3 mb-4 position-relative search-wrapper">
      <button
        type="button"
        @click="focusSearch"
        aria-label="Focus search"
        class="search-btn"
      >
        <img src="/images/search.jpg" alt="Search" class="search-img" />
      </button>

      <input
        type="text"
        class="form-control rounded-pill shadow-sm"
        placeholder="Search..."
        v-model="searchQuery"
        style="padding-left:4.5rem;"
      />
    </div>

    <!-- Menu: Paling Sering Dibeli -->
    <div class="menu-section px-3 mb-4">
      <h5 class="fw-semibold mb-3">Paling Sering Dibeli</h5>
      <div class="row g-3">
        <div
          v-for="item in filteredPopularItems"
          :key="item.id"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <div class="card h-100 shadow-sm border-0">
            <img :src="item.image" class="card-img-top" alt="menu image" />
            <div class="card-body d-flex flex-column justify-content-between text-center">
              <h6 class="card-title fw-semibold">{{ item.name }}</h6>
              <p class="card-text text-secondary mb-2">{{ formatRupiah(item.price) }}</p>
              <button class="btn btn-outline-success rounded-pill" @click="addToCart(item)">
                Tambahkan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu: Minuman -->
    <div class="menu-section px-3 mb-5">
      <h5 class="fw-semibold mb-3">Minuman</h5>
      <div class="row g-3">
        <div
          v-for="item in filteredDrinks"
          :key="item.id"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <div class="card h-100 shadow-sm border-0">
            <img :src="item.image" class="card-img-top" alt="menu image" />
            <div class="card-body d-flex flex-column justify-content-between text-center">
              <h6 class="card-title fw-semibold">{{ item.name }}</h6>
              <p class="card-text text-secondary mb-2">{{ formatRupiah(item.price) }}</p>
              <button class="btn btn-outline-success rounded-pill" @click="addToCart(item)">
                Tambahkan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ CART SUMMARY -->
    <div class="cart-summary-wrapper fixed-bottom d-flex justify-content-center px-3 pb-3">
      <div
        class="cart-summary d-flex justify-content-between align-items-center w-100"
      >
        <div class="d-flex align-items-center gap-3">
          <div class="position-relative">
            <div class="cart-icon-container d-flex align-items-center justify-content-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-bag text-success" viewBox="0 0 16 16">
                <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>
              </svg>
            </div>
            <span
              class="badge bg-danger position-absolute top-0 start-100 translate-middle p-1 border border-light rounded-circle"
              >{{ cart.length }}</span
            >
          </div>
          <div class="text-start text-white">
            <p class="mb-0 small">Total</p>
            <h6 class="mb-0 fw-bold">{{ formatRupiah(total) }}</h6>
          </div>
        </div>
        <button class="btn fw-bold rounded-pill text-white">BAYAR</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const customerName = ref('Mumuchang');
const searchQuery = ref('');
const cartCount = ref(0);
const cart = ref([]);

const favoriteItems = ref([
  { id: 1, name: 'Nasi Ayam Geprek', price: 15000, image: '/img/Ayam_geprek.jpg' },
  { id: 2, name: 'Es Kopi', price: 10000, image: '/img/Caffe_Latte.jpg' },
]);

const drinkItems = ref([
  { id: 3, name: 'Es Kopi', price: 10000, image: '/img/Caffe_Latte.jpg' },
]);

const addToCart = (item) => {
  cart.value.push({ ...item })
}

const total = computed(() => cart.value.reduce((sum, item) => sum + item.price, 0))

const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const focusSearch = () => {
  document.querySelector('.search-wrapper input')?.focus()
}
</script>

<style scoped>
.menu-page {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 100px;
}
  .header {
    background-color: #d9d9d9;
  }

.item-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      background-color: #28a745;
      color: white;
    }
  }

  /* === SEARCH BAR === */
  .search-wrapper {
    position: relative;
    .search-btn {
      position: absolute;
      left: 0.9rem;
      top: 50%;
      transform: translateY(-50%);
      width: 36px;
      height: 36px;
      padding: 0;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.06);
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      cursor: pointer;
    }
    .search-img {
      width: 18px;
      height: 18px;
      object-fit: contain;
      display: block;
    }
    input.form-control {
      padding-left: 4rem;
      border-radius: 9999px;
    }
  }

  /* ✅ CART SUMMARY */
  .cart-summary-wrapper {
    background: transparent;
    display: flex;
    justify-content: center;
    align-items: center;

    .cart-summary {
      background-color: #28a745;
      color: white;
      border-radius: 16px;
      padding: 0.9rem 1.25rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      width: 100%;
      max-width: 900px;
      transition: all 0.3s ease;
    }

    .cart-icon-container {
      width: 48px;
      height: 48px;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
    }

    .bayar-btn {
      padding: 0.6rem 2rem;
      font-size: 1rem;
      font-weight: 700;
    }
  }

  /* 📱 RESPONSIVE */
  @media (max-width: 768px) {
    .cart-summary {
      flex-direction: column;
      align-items: stretch !important;
      text-align: center;
    }
  }
</style>