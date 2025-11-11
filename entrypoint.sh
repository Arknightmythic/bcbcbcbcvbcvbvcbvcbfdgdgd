#!/bin/sh
# /entrypoint.sh

echo "Memulai script entrypoint untuk substitusi env..."

# Temukan semua file JavaScript di dalam folder assets
# (Vite menempatkan file JS yang di-build di /assets)
for file in /usr/share/nginx/html/assets/*.js;
do
  echo "Memproses $file ...";
  
  # Ganti placeholder dengan nilai variabel lingkungan dari Kubernetes
  # Kita gunakan delimiter '|' agar tidak bentrok dengan URL (http://)
  
  # Ganti VITE_API_BE_URL
  sed -i 's|__PLACEHOLDER_API_URL__|'$VITE_API_BE_URL'|g' $file
  
  # Ganti VITE_SECURE_LOCAL_STORAGE_HASH_KEY
  sed -i 's|__PLACEHOLDER_HASH_KEY__|'$VITE_SECURE_LOCAL_STORAGE_HASH_KEY'|g' $file

done

echo "Substitusi selesai. Memulai Nginx..."
# Jalankan perintah CMD default dari image Nginx (mulai server)
nginx -g 'daemon off;'