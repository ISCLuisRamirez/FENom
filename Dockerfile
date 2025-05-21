FROM node:14-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

FROM nginx:1.21-alpine
COPY --from=build /app/dist/vuexy /usr/share/nginx/html/angular-app
RUN mkdir -p /etc/nginx/conf.d
COPY nginx/angular-app.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
