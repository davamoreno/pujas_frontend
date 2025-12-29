
interface LowStockItems{
    nama    : string;
    qty     : number;
}

export interface DashboardStats {
    total_income        : number;
    total_tenants       : number;
    total_menu_items    : number;
    total_transactions  : number;
    low_stock_items     : LowStockItems[];
}