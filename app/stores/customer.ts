import { defineStore } from 'pinia';

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    nama: '',
    meja: '',
    sesi_kode: '' as string | null,
    expired_at: false as string | false,
  }),

  getters: {
    isGuestRegistered: (state) => !!state.nama && !!state.nama,
  },

  actions: {
    async registerGuest(inputNama: string)  {
      const config = useRuntimeConfig();
      
      try {
        const { data, error } = await useFetch<any>(`${config.public.apiHost}/api/public/sesi-pembeli`, {
          method: 'POST',
          body: { nama: inputNama },
        });

        if (error.value) {
          throw new Error(`Error registering guest: ${error.value.message}`);
        }

        // const sesiData = data.value?.data.data;
        // if (sesiData) {
        //   this.nama = inputNama;
        //   this.sesi_kode = sesiData.kode;
        //   this.expired_at = sesiData.expired_at;
        // }


        const sesi = data.value.data; // Response backend: { data: { kode_sesi: '...', ... } }
        
        this.nama = sesi.nama;
        this.sesi_kode = sesi.kode_sesi;
        this.expired_at = sesi.expired_at;

        return true;
      }
      catch (err) {
        console.error('Gagal mendaftar tamu:', err);
        return false;
      }
    },
    async closeSession() {
      const config = useRuntimeConfig();
      
      if (!this.sesi_kode) return;

      try {
        await $fetch(`${config.public.apiHost}/api/public/sesi-pembeli/${this.sesi_kode}/close`, {
          method: 'PUT',
        });
      }
      catch (err) {
        console.error('Gagal menutup sesi tamu:', err);
      }
      finally {
        // Reset state lokal
        this.nama = '';
        this.meja = '';
        this.sesi_kode = null;
        this.expired_at = false;

        navigateTo('/');
      }
    }
},

  persist: {
    pick : ['nama', 'meja', 'sesi_kode', 'expired_at'], 
  },
});