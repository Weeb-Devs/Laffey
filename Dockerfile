FROM node:lts-alpine3.22 AS builder

WORKDIR /build
COPY . .
RUN npm ci
RUN npm install typescript
RUN npm run build

FROM node:lts-alpine3.22 AS production
WORKDIR /app

COPY --from=builder /build/dist ./
COPY --from=builder /build/package.json ./
COPY --from=builder /build/package-lock.json ./

RUN npm ci --only=production

CMD ["node", "index.js"]