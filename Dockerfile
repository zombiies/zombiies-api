FROM node:lts AS npm7
WORKDIR /app
RUN npm install -g npm@7

FROM npm7 AS dependences

COPY package*.json ./
RUN npm ci --only=production

FROM npm7 AS builder

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:lts AS runner
RUN groupadd -g 999 user && \
    useradd -r -u 999 -g user user
USER user

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY --from=dependences /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
