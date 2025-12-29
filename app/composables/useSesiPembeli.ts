export default function useSesiPembeli() {
  const config = useRuntimeConfig();

  // Interface Response Backend (Biar autocomplete jalan)
  interface SesiResponse {
    message: string;
    data: {
      id: number;
      kode_sesi: string;
      nama: string;
      is_closed: boolean;
    };
  }

  const createSession = async (nama: string) => {
    return await $fetch<SesiResponse>(`${config.public.apiHost}/api/public/sesi-pembeli`, {
      method: 'POST',
      body: { nama }
    });
  };

  const showSession = async (identifier: string | number) => {
    return await $fetch<SesiResponse>(`${config.public.apiHost}/api/public/sesi-pembeli/${identifier}`);
  };

  const closeSession = async (identifier: string | number) => {
    return await $fetch(`${config.public.apiHost}/api/public/sesi-pembeli/${identifier}/close`, {
      method: 'PUT'
    });
  };

  return { createSession, showSession, closeSession };
}