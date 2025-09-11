# Usa la imagen oficial de PHP con Apache
FROM php:8.2-apache

# Instala extensiones necesarias y dependencias del sistema en un solo paso
RUN apt-get update && apt-get install -y \
    zlib1g-dev libzip-dev git unzip \
    && docker-php-ext-install pdo pdo_mysql zip \
    && rm -rf /var/lib/apt/lists/*

# Copia los archivos de la aplicación al contenedor
COPY Saborify_BackEnd /var/www/html

# Configura el propietario de los archivos y asigna permisos
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Instala Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Instala las dependencias de Laravel de manera optimizada
RUN composer install --no-interaction --no-progress --optimize-autoloader --working-dir=/var/www/html

# Configurar el sitio web de Apache
RUN a2dissite 000-default.conf \
    && a2enmod rewrite \
    && service apache2 restart

# Expone el puerto 80
EXPOSE 80

# Ejecuta Apache
CMD ["apache2-foreground"]