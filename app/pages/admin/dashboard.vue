<script setup lang="ts">
  // --- KODE LAMA ---
  definePageMeta({
    layout: 'admin',
    middleware: 'auth'
  });

  import { useAuthStore } from '#imports';
  const pesananMasuk = ref<any[]>([]);
  const channelName = ref<string | null>(null);

  // --- KODE BARU DIMULAI DI SINI ---

  // 1. Ambil instance Echo dari plugin ($echo)
  const { $echo } = useNuxtApp();

  // 2. Ambil data user (kita butuh ID tenant-nya)
  
  const authStore = useAuthStore();
  const user = computed(() => authStore.user);

  // 3. Gunakan onMounted agar kode ini berjalan HANYA di browser
  //    setelah halaman siap
  onMounted(() => {
    // Pastikan user adalah 'Pemilik Tenant' dan punya tenant
    console.log("User saat ini:", user.value);
    if (user.value?.role === 'Pemilik Tenant') {
      if (user.value?.tenant) {
        const tenantId = user.value.tenant?.id;
        console.log("ID Tenant:", tenantId); // SEKARANG INI AKAN ADA ISINYA
        channelName.value = `tenant.${tenantId}`;
        console.log(`Mencoba mendengarkan di channel: ${channelName.value}`);
        $echo.private(channelName.value)
          .listen('PesananMasukUntukTenant', (data: any) => {
            console.log('EVENT DITERIMA!', data);
            pesananMasuk.value.unshift(data);
          })
          .error((error: any) => {
            console.error('Error koneksi Echo:', error);
            channelName.value = "Koneksi Gagal. Cek console.";
          });
          
      } else {
        // Ini yang mungkin terjadi sekarang:
        console.error("User adalah Pemilik Toko tapi data tenant tidak ditemukan!");
        channelName.value = "Error: Data tenant tidak ter-load.";
      }
    } else if (user.value?.role === 'Admin') {
      channelName.value = "Mode Admin: Tidak terhubung ke channel tenant spesifik.";
    }
  });

  // 6. Best practice: Hentikan listener saat halaman ditutup
  onUnmounted(() => {
    if (channelName.value) {
      $echo.leave(channelName.value);
      console.log(`Keluar dari channel: ${channelName.value}`);
    }
  });

</script>

<template>
  <div class="card">
    <div class="card-header">
      <h3>Pesanan Masuk (Real-time)</h3>
    </div>
    <div class="card-body">
      <div v-if="channelName" class="alert alert-success">
        Tersambung ke channel: <strong>{{ channelName }}</strong>. Menunggu pesanan...
      </div>
      <div class="alert alert-info" v-if="!channelName && pesananMasuk.length === 0">
        Belum ada pesanan baru...
      </div>
      
      <ul class="list-group list-group-flush">
        <li v-for="(pesanan, index) in pesananMasuk" :key="index" 
            class="list-group-item list-group-item-warning"> <strong>Kode: {{ pesanan.kodePesanan }}</strong>
          <ul class="mt-2">
            <li v-for="item in pesanan.items" :key="item.id">
              {{ item.jumlah }}x {{ item.menu_item.nama }}
              <span v-if="item.catatan" class="text-muted fst-italic"> - "{{ item.catatan }}"</span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.card {
  min-height: 400px;
}
.list-group-item-warning {
  background-color: #fff3cd;
}
</style>