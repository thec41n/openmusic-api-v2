# OpenMusic API v2: Playlist & Authentication Service

Selamat datang di repositori OpenMusic API v2! Ini adalah evolusi dari OpenMusic API sebelumnya, dengan penambahan fitur-fitur krusial untuk pengalaman pengelolaan musik yang lebih personal dan aman.

## 🚀 Goals Proyek

Proyek OpenMusic API v2 ini dibangun dengan tujuan utama untuk:

* **Mengembangkan Fitur Playlist:** Memungkinkan pengguna untuk membuat, melihat, dan mengelola daftar putar (playlist) lagu favorit mereka. Ini termasuk kemampuan untuk menambahkan dan menghapus lagu dari playlist. 
* **Implementasi Sistem Autentikasi dan Otorisasi Pengguna:** Memastikan bahwa pengelolaan playlist bersifat personal (`private`) dan aman, hanya bisa diakses oleh pemiliknya.  Fitur ini mencakup registrasi pengguna, login, pembaruan token akses, dan logout. 
* **Mempertahankan Fitur Inti dari Versi 1:** Semua fungsionalitas pengelolaan album dan lagu dari OpenMusic API versi 1 tetap dipertahankan dan terintegrasi dengan baik di versi 2 ini. 
* **Menerapkan Praktik Pengembangan Backend Terbaik:** Menggunakan Node.js dengan Hapi.js, PostgreSQL sebagai database, dan praktik modularitas, validasi data (Joi), serta penanganan error yang robust. 

Dengan fitur-fitur baru ini, OpenMusic API v2 bertujuan untuk memberikan kontrol lebih kepada pengguna dalam mengelola koleksi musik mereka dan meningkatkan pengalaman mendengarkan.

## 🛠️ Cara Installasi dan Menjalankan Aplikasi

```bash
# Clone repositori ini
git clone https://github.com/thec41n/openmusic-api-v2
cd openmusic-api-v2

# Install dependencies
npm install

# Konfigurasi environment variables
# Buat file .env di root project dan isi dengan konfigurasi database,
# secret key JWT, dan port server. Contoh:
# HOST=localhost
# PORT=5000
# PGHOST=localhost
# PGUSER=postgres
# PGPASSWORD=postgres
# PGDATABASE=openmusic
# PGPORT=5432
# ACCESS_TOKEN_KEY=your_super_secret_access_token_key_here_long_and_random
# REFRESH_TOKEN_KEY=your_super_secret_refresh_token_key_here_long_and_random

# Jalankan migrasi database
# Pastikan PostgreSQL server sudah berjalan dan database 'openmusic' sudah dibuat
npm run migrate up

# Jalankan aplikasi
npm run start

# Aplikasi akan berjalan di http://localhost:5000 (atau port yang dikonfigurasi di .env)