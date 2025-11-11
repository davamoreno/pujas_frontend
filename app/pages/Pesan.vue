<template>
  <div class="menu-page">
    <!-- Header -->
    <header class="header text-center py-3">
      <h2 class="fw-bold mb-0">Wr. Bu Mang</h2>
    </header>

    <!-- Body Content -->
    <div class="container py-4">
      <!-- Nama Pemesan -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <small class="text-muted d-block">Nama Pemesan</small>
          <h6 class="fw-semibold mb-0">{{ customerName }}</h6>
        </div>
        <button class="btn position-relative p-0 border-0 bg-transparent">
          <i class="bi bi-bag fs-4"></i>
          <span
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          >
            {{ cartCount }}
          </span>
        </button>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <div class="input-group">
          <span class="input-group-text bg-white border-end-0">
            <i class="bi bi-search"></i>
          </span>
          <input
            type="text"
            class="form-control border-start-0"
            placeholder="Search..."
            v-model="searchQuery"
          />
        </div>
      </div>

      <!-- Paling Sering Dibeli -->
      <section class="mb-4">
        <h5 class="fw-semibold mb-3">Paling Sering Dibeli</h5>
        <div class="row g-3">
          <div
            class="col-6 col-md-4 col-lg-3"
            v-for="item in favoriteItems"
            :key="item.id"
          >
            <div class="card item-card text-center p-2 shadow-sm border-0 h-100">
              <img :src="item.image" class="card-img-top rounded-3" alt="Menu" />
              <div class="card-body p-2">
                <h6 class="fw-semibold mb-1">{{ item.name }}</h6>
                <p class="text-muted small mb-2">Rp{{ item.price.toLocaleString() }}</p>
                <button
                  class="btn btn-outline-success w-100"
                  @click="addToCart(item)"
                >
                  Tambahkan
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Minuman -->
      <section class="mb-5">
        <h5 class="fw-semibold mb-3">Minuman</h5>
        <div class="row g-3">
          <div
            class="col-6 col-md-4 col-lg-3"
            v-for="item in drinkItems"
            :key="item.id"
          >
            <div class="card item-card text-center p-2 shadow-sm border-0 h-100">
              <img :src="item.image" class="card-img-top rounded-3" alt="Menu" />
              <div class="card-body p-2">
                <h6 class="fw-semibold mb-1">{{ item.name }}</h6>
                <p class="text-muted small mb-2">Rp{{ item.price.toLocaleString() }}</p>
                <button
                  class="btn btn-outline-success w-100"
                  @click="addToCart(item)"
                >
                  Tambahkan
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Footer: Total dan Bayar -->
    <footer
      class="footer fixed-bottom bg-white shadow-lg border-top px-3 py-3 d-flex justify-content-between align-items-center"
    >
      <div class="d-flex align-items-center gap-2">
        <button class="btn position-relative p-0 border-0 bg-transparent">
          <i class="bi bi-bag-fill fs-5 text-success"></i>
          <span
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          >
            {{ cartCount }}
          </span>
        </button>
        <div>
          <small class="text-muted d-block">Total</small>
          <h6 class="fw-semibold mb-0 text-success">Rp{{ totalPrice.toLocaleString() }}</h6>
        </div>
      </div>
      <button class="btn btn-success px-4 py-2 fw-semibold">BAYAR</button>
    </footer>
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
  cart.value.push(item);
  cartCount.value = cart.value.length;
};

const totalPrice = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price, 0)
);
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
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    img {
      width: 100%;
      height: 120px;
      object-fit: cover;
    }
  }

  .footer {
    border-radius: 16px 16px 0 0;
  }

  @media (max-width: 768px) {
    .item-card img {
      height: 100px;
    }
    .footer {
      flex-direction: column;
      gap: 10px;
      text-align: center;
    }
  }
</style>
