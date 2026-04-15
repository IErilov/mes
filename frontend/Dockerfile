# Этап сборки (build)
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./
RUN npm ci

# Копируем исходники и собираем приложение
COPY . .
RUN npm run build

# Этап production (Nginx)
FROM nginx:alpine

# Копируем собранные статические файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем кастомный конфиг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]