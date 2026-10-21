FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .

# Expose Vite dev server
EXPOSE 5173

# Vite doit écouter toutes les interfaces dans un conteneur
ENV HOST=0.0.0.0

# Le proxy cible peut être surchargé par la variable VITE_API_PROXY_TARGET
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]