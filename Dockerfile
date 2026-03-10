# Build stage
FROM node:24-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    curl \
    build-base \
    perl \
    llvm-dev \
    clang-dev

# Allow linking libclang on musl
ENV RUSTFLAGS="-C target-feature=-crt-static"
# Use clang instead of gcc to avoid compiler bugs
ENV CC=clang
ENV CXX=clang++

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

ARG POSTHOG_API_KEY
ARG POSTHOG_API_ENDPOINT
ARG VK_SHARED_API_BASE="https://api.vibekanban.com"

ENV VITE_PUBLIC_POSTHOG_KEY=$POSTHOG_API_KEY
ENV VITE_PUBLIC_POSTHOG_HOST=$POSTHOG_API_ENDPOINT
ENV VK_SHARED_API_BASE=$VK_SHARED_API_BASE
ENV VITE_VK_SHARED_API_BASE=$VK_SHARED_API_BASE

WORKDIR /app

# Copy package files first for dependency caching
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/local-web/package*.json ./packages/local-web/
COPY packages/web-core/package*.json ./packages/web-core/
COPY packages/ui/package*.json ./packages/ui/
COPY packages/remote-web/package*.json ./packages/remote-web/
COPY npx-cli/package*.json ./npx-cli/

RUN npm install -g pnpm && pnpm install

# Copy all source code
COPY . .

# Build frontend and backend
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN pnpm run generate-types
RUN cd packages/local-web && pnpm run build
RUN cargo build --release --bin server

# -----------------------------------------------------------
# Runtime stage
# -----------------------------------------------------------
FROM alpine:latest AS runtime

# git is required for worktree/branch operations at runtime
RUN apk add --no-cache \
    ca-certificates \
    tini \
    libgcc \
    git \
    wget

# Create app user with a real home directory (needed by ProjectDirs / XDG)
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S -G appgroup -h /home/appuser appuser

COPY --from=builder /app/target/release/server /usr/local/bin/server

# Directories the server writes to at runtime
RUN mkdir -p /repos /home/appuser/.local/share && \
    chown -R appuser:appgroup /repos /home/appuser

USER appuser
ENV HOME=/home/appuser
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

WORKDIR /repos

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider "http://localhost:${PORT:-3000}" || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["server"]
