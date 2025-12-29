import type { Kategori } from "./kategori";

export interface MenuItem {
  id                : number;
  nama              : string;
  kategori          : Kategori | null;
  deskripsi         : string | null;
  harga             : number;
  qty               : number;
  is_tersedia       : boolean;
  gambar_url        : string | null;
  tenant            : string | null;
  status_kehalalan  : string | null;
  created_at        : string;
  updated_at        : string;
}