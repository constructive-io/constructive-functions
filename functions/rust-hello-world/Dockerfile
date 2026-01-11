# Multi-stage build for Rust functions
FROM rust:1.83-alpine AS builder

WORKDIR /build

# Install build dependencies
RUN apk add --no-cache musl-dev

# Copy dependency manifests first (for layer caching)
COPY Cargo.toml ./

# Create dummy src to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -rf src

# Copy actual source code
COPY src ./src

# Build the actual binary
RUN touch src/main.rs && cargo build --release

# Runtime stage - minimal Alpine image
FROM alpine:3.19

WORKDIR /usr/src/app

# Copy the compiled binary from builder
COPY --from=builder /build/target/release/rust-hello-world ./app

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser && \
    chown -R appuser:appuser /usr/src/app

ENV PORT=8080

USER appuser

EXPOSE 8080

CMD ["./app"]
