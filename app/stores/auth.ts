// stores/auth.ts
import { defineStore } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

// ... (Interface User tetap sama)
interface User {
  id: number;
  nama: string;
  username: string;
  role: string;
  tenant: {
    id: number;
    nama: string;
  } | null;
}
interface AuthState {
  token: string | null;
  user: User | null;
  maxAge: number;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => (
    {
    token: null,
    user: null,
    maxAge: 0,
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
      this.maxAge = 60 * 60 * 24; // 1 hari
      
      const router = useRouter();
      await router.push('/admin/dashboard');
    },

    logout() {
        const API_BASE_URL = 'http://localhost:8000';

        useFetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json',
        }});

        this.token = null;
        this.user = null;
        this.maxAge = 0; // reset maxAge
        
        const router = useRouter();
        router.push('/admin/login');
    },
  },

  persist: {
    storage: createPersistedState().cookieStorage,
    pick : ['token', 'user']
  },
});