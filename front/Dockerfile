FROM node:18 AS build

WORKDIR /app

# Copia solo archivos de dependencias primero (optimiza caché)
COPY ./Saborify-FrontEnd/package.json ./Saborify-FrontEnd/package-lock.json ./

# Forzar reinstalación limpia de dependencias
RUN npm cache clean --force && npm install

# Luego copia el código fuente
COPY ./Saborify-FrontEnd . 

# Construcción
RUN npm run build

# Usa Nginx para servir la aplicación
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
