// Definisikan interface User
interface User {
  id: number;
  nama: string;
  username: string;
  role: string;
  tenant: {
    id: number;
    nama: string;
    is_active: boolean;
  };
}

// Gunakan useCookie. 
// useCookie<TipeData>(key, options)
// 'authToken' akan menjadi nama cookie-nya.
export const useAuthToken = () => useCookie<string | null>('authToken', { 
  default: () => null,
  maxAge: 60 * 60 * 24 // 1 hari
});

// 'authUser' akan menjadi nama cookie-nya.
export const useAuthUser = () => useCookie<User | null>('authUser', { 
  default: () => null,
});

// Fungsi logout tetap sama, tapi sekarang akan membersihkan cookie
export const useAuth = () => {
  const token = useAuthToken();
  const user = useAuthUser();
  const router = useRouter();
  const API_BASE_URL = 'http://localhost:8000';

  // const login = (username: string, password: string) => {
  //   const response = useFetch(`${API_BASE_URL}/api/auth/login`, {
  //     method: 'POST',
  //     body: { username, password },
  //     headers: {
  //       'Accept': 'application/json',
  //     },
  //   });

  //   if (response.status == 200) {
  //     token.value = response.data.access_token;
  //     user.value = response.data.user;
  //     router.push('/dashboard');
  //   } else {
  //     throw new Error('Login gagal: ' + response.statusText);
  //   }
  // };

  const logout = () => {
    useFetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', headers: {
      'Authorization': `Bearer ${token.value}`,
      'Accept': 'application/json',
    }});

    token.value = null;
    user.value = null;

    router.push('/admin/login');
  };

  return {
    logout,
    // login,
    token,
    user,
  };
};