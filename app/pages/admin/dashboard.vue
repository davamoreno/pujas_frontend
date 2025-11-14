<script setup lang="ts">

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});


</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Dashboard</h1>
      <select class="form-select form-select-sm" style="width: 200px;">
        <option selected>Semua Bulan</option>
        <option value="1">Januari</option>
        <option value="2">Februari</option>
      </select>
    </div>

    <div class="row">
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <div class="card-title text-muted">Total Menu</div>
              <div class="h2 fw-bold">30</div>
            </div>
            <i class="bi bi-grid-fill display-4 text-primary opacity-25"></i>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <div class="card-title text-muted">Tenant</div>
              <div class="h2 fw-bold">15</div>
            </div>
            <i class="bi bi-shop display-4 text-warning opacity-25"></i>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <div class="card-title text-muted">Total Transaksi</div>
              <div class="h2 fw-bold">15</div>
            </div>
            <i class="bi bi-cash-stack display-4 text-success opacity-25"></i>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row mb-4">
      <div class="col">
        <div class="card">
          <div class="card-body">
            <div class="card-title text-muted">Total Penjualan</div>
            <div class="h3 fw-bold">Rp5.000.000</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Rekap Penjualan</h5>
        <div>
          <select class="form-select form-select-sm d-inline-block me-2" style="width: 150px;">
            <option selected>Semua Bulan</option>
          </select>
          <select class="form-select form-select-sm d-inline-block" style="width: 150px;">
            <option selected>Urutkan</option>
          </select>
        </div>
      </div>
      <div class="card-body table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th>Bulan</th>
              <th>Tenant</th>
              <th>Menu Populer</th>
              <th>Harga</th>
              <th>Terjual</th>
              <th>Total Penjualan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Januari</td>
              <td>Warung Bu Mang</td>
              <td>Nasi Ayam Geprek</td>
              <td>Rp15.000</td>
              <td>250</td>
              <td>Rp2.100.000</td>
            </tr>
            </tbody>
        </table>
      </div>
    </div>

  </div>
</template>