# Stage 1: build dell'app React con Node (come lo stage "build" del backend)
FROM node:22-alpine AS build
WORKDIR /app

# Prima solo i manifest, così lo strato di "npm ci" resta in cache finché non cambiano le dipendenze
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_API_URL viene "incollato" nei file JS durante la build: è l'URL che usa il BROWSER,
# quindi è quello pubblico (localhost), non il nome del servizio nella rete di compose
ARG VITE_API_URL=http://localhost:5250
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: solo i file statici, serviti da nginx (niente Node nell'immagine finale)
FROM nginx:1.27-alpine AS final
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
