FROM node:12-alpine as base

WORKDIR /var/www/html/services/logger

COPY ./ /var/www/html/services/logger

RUN npm install -g nodemon

RUN npm install && mv /var/www/html/services/logger/node_modules /node_modules
