# Imagen base de Node.js
FROM node:20

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto del proyecto al contenedor
COPY . .

# Exponer el puerto donde correrá el servidor
EXPOSE 5012

# Comando para ejecutar el backend
CMD ["node", "server.js"]
