import {defineStore} from 'pinia';


interface Role {
  id: number;
  nama: string;
}

interface Tenant {
  id: number;
  nama: string;
  gambar_url: string | null;
  status: string;
}

interface StaffState {
    nama : string;
    username : string;
    password : string;
    role_id : Role | null;
    tenant_id : Tenant | null;
    staffList : any;
}