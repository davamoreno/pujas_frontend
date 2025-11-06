// plugins/echo.client.ts

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export default defineNuxtPlugin(() => {
  // 1. Ambil state token kita (yang dari useCookie)
  const authToken = useAuthToken();

  // 2. Dapatkan konfigurasi dari runtimeConfig
  const config = useRuntimeConfig();

  // 3. Beritahu Echo cara menemukan library Pusher
  (window as any).Pusher = Pusher;

  // 4. Buat instance Echo baru
  const echo = new Echo({
    broadcaster: 'reverb',
    key: config.public.reverbAppKey,
    wsHost: config.public.reverbHost,
    wsPort: config.public.reverbPort,
    wssPort: config.public.reverbPort,
    forceTLS: config.public.reverbScheme === 'https',
    enabledTransports: ['ws', 'wss'],

    // --- INI ADALAH TAMBAHAN PENTING ---
    // Memberitahu Echo cara mengautentikasi koneksi private channel
    // @ts-ignore
    authEndpoint: `${config.public.apiHost}/broadcasting/auth`,
    auth: {
      headers: {
        // Kirim token JWT kita di header
        'Authorization': `Bearer ${authToken.value}`,
        'Accept': 'application/json',
      },
    },
    // --- AKHIR DARI TAMBAHAN ---
  });

  // 5. Sediakan instance Echo
  return {
    provide: {
      echo: echo
    }
  };
});