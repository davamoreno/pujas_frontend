<script setup lang="ts">
import { useCartStore } from '~/stores/cart';
import { useCustomerStore } from '~/stores/customer';
import { useToast } from "vue-toastification"; // Pastikan sudah install, atau ganti alert biasa

definePageMeta({
  layout: 'customer',
  middleware: 'customer-auth'
});

const config = useRuntimeConfig();
const router = useRouter();
const cartStore = useCartStore();
const customerStore = useCustomerStore();
const toast = useToast();

// 1. Validasi: Kalau keranjang kosong, tendang balik
if (cartStore.isEmpty) {
  navigateTo('/tenants');
}

// 2. Data Dummy Metode Pembayaran (Nanti bisa fetch dari API /api/payment-methods)
const paymentMethods = ref([
  { 
    id: 1, 
    nama: 'Tunai / Bayar di Kasir', 
    icon: 'bi-cash-stack', 
    deskripsi: 'Pesan dulu, bayar tunai saat di kasir' 
  },
  { 
    id: 2, // Pastikan ID ini sesuai dengan row metode pembayaran Xendit di DB
    nama: 'Pembayaran Digital (Instan)', 
    icon: 'bi-wallet2', // Icon dompet lebih relevan
    deskripsi: 'QRIS, Dana, OVO, ShopeePay, & Virtual Account' 
  },
]);
const selectedPaymentId = ref<number | null>(1); // Default Tunai

// 3. Helper Formatter
const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

// 4. Submit Order
const isLoading = ref(false);

