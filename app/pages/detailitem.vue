<template>
  <div class="bg-light min-vh-100">
    <div class="container py-4 detail-wrapper">
      <!-- Header: Ikon kembali + Judul sejajar -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <button @click="$router.back()" class="btn btn-link p-0 d-flex align-items-center">
          <img src="/images/kembali.svg" alt="Kembali" class="icon-kembali" />
        </button>
        <h4 class="fw-semibold mb-0 flex-grow-1 text-center">Detail</h4>
        <div style="width: 44px;"></div> <!-- Spacer agar teks tetap center -->
      </div>

      <!-- Card Makanan -->
      <div class="card shadow-sm border-0 rounded-4 overflow-hidden mx-auto card-detail">
        <img :src="menu.image" class="card-img-top" :alt="menu.name" />

        <div class="card-body">
          <!-- Nama, Harga & Counter -->
          <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap">
            <div>
              <h5 class="card-title mb-1">{{ menu.name }}</h5>
              <p class="text-muted mb-0">Rp{{ menu.price.toLocaleString('id-ID') }}</p>
            </div>

            <!-- Counter Kuantitas -->
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
              rows="3"
            ></textarea>
          </div>

          <!-- Tombol Tambah Pesanan -->
          <button class="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2" @click="tambahPesanan">
            <img src="/images/keranjang.svg" alt="Keranjang" width="25" height="25" />
            <span>Tambah Pesanan</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const menu = {
  name: 'Nasi Ayam Geprek',
  price: 15000,
  image: '/images/nasi-ayam-geprek.jpg' // pastikan file ada di public/images
}

const quantity = ref(1)
const note = ref('')

function changeQty(amount) {
  quantity.value = Math.max(1, quantity.value + amount)
}

function tambahPesanan() {
  alert(`Pesanan ditambahkan!\n${menu.name} x${quantity.value}\nCatatan: ${note.value || '-'}`)
}
</script>

<style scoped lang="scss">
.detail-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

/* Header */
.icon-kembali {
  width: 44px;
  height: 44px;
  transition: transform 0.2s ease;
}
.icon-kembali:hover {
  transform: scale(1.1);
}

/* Card */
.card-detail {
  border-radius: 1rem;

  .card-img-top {
    width: 100%;
    height: auto;
    max-height: 260px;
    object-fit: cover;
  }

  .card-body {
    padding: 1.25rem;
  }

  .qty-control {
    display: flex;
    align-items: center;
    background-color: #f8f9fa;
    border-radius: 12px;
    padding: 0.25rem 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);

    button {
      border: none;
      background: none;
      font-size: 20px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    input {
      width: 40px;
      text-align: center;
      border: none;
      background: transparent;
      font-weight: 600;
    }
  }

  .btn-success {
    font-size: 1rem;
    font-weight: 500;
    padding: 0.75rem;
    border-radius: 0.75rem;

    img {
      margin-right: 0.5rem;
    }
  }
}

/* Responsif Mobile */
@media (max-width: 576px) {
  .card-detail .card-img-top {
    max-height: 200px;
  }

  .card-detail .btn-success {
    font-size: 0.95rem;
  }

  h5.card-title {
    font-size: 1.05rem;
  }
}
</style>