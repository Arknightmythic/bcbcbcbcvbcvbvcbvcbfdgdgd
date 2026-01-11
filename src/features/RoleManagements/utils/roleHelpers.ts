// 1. Daftar permission khusus yang tidak berakhiran :read
// Key = nama permission di database, Value = Label yang ingin ditampilkan di UI
export const SPECIAL_PERMISSIONS: Record<string, string> = {
  'helpdesk:toggle-helpdesk': 'Switch Helpdesk Status', 
  // Contoh untuk masa depan:
  // 'transaction:approve': 'Approval Transaksi',
};

// 2. Helper untuk menentukan apakah permission boleh ditampilkan
export const shouldShowPermission = (name: string): boolean => {
  // Cek apakah permission ada di daftar khusus
  if (name in SPECIAL_PERMISSIONS) {
    return true;
  }
  // Fallback ke logika lama (hanya yang berakhiran :read)
  return name.endsWith(':read');
};

// 3. Helper untuk memformat nama permission menjadi label UI yang cantik
export const formatPermissionLabel = (name: string): string => {
  // Jika ada di daftar khusus, gunakan label yang sudah didefinisikan
  if (SPECIAL_PERMISSIONS[name]) {
    return SPECIAL_PERMISSIONS[name];
  }
  // Logic lama: ubah :read menjadi :access
  return name.replace(':read', ':access');
};