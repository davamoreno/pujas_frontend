// import { defineStore } from 'pinia';

// Interface Item di Keranjang
export interface CartItem {
  id: number; // ID Menu Item
  nama: string;
  harga: number;
  gambar_url: string;
  qty: number;
  catatan?: string;
  max_qty?: number; // Untuk validasi stok
}

// export const useCartStore = defineStore('cart', {
//   state: () => ({
//     items: [] as CartItem[],
//     tenantId: null as number | null,
//     tenantName: '' as string, // Untuk display "Anda memesan dari Warung X"
//   }),

//   getters: {
//     // Hitung Total Item
//     totalQty: (state) => state.items.reduce((acc, item) => acc + item.qty, 0),
    
//     // Hitung Total Harga
//     totalPrice: (state) => state.items.reduce((acc, item) => acc + (item.harga * item.qty), 0),
    
//     // Cek apakah keranjang kosong
//     isEmpty: (state) => state.items.length === 0,
//   },

//   actions: {
//     /**
//      * Menambah Item ke Keranjang
//      * Logic: 
//      * 1. Cek apakah tenant sama? Kalau beda, konfirmasi hapus cart lama.
//      * 2. Cek apakah item sudah ada? Kalau ada, tambah qty.
//      * 3. Kalau belum, push item baru.
//      */
//     addItem(menu: any, currentTenantId: number, currentTenantName: string) {
      
//       // 1. Validasi Tenant (Harus dari toko yang sama)
//       if (this.tenantId !== null && this.tenantId !== currentTenantId) {
//         const confirmReset = confirm(
//           `Keranjang berisi menu dari "${this.tenantName}". Ganti ke "${currentTenantName}"? Menu sebelumnya akan dihapus.`
//         );
        
//         if (!confirmReset) return false; // Batal tambah
//         this.clearCart(); // Reset jika user setuju ganti toko
//       }

//       // Set Info Tenant saat ini
//       this.tenantId = currentTenantId;
//       this.tenantName = currentTenantName;

//       // 2. Cari item di keranjang
//       const existingItem = this.items.find((i) => i.id === menu.id);

//       if (existingItem) {
//         // Cek stok (optional, tapi bagus buat UX)
//         if (menu.qty && existingItem.qty >= menu.qty) {
//             alert("Stok tidak mencukupi untuk menambah lagi.");
//             return false;
//         }
//         existingItem.qty++;
//       } else {
//         // Item baru
//         this.items.push({
//           id: menu.id,
//           nama: menu.nama,
//           harga: menu.harga,
//           gambar_url: menu.gambar_url,
//           qty: 1,
//           catatan: '',
//           max_qty: menu.qty // Simpan stok maksimal buat validasi nanti
//         });
//       }
      
//       return true;
//     },

//     // Kurangi Qty (Hapus jika 0)
//     decreaseItem(itemId: number) {
//       const index = this.items.findIndex((i) => i.id === itemId);
//       if (index !== -1) {
//         if (this.items[index].qty > 1) {
//           this.items[index].qty--;
//         } else {
//           this.items.splice(index, 1); // Hapus dari array
//         }
//       }
      
//       // Jika items habis, reset tenant info juga
//       if (this.items.length === 0) {
//         this.clearCart();
//       }
//     },

//     // Hapus spesifik item
//     removeItem(itemId: number) {
//       this.items = this.items.filter((i) => i.id !== itemId);
//       if (this.items.length === 0) this.clearCart();
//     },

//     // Reset Total
//     clearCart() {
//       this.items = [];
//       this.tenantId = null;
//       this.tenantName = '';
//     }
//   },

import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as any[],
    tenantId: null as string | null,
    tenantName: '' as string,
  }),

  getters: {
    totalQty: (state) => state.items.reduce((acc, item) => acc + item.qty, 0),
    totalPrice: (state) => state.items.reduce((acc, item) => acc + (item.harga * item.qty), 0),
    isEmpty: (state) => state.items.length === 0,
  },

  actions: {
    // [PERBAIKAN] Terima parameter 'catatan'
    addItem(item: any, tId: string, tName: string, note: string = '') {
      
      // 1. Validasi Tenant (Tidak boleh pesan beda kantin sekaligus)
      if (this.tenantId && this.tenantId != tId) {
        if (!confirm(`Ganti kantin? Keranjang dari ${this.tenantName} akan dihapus.`)) return;
        this.clearCart();
      }

      this.tenantId = tId;
      this.tenantName = tName;

      // 2. Cek apakah menu INI dengan catatan YANG SAMA sudah ada?
      // Kita normalize note (trim & lowercase) biar "Pedas" dan "pedas " dianggap sama
      const normalizedNote = note.trim();
      
      const existingItem = this.items.find(i => 
        i.id === item.id && (i.catatan || '').trim() === normalizedNote
      );

      if (existingItem) {
        // Kalau persis sama, tambah qty aja
        existingItem.qty++;
      } else {
        // Kalau beda catatan (atau belum ada), buat baris baru
        // Kita butuh 'cartId' unik untuk v-for di list nanti (karena item.id bisa kembar)
        this.items.push({
          ...item,
          qty: 1,
          catatan: normalizedNote, // Simpan catatan di sini
          cartItemId: Date.now() + Math.random() // ID Unik untu keranjang
        });
      }
    },

    decreaseItem(menuId: number) {
      // Logic decrease agak tricky kalau ada banyak varian.
      // Sederhananya: Hapus varian yang terakhir ditambahkan (atau paling bawah)
      // Atau idealnya, decrease dilakukan di halaman Checkout. 
      // Untuk quick action di menu list, kita kurangi total qty secara umum (opsional).
      
      // TAPI, saran saya untuk tombol (-) di list menu:
      // Arahkan user untuk mengurangi lewat Checkout/Cart list detail 
      // agar mereka tau varian mana yang dihapus.
      
      // Versi simpel: Cari item dgn menuId ini, kurangi qty salah satunya
      const index = this.items.findIndex(i => i.id === menuId);
      if (index !== -1) {
        if (this.items[index].qty > 1) {
          this.items[index].qty--;
        } else {
          this.items.splice(index, 1);
        }
      }
      
      if (this.items.length === 0) {
        this.clearCart();
      }
    },

    clearCart() {
      this.items = [];
      this.tenantId = null;
      this.tenantName = '';
    }
  },

  // Persist agar keranjang tidak hilang saat refresh
  persist: {
    pick : ['items', 'tenantId', 'tenantName'],
  },
});