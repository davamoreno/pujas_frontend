import { defineStore } from 'pinia';

// ... (Interface User tetap sama)
interface User {
  id: number;
  nama: string;
  username: string;
  role: string;
  tenant: {
    id: number;
    nama: string;
    status_operasional: string | null;
  } | null;
}
interface AuthState {
  token: string | null;
  user: User | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => (
    {
    token: null,
    user: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'Admin',
    isPemilikTenant: (state) => state.user?.role === 'Pemilik Tenant',
  },
  
  // 2. 'actions' SUDAH ADA. Error TS-mu ('Property 'login' does not exist')
  //    akan HILANG setelah kita memperbaiki error 'persist' di bawah.
  actions: {
    
    async login(loginData: { access_token: string; user: User }) {
      this.token = loginData.access_token;
      this.user = loginData.user;
      
      const router = useRouter();
      await router.push('/admin/dashboard');
    },

    logout() {
        const config = useRuntimeConfig();

        $fetch(`${config.public.apiHost}/api/auth/logout`, { method: 'POST', headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json',
        }});

        this.token = null;
        this.user = null;

        const router = useRouter();
        router.push('/admin/login');
    },
    async refreshUser() {
      if (!this.token) return;
      const config = useRuntimeConfig();
      try {
        const updatedUser = await $fetch<User>(`${config.public.apiHost}/api/auth/refresh-user-data`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json',
          },
        });
        this.user = updatedUser;
      } catch (error) {
        console.error('Gagal memperbarui data user:', error);
      }
    },
  },


  /** 
   * Baca dokumentasi untuk pinia-plugin-persistedstate:
   https://github.com/prazdevs/pinia-plugin-persistedstate/blob/main/docs/frameworks/nuxt.md
   3. Tambahkan konfigurasi 'persist' di sini 
  */
  persist: {
    pick: ['token', 'user'],
  },
});