<template>

  <div class="d-flex justify-content-center align-items-center"
    style="background-color: #D9D9D9; height: 175px; margin-bottom: 32px;">
    <h1>PUJASERA PNB</h1>
  </div>
  <div style="margin-left: 24px; margin-right: 24px; margin-top: 32px; margin-bottom: 32px;">

    <!-- Nama pemesan dan Ikon keranjang -->
    <div class="row" style="margin-bottom: 24px;">
      <div class="col-6 d-flex ">
        <span class="justify-content-start">
          <p class="fs-4 fw-medium text-start">Nama Pemesan</p>
          <input type="text" placeholder="Isi Disini" style="border: none;" class="fw-medium">
        </span>
      </div>
      <div class="col-6 d-flex justify-content-end align-items-center">
        <button style="width: 60px; height: 60px; border-color: #D9D9D9;"
          class="d-flex justify-content-center align-items-center btn rounded-pill btn-zoom disabled">
          <img src="D:\laravel\pujas_frontend\public\img\keranjang.svg" alt="">
        </button>
      </div>
    </div>

    <!-- Menu -->
    <div>
      <h3 class="text-start" style="margin-bottom: 20px;">Pilihan Tenant Pujasera</h3>
      <div class="row g-5">

        <div class="col-lg-4 col-md-6">
          <btn class="card btn-zoom-menu" style="border-color: #D9D9D9;">
            <img src="D:\laravel\pujas_frontend\public\img\tenant.jpg" class="card-img-top p-3" alt="...">
            <div class="card-body">
              <h5 class="card-title text-center">Warung Bu Surya</h5>
            </div>
          </btn>
        </div>

        <div class="col-lg-4 col-md-6">
          <btn class="card btn-zoom-menu" style="border-color: #D9D9D9;">
            <img src="D:\laravel\pujas_frontend\public\img\tenant.jpg" class="card-img-top p-3" alt="...">
            <div class="card-body">
              <h5 class="card-title text-center">Warung Bu Yonathan</h5>
            </div>
          </btn>
        </div>

        <div class="col-lg-4 col-md-6">
          <btn class="card btn-zoom-menu" style="border-color: #D9D9D9;">
            <img src="D:\laravel\pujas_frontend\public\img\tenant.jpg" class="card-img-top p-3" alt="...">
            <div class="card-body">
              <h5 class="card-title text-center">Warung Bu Abhi</h5>
            </div>
          </btn>
        </div>

        <div class="col-lg-4 col-md-6">
          <btn class="card btn-zoom-menu" style="border-color: #D9D9D9;">
            <img src="D:\laravel\pujas_frontend\public\img\tenant.jpg" class="card-img-top p-3" alt="...">
            <div class="card-body">
              <h5 class="card-title text-center">Warung Bu Dava</h5>
            </div>
          </btn>
        </div>


        <div class="col-lg-4 col-md-6">
          <btn class="card btn-zoom-menu" style="border-color: #D9D9D9;">
            <img src="D:\laravel\pujas_frontend\public\img\tenant.jpg" class="card-img-top p-3" alt="...">
            <div class="card-body">
              <h5 class="card-title text-center">Warung Bu Ozza</h5>
            </div>
          </btn>
        </div>

        <div class="col-lg-4 col-md-6">
          <btn class="card btn-zoom-menu" style="border-color: #D9D9D9;">
            <img src="D:\laravel\pujas_frontend\public\img\tenant.jpg" class="card-img-top p-3" alt="...">
            <div class="card-body">
              <h5 class="card-title text-center">Warung Bu Jesi</h5>
            </div>
          </btn>
        </div>

      </div>

    </div>

  </div>

</template>

<script setup lang="ts">
// You can add script logic here if needed

</script>

<style scoped>
/* Efek transisi halus untuk semua properti */
.btn-zoom {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* Saat di-hover, perbesar tombol sedikit */
.btn-zoom:hover {
  transform: scale(1.1);
  /* Zoom in sebesar 10% */
  /* Opsional: tambahkan shadow saat hover agar lebih 'mengangkat' */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.btn-zoom-menu {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* Saat di-hover, perbesar tombol sedikit */
.btn-zoom-menu:hover {
  transform: scale(1.02);
  /* Zoom in sebesar 10% */
  /* Opsional: tambahkan shadow saat hover agar lebih 'mengangkat' */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
</style>