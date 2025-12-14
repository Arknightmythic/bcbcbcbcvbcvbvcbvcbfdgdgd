## 📋 Prasyarat
Sebelum memulai, pastikan komputer Anda telah terinstal:

- **Node.js** (Disarankan versi LTS, v18 atau v20+)
- **Yarn** (Package manager)
- **Git**

## 🚀 Cara Memulai (Getting Started)

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek ini di lingkungan lokal (local development).

### 1\. Clone Repository

Salin repository ini ke komputer lokal Anda:

```bash
git clone [https://github.com/username-anda/dokuprime-fe.git](https://github.com/username-anda/dokuprime-fe.git)
cd dokuprime-fe
````

### 2\. Instalasi Dependencies

Instal semua paket yang diperlukan menggunakan Yarn:

```bash
yarn install
```

### 3\. Konfigurasi Environment Variable

Proyek ini memerlukan beberapa variabel lingkungan agar dapat berjalan dengan benar (seperti koneksi ke API Backend).

1.  Salin file `.env.example` menjadi `.env`:

    ```bash
    cp .env.example .env
    ```

    *(Atau buat file baru bernama `.env` secara manual)*

2.  Buka file `.env` dan isi variabel berikut sesuai konfigurasi lokal/development Anda:

    ```env
    # URL API Backend (Contoh: http://localhost:8080 atau URL staging)
    VITE_API_BE_URL=http://localhost:8080

    # Environment (Development / Production)
    # Digunakan untuk menentukan penyimpanan token (localStorage vs secureStorage)
    VITE_ENVIRONMENT=Development

    #untuk websocket, perlu menambahkan url dan secret key yang sesuai dengan be websockets
    VITE_WEBSOCKET_URL=
    VITE_WEBSOCKET_SECRET_KEY=
    ```

### 4\. Menjalankan Development Server

Setelah konfigurasi selesai, jalankan server development:

```bash
yarn dev
```

Aplikasi biasanya akan berjalan di `http://localhost:5173` (cek terminal Anda untuk port yang pastinya).

## 🛠️ Script yang Tersedia

Berikut adalah perintah-perintah yang dapat dijalankan dalam proyek ini:

  - `yarn dev`: Menjalankan aplikasi dalam mode development.
  - `yarn build`: Melakukan build aplikasi untuk production.