async function submitOrder() {
  if (!selectedPaymentId.value) {
    toast.error("Pilih metode pembayaran dulu!");
    return;
  }

  isLoading.value = true;

  const payload = {
    kode_sesi: customerStore.sesi_kode, 
    nama_pelanggan: customerStore.nama, 
    tenant_id: cartStore.tenantId,
    metode_pembayaran_id: selectedPaymentId.value,
    items: cartStore.items.map(item => ({
      menu_item_id: item.id,
      jumlah: item.qty,
      catatan: item.catatan || '' 
    }))
  };

  try {
    // 1. BUAT PESANAN (Hit PesananController)
    const { data: response, error } = await useFetch<any>(`${config.public.apiHost}/api/public/orders`, {
      method: 'POST',
      body: payload
    });

    if (error.value) throw error.value;

    if (response.value) {
       cartStore.clearCart(); // Kosongkan keranjang segera
       
       // Ambil data pesanan yang baru dibuat
       const orderData = response.value.data.pesanan || response.value.data; 
       
       // 2. CEK METODE PEMBAYARAN
       if (selectedPaymentId.value === 1) {
           // A. JIKA TUNAI: Langsung ke tracking
           toast.success("Pesanan berhasil dibuat!");
           router.push(`/orders/${orderData.kode_pesanan}`);
       } else {
           // B. JIKA DIGITAL: Minta Link Xendit ke Backend (Hit XenditController)
           // Kita gunakan endpoint yang sudah kamu buat di routes
           const { data: xenditResponse, error: xenditError } = await useFetch<any>(
              `${config.public.apiHost}/api/public/pembayaran/${orderData.kode_pesanan}/link`, 
              { method: 'POST' }
           );

           if (xenditResponse.value && xenditResponse.value.invoice_url) {
               // Redirect user ke Xendit
               window.location.href = xenditResponse.value.invoice_url;
           } else {
               // Fallback jika Xendit gagal generate link
               console.error(xenditError.value);
               toast.warning("Pesanan dibuat, tapi gagal memuat pembayaran. Silakan cek di status pesanan.");
               router.push(`/orders/${orderData.kode_pesanan}`);
           }
       }
    }
  } catch (err: any) {
    console.error(err);
    toast.error("Gagal membuat pesanan. " + (err.data?.message || "Coba lagi."));
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="container py-4 pb-5">
    
    <div class="d-flex align-items-center mb-4">
      <button @click="router.back()" class="btn btn-light btn-sm rounded-circle me-3 shadow-sm">
        <i class="bi bi-arrow-left"></i>
      </button>
      <h4 class="fw-bold mb-0">Konfirmasi Pesanan</h4>
    </div>

    <div class="row g-4">
      <div class="col-12 col-lg-8">
        
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <h6 class="text-muted small mb-1">Memesan dari:</h6>
            <h5 class="fw-bold text-primary mb-0"><i class="bi bi-shop me-2"></i> {{ cartStore.tenantName }}</h5>
          </div>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-body p-0">
            <div v-for="(item, index) in cartStore.items" :key="item.id">
              
              <div class="p-3 d-flex gap-3">
                <img :src="item.gambar_url" class="rounded object-fit-cover" style="width: 70px; height: 70px;">
                
                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between mb-1">
                    <h6 class="fw-bold mb-0">{{ item.nama }}</h6>
                    <span class="fw-bold">{{ formatRupiah(item.harga * item.qty) }}</span>
                  </div>
                  
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="text-muted small">{{ item.qty }}x {{ formatRupiah(item.harga) }}</span>
                    
                    <div class="btn-group btn-group-sm border rounded-pill">
                       <button class="btn btn-link text-dark text-decoration-none py-0 px-2" @click="cartStore.decreaseItem(item.id)">-</button>
                       <span class="px-2 align-self-center small fw-bold">{{ item.qty }}</span>
                       <button class="btn btn-link text-primary text-decoration-none py-0 px-2" @click="cartStore.addItem(item, cartStore.tenantId!, cartStore.tenantName)">+</button>
                    </div>
                  </div>

                  <div class="mt-2">
                    <input 
                      v-model="item.catatan" 
                      type="text" 
                      class="form-control form-control-sm bg-light border-0" 
                      placeholder="Catatan (ex: Jangan pedas)..."
                    >
                  </div>
                </div>
              </div>
              
              <hr class="m-0" v-if="index < cartStore.items.length - 1">
            </div>
          </div>
        </div>

      </div>

      <div class="col-12 col-lg-4">
        
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-header bg-white border-0 fw-bold py-3">Metode Pembayaran</div>
          <div class="card-body pt-0">
            <div class="d-flex flex-column gap-2">
              <label 
                v-for="method in paymentMethods" 
                :key="method.id"
                class="d-flex align-items-center p-3 border rounded cursor-pointer transition-hover"
                :class="selectedPaymentId === method.id ? 'border-primary bg-primary bg-opacity-10' : ''"
              >
                <input type="radio" :value="method.id" v-model="selectedPaymentId" class="d-none">
                <i class="bi fs-4 me-3 text-primary" :class="method.icon"></i>
                <div>
                  <div class="fw-bold">{{ method.nama }}</div>
                  <div class="small text-muted">{{ method.deskripsi }}</div>
                </div>
                <i v-if="selectedPaymentId === method.id" class="bi bi-check-circle-fill text-primary ms-auto fs-5"></i>
              </label>
            </div>
          </div>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h6 class="fw-bold mb-3">Ringkasan Pembayaran</h6>
            
            <div class="d-flex justify-content-between mb-2 small">
              <span class="text-muted">Total Harga ({{ cartStore.totalQty }} menu)</span>
              <span>{{ formatRupiah(cartStore.totalPrice) }}</span>
            </div>
            
            <div class="d-flex justify-content-between mb-2 small">
              <span class="text-muted">Biaya Layanan (App)</span>
              <span class="text-success">Gratis</span> </div>

            <hr>

            <div class="d-flex justify-content-between mb-4">
              <span class="fw-bold">Total Bayar</span>
              <span class="fw-bold text-primary fs-5">{{ formatRupiah(cartStore.totalPrice) }}</span>
            </div>

            <button 
              @click="submitOrder" 
              class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isLoading ? 'Memproses...' : 'Buat Pesanan Sekarang' }}
            </button>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.cursor-pointer { cursor: pointer; }
.transition-hover { transition: all 0.2s; }
.transition-hover:hover { background-color: #f8f9fa; }
</style>