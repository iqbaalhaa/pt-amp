ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

ARG NODE_ENV=production
ARG DATABASE_URL

# Copy manifests, install deps at build time (including dev deps for build tooling)
COPY package*.json ./
RUN npm install --include=dev

# Copy application source (excluding node_modules via .dockerignore)
COPY . .

# Set runtime environment variables from build args
ENV NODE_ENV=${NODE_ENV}
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Generate Prisma client and build Next.js app at image build time.
RUN npx prisma generate && npm run build

EXPOSE 3000

# On container start: sync schema and start app (no rebuild)
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run start"]
