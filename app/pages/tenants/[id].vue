<script setup lang="ts">
import { useCustomerStore } from '~/stores/customer';
import { useCartStore } from '~/stores/cart';

definePageMeta({
  layout: 'customer',
  middleware: 'customer-auth'
});

const route = useRoute();
const config = useRuntimeConfig();
const cartStore = useCartStore();
const tenantId = route.params.id;
const showNoteModal = ref(false);
const selectedMenuForNote = ref<any>(null);
const noteInput = ref('');
const modalQty = ref(1);
// --- MODIFIED ACTIONS ---

// 1. Saat tombol (+) diklik, JANGAN langsung add to cart. Tapi buka modal.
function openAddModal(menu: any) {
  // Set menu yang dipilih
  selectedMenuForNote.value = menu;
  noteInput.value = ''; // Reset catatan
  modalQty.value = 1;
  showNoteModal.value = true; // Munculkan modal
}

// 2. Action Confirm di dalam Modal
function confirmAddToCart() {
  if (!selectedMenuForNote.value || !tenant.value) return;

  // Panggil Store dengan Catatan
  for (let i = 0; i < modalQty.value; i++){
    cartStore.addItem(
      selectedMenuForNote.value, 
      tenant.value.id, 
      tenant.value.nama, 
      noteInput.value // <-- Kirim catatan user
  ) ;
  }
  // Tutup Modal
  showNoteModal.value = false;
  selectedMenuForNote.value = null;
}

// 3. Helper Qty Total (Sum semua varian menu ID tersebut)
function getQtyInCart(menuId: number) {
  // Filter semua item di keranjang yang ID menunya sama, lalu jumlahkan qty-nya
  return cartStore.items
    .filter(i => i.id === menuId)
    .reduce((sum, i) => sum + i.qty, 0);
}

// 4. Decrease (Opsional)
// Karena sekarang 1 menu bisa punya banyak varian catatan, tombol (-) di list menu 
// agak ambigu (mau hapus yang pedas atau yang biasa?).
// Solusi UX: Tombol (-) mengurangi varian terakhir yang masuk, atau disable (-) dan suruh edit di cart.
// Di sini kita pakai cara simpel: panggil decreaseItem store (hapus random variant/terakhir).
function decreaseQty(menuId: number) {
   cartStore.decreaseItem(menuId);
}

// --- 1. FETCH DATA ---
const { data: response, pending, error } = await useFetch<any>(`${config.public.apiHost}/api/public/tenants/${tenantId}`, {
  lazy: true
});

const tenant = computed(() => response.value?.data || null);

// --- 2. LOCAL STATE ---
const searchMenu = ref('');
const activeCategory = ref('Semua');

// --- 3. COMPUTED GROUPING ---
// Kelompokkan menu berdasarkan kategori untuk fitur scroll-to-category
const groupedMenus = computed(() => {
  if (!tenant.value?.menu_items) return {};

  const groups: Record<string, any[]> = {};
  
  tenant.value.menu_items.forEach((item: any) => {
    // Filter Pencarian dulu
    if (searchMenu.value && !item.nama.toLowerCase().includes(searchMenu.value.toLowerCase())) {
      return;
    }

    const catName = item.kategori?.nama || 'Lainnya';
    if (!groups[catName]) groups[catName] = [];
    groups[catName].push(item);
  });

  return groups;
});

const categories = computed(() => {
  if (!tenant.value?.menu_items) return [];
  // Ambil unik kategori dari data
  const cats = new Set(tenant.value.menu_items.map((m: any) => m.kategori?.nama || 'Lainnya'));
  return Array.from(cats);
});

// --- 4. SCROLL LOGIC ---
function scrollToCategory(catName: string) {
  activeCategory.value = catName;
  const element = document.getElementById(`cat-${catName}`);
  if (element) {
    // Offset -120px biar ketutupan sticky header
    const y = element.getBoundingClientRect().top + window.scrollY - 180;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

// --- 5. HELPERS ---
const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
const isBuka = computed(() => tenant.value?.status_operasional?.toUpperCase() === 'BUKA');

function addToCart(menu: any) {
  if(tenant.value) cartStore.addItem(menu, tenant.value.id, tenant.value.nama);
}

// Helper untuk tombol plus minus di dalam modal
function increaseModalQty() {
    if (selectedMenuForNote.value && modalQty.value < selectedMenuForNote.value.qty) {
        modalQty.value++;
    }
}

function decreaseModalQty() {
    if (modalQty.value > 1) {
        modalQty.value--;
    }
}

// function getQtyInCart(menuId: number) {
//   const item = cartStore.items.find(i => i.id === menuId);
//   return item ? item.qty : 0;
// }
</script>

<template>
  <div class="pb-safe-area">
    
    <div v-if="pending" class="container py-4">
        <CustomerSkeletonMenu />
    </div>

    <div v-else-if="error || !tenant" class="container py-5 text-center">
      <img src="https://placehold.co/150x150?text=Not+Found" width="150" class="mb-3 opacity-50 rounded"> 
      <h3>Tenant Tidak Ditemukan</h3>
      <NuxtLink to="/tenants" class="btn btn-primary mt-3">Kembali ke Menu</NuxtLink>
    </div>

    <div v-else>
      
      <div class="position-relative bg-dark text-white" style="height: 220px;">
        <NuxtLink to="/tenants" class="btn btn-dark btn-sm rounded-circle position-absolute top-0 start-0 m-3 shadow-sm z-3" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);">
             <i class="bi bi-arrow-left fs-5"></i>
        </NuxtLink>

        <img :src="tenant.gambar_url || 'https://placehold.co/800x400'" class="w-100 h-100 object-fit-cover opacity-75">
        
        <div class="position-absolute bottom-0 start-0 w-100 p-3 bg-gradient-to-t">
          <div class="container d-flex align-items-end">
            <div class="me-3">
               <img :src="tenant.gambar_url" class="rounded-circle border border-3 border-white shadow bg-white" style="width: 70px; height: 70px; object-fit: cover;">
            </div>
            <div class="text-white mb-1">
              <h2 class="fw-bold mb-0 text-shadow">{{ tenant.nama }}</h2>
              <div class="d-flex align-items-center gap-2 small mt-1">
                <span class="badge" :class="isBuka ? 'bg-success' : 'bg-danger'">{{ isBuka ? 'BUKA' : 'TUTUP' }}</span>
                <span class="badge bg-white text-dark"><i class="bi bi-star-fill text-warning me-1"></i> 4.8</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sticky-top bg-white border-bottom shadow-sm z-2 pt-3 pb-2" style="top: 0px;"> 
        <div class="container">
          <div class="position-relative mb-2">
            <input v-model="searchMenu" type="text" class="form-control rounded-pill ps-5 bg-light border-0" placeholder="Cari di kantin ini...">
            <i class="bi bi-search position-absolute text-muted" style="top: 10px; left: 18px;"></i>
          </div>

          <div class="d-flex gap-2 overflow-auto pb-2 hide-scrollbar">
            <button 
              v-for="cat in categories" 
              :key="cat as string"
              @click="scrollToCategory(cat as string)"
              class="btn btn-sm rounded-pill px-3 fw-bold text-nowrap transition-btn"
              :class="activeCategory === cat ? 'btn-dark text-white' : 'btn-outline-secondary border-0 bg-light text-dark'"
            >
              {{ cat }}
            </button>
          </div>
        </div>
      </div>

      <div class="container mt-3">
        
        <div v-for="(menus, catName) in groupedMenus" :key="catName" :id="`cat-${catName}`" class="mb-4 scroll-mt">
          
          <h5 class="fw-bold mb-3 text-dark border-start border-4 border-primary ps-3">{{ catName }}</h5>

          <div class="row g-3">
            <div class="col-12 col-lg-6" v-for="menu in menus" :key="menu.id">
              <div class="card border-0 shadow-sm h-100 p-2 hover-card">
                <div class="d-flex gap-3 align-items-center">
                  
                  <div class="flex-shrink-0 position-relative">
                    <img :src="menu.gambar_url || 'https://placehold.co/150'" class="rounded" style="width: 90px; height: 90px; object-fit: cover;">
                    <div v-if="!menu.is_tersedia || menu.qty < 1" class="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 rounded d-flex align-items-center justify-content-center">
                      <span class="text-white fw-bold small" style="font-size: 0.6rem;">HABIS</span>
                    </div>
                  </div>

                  <div class="flex-grow-1">
                    <h6 class="fw-bold mb-1 text-dark">{{ menu.nama }}</h6>
                    <p class="text-muted small mb-1 text-truncate-2" style="line-height: 1.2;">{{ menu.deskripsi || 'Rasa mantap jiwa.' }}</p>
                    
                    <div class="d-flex justify-content-between align-items-end mt-2">
             <span class="text-dark fw-bold">{{ formatRupiah(menu.harga) }}</span>
             
             <div class="d-flex align-items-center gap-2">
               
               <template v-if="getQtyInCart(menu.id) > 0">
                   <button class="btn btn-sm btn-outline-danger rounded-circle p-0" style="width: 28px; height: 28px;" 
                     @click="decreaseQty(menu.id)">
                     <i class="bi bi-dash"></i>
                   </button>
                   <span class="fw-bold small" style="min-width: 20px; text-align: center;">
                      {{ getQtyInCart(menu.id) }}
                   </span>
               </template>
             
               <button 
                 class="btn btn-sm rounded-circle p-0 shadow-sm transition-btn"
                 style="width: 28px; height: 28px;"
                 :class="getQtyInCart(menu.id) > 0 ? 'btn-primary text-white' : 'btn-outline-primary'"
                 :disabled="!menu.is_tersedia || menu.qty < 1 || !isBuka" 
                 @click="openAddModal(menu)" 
               >
                 <i class="bi bi-plus-lg"></i>
               </button>
             </div>
        </div>
        
        </div>

    <Transition name="slide-up">
      <div v-if="showNoteModal && selectedMenuForNote" class="fixed-bottom z-index-modal">
        
        <div class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" @click="showNoteModal = false"></div>
        
        <div class="bg-white rounded-top-4 p-4 position-relative shadow-lg" style="z-index: 1060;">
          
          <div class="d-flex justify-content-center mb-3">
            <div class="bg-secondary rounded-pill bg-opacity-25" style="width: 40px; height: 4px;"></div>
          </div>

          <div class="d-flex gap-3 mb-4">
             <img :src="selectedMenuForNote.gambar_url || 'https://placehold.co/150'" class="rounded" width="60" height="60" style="object-fit: cover;">
             <div>
                <h5 class="fw-bold mb-1">{{ selectedMenuForNote.nama }}</h5>
                <div class="text-primary fw-bold">{{ formatRupiah(selectedMenuForNote.harga) }}</div>
             </div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-bold small text-muted">Tambahkan Catatan (Opsional)</label>
            <textarea 
              v-model="noteInput"
              class="form-control bg-light border-0" 
              rows="2" 
              placeholder="Contoh: Pedas, Jangan pakai sayur..."
              autofocus
            ></textarea>
            <div class="form-text text-end small">{{ noteInput.length }}/100</div>
          </div>

          <div class="d-flex align-items-center gap-3">
              
              <div class="d-flex align-items-center border rounded-pill px-2 py-1">
                  <button class="btn btn-sm btn-link text-dark text-decoration-none" @click="decreaseModalQty">
                      <i class="bi bi-dash fs-5"></i>
                  </button>
                  
                  <span class="fw-bold mx-2" style="min-width: 20px; text-align: center;">{{ modalQty }}</span>
                  
                  <button class="btn btn-sm btn-link text-dark text-decoration-none" @click="increaseModalQty">
                      <i class="bi bi-plus fs-5"></i>
                  </button>
              </div>

              <button 
                @click="confirmAddToCart" 
                class="btn btn-primary flex-grow-1 py-3 rounded-pill fw-bold shadow"
              >
                Tambah - {{ formatRupiah(selectedMenuForNote.harga * modalQty) }}
              </button>
          </div>

        </div>
      </div>
    </Transition>

  </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>

        <div v-if="Object.keys(groupedMenus).length === 0" class="text-center py-5">
           <i class="bi bi-emoji-frown fs-1 text-muted mb-2"></i>
           <p class="text-muted">Menu tidak ditemukan.</p>
        </div>

    <CustomerFloatingCart /> 
    
  </div>
</template>

<style scoped>
/* Styling Tambahan */
.bg-gradient-to-t { background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); }
.text-shadow { text-shadow: 0 2px 4px rgba(0,0,0,0.6); }
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.text-truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* Transisi halus */
.transition-btn { transition: all 0.2s; }
.transition-btn:active { transform: scale(0.9); }

/* Padding safe area agar konten paling bawah tidak ketutupan Bottom Nav + Floating Cart */
.pb-safe-area {
  padding-bottom: 140px; /* 70px (BottomNav) + 60px (FloatingCart) + 10px (Space) */
}

.z-index-modal {
  z-index: 1055; /* Di atas Navbar & Floating Cart */
}

/* Animasi Slide Up untuk Modal */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>