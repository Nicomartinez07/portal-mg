FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Copiar schema de Prisma. Asumimos que el schema.prisma principal
# es el que se usa para este entorno y YA ESTÁ AJUSTADO PARA MYSQL.
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci

# Generar Prisma Client (basado en el .env que se le pasará en el build)
# Usamos --schema para ser explícitos
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copiar todo el código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Exponer el puerto de Next.js
EXPOSE 3000

# Comando por defecto para iniciar la app
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]