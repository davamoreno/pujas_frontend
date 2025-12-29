export interface DetailPesanan {
  id: number;
  jumlah: number;
  catatan: string | null;
  menu_item: { nama: string; harga: number };
}

export interface Pesanan {
  id: number;
  kode_pesanan: string;
  status_pesanan: string;
  total_harga: number;
  created_at: string;
  detail_pesanans: DetailPesanan[];
  is_new?: boolean; // Flag untuk menandai pesanan baru dari realtime
}