# --- STAGE 1: Build Aplikasi React ---
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy sisa source code
COPY . .

# Build aplikasi dengan PLACHOLDER untuk env vars.
# Kita akan mengganti placeholder ini saat kontainer berjalan.
RUN VITE_ENVIRONMENT="Production" \
    VITE_API_BE_URL="__PLACEHOLDER_API_URL__" \
    VITE_SECURE_LOCAL_STORAGE_HASH_KEY="__PLACEHOLDER_HASH_KEY__" \
    yarn build

# --- STAGE 2: Serve dengan Nginx ---
FROM nginx:1.27-alpine

# Salin hasil build dari stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Salin file konfigurasi Nginx kustom
# Ini penting agar React Router (SPA) berfungsi
COPY nginx.conf /etc/nginx/nginx.conf

# Salin script entrypoint yang akan mengganti placeholder env
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Nginx berjalan di port 80
EXPOSE 80

# Jalankan entrypoint.sh (yang kemudian akan menjalankan Nginx)
ENTRYPOINT ["/entrypoint.sh"]