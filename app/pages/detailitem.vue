<script setup lang="ts">
import { ref } from 'vue'

const menu = {
  name: 'Nasi Ayam Geprek',
  price: 15000,
  image: '/images/nasi-ayam-geprek.jpg'
}

const quantity = ref(1)
const note = ref('')

function changeQty(amount : number) {
  quantity.value = Math.max(1, quantity.value + amount)
}

function tambahPesanan() {
  alert(`Pesanan ditambahkan!\n${menu.name} x${quantity.value}\nCatatan: ${note.value || '-'}`)
}
</script>

<template>
  <div class="bg-light min-vh-100">
    <div class="container py-4 detail-wrapper">

      <!-- Header: Tombol kembali + judul -->
      <div class="d-flex align-items-center justify-content-center position-relative mb-3 header-detail">
        <button
          @click="$router.back()"
          class="btn btn-link p-0 position-absolute start-0 back-btn"
        >
          <img src="/images/kembali.svg" alt="Kembali" class="icon-kembali" />
        </button>
        <h4 class="text-center fw-semibold mb-0">Detail</h4>
      </div>

      <!-- Card Makanan -->
      <div class="card shadow-sm border-0 rounded-4 overflow-hidden mx-auto card-detail">
        <img :src="menu.image" class="card-img-top" :alt="menu.name" />

        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3 flex-wrap">
            <div>
              <h5 class="card-title mb-1">{{ menu.name }}</h5>
              <p class="text-muted mb-0">
                Rp{{ menu.price.toLocaleString('id-ID') }}
              </p>
            </div>

            <!-- Counter -->
            <div class="qty-control mt-2 mt-sm-0">
              <button type="button" @click="changeQty(-1)">−</button>
              <input v-model="quantity" type="text" readonly />
              <button type="button" @click="changeQty(1)">+</button>
            </div>
          </div>

          <!-- Catatan -->
          <div class="mb-3">
            <label class="form-label fw-semibold">Catatan</label>
            <textarea
              v-model="note"
              class="form-control"
              placeholder="Berikan catatan jika diperlukan..."
              rows="2"
            ></textarea>
          </div>

          <!-- Tombol Tambah Pesanan -->
          <button class="btn btn-success w-100 py-2" @click="tambahPesanan">
            <i class="bi bi-bag-check"></i> Tambah Pesanan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Wrapper */
.detail-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

/* Header */
.header-detail {
  position: relative;
}
.back-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.back-btn:hover {
  background-color: #f8f9fa;
}
.icon-kembali {
  width: 22px;
  height: 22px;
  transition: transform 0.2s ease;
}
.back-btn:hover .icon-kembali {
  transform: scale(1.1);
}

/* Card */
.card-detail {
  width: 100%;
  max-width: 100%;
  border-radius: 16px;
}
.card-img-top {
  height: 240px;
  object-fit: cover;
  width: 100%;
}

/* Counter */
.qty-control {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  background-color: white;
  padding: 5px 10px;
  width: fit-content;
  flex-shrink: 0;
}
.qty-control button {
  border: none;
  background: none;
  font-size: 20px;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qty-control input {
  width: 40px;
  text-align: center;
  border: none;
  background: transparent;
  font-weight: 600;
}

/* ===================== RESPONSIVE ===================== */

/* Mobile kecil (≤ 480px) */
@media (max-width: 480px) {
  .detail-wrapper {
    padding: 0 1rem;
  }
  .card-img-top {
    height: 190px;
  }
  .card-body {
    padding: 1rem;
  }
  h4 {
    font-size: 1rem;
  }
  h5.card-title {
    font-size: 1rem;
  }
  textarea.form-control {
    font-size: 0.9rem;
  }
  .qty-control {
    margin-top: 0.6rem;
  }
  .btn-success {
    font-size: 0.9rem;
  }
}

/* Tablet (481px - 991px) */
@media (min-width: 481px) and (max-width: 991px) {
  .detail-wrapper {
    max-width: 550px;
  }
  .card-img-top {
    height: 260px;
  }
  .card-body {
    padding: 1.25rem 1.75rem;
  }
}

/* Laptop / Desktop (≥ 992px) */
@media (min-width: 992px) {
  .detail-wrapper {
    max-width: 640px;
  }
  .card-img-top {
    height: 320px;
  }
  .card-body {
    padding: 1.5rem 2rem;
  }
}
</style>