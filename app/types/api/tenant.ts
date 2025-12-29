// Interface untuk Tenant
import type { Staff } from './staff';

export interface Tenant {
  id            : number;
  nama          : string;
  staff         : Staff | null;
  gambar_url    : string | null;
  status        : string;
  is_active     : boolean;
  current_page  : number;
  last_page     : number;
  from          : number;
  to            : number;
  total         : number;
  per_page      : number;
  prev_page_url : string | null;
  next_page_url : string | null;
}