FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/hdim-validation/browser /usr/share/nginx/html
COPY src/env.template.js /usr/share/nginx/html/env.template.js
EXPOSE 8080
CMD ["/bin/sh", "-c", "envsubst '$API_GATEWAY_URL $WS_ENDPOINT' < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js && nginx -g 'daemon off;'"]
