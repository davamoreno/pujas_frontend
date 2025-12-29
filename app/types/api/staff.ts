import type { Role } from './role';

export interface Staff {
    id          : number;
    nama        : string;
    username    : string;
    role        : Role | null;
}