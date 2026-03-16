FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_API_URL=http://localhost:8080
ARG VITE_SOCKET_URL=http://localhost:8080
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R app:app /usr/share/nginx/html /var/cache/nginx /var/run /etc/nginx/conf.d
USER app
EXPOSE 8080
CMD ["nginx","-g","daemon off;"]
