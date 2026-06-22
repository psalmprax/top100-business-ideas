# Build stage
FROM golang:1.25.1-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/api

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates curl

WORKDIR /app

COPY --from=builder /app/main .

# Create non-root user
RUN addgroup -S appuser && adduser -S -G appuser appuser
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

CMD ["./main"]
