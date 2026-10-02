# Lightweight production container for Intelligent Customer Complaint & Support Analysis System
FROM node:20-alpine

WORKDIR /app

# Copy project files
COPY . .

# Build static assets to public directory
RUN node build.js

# Configure environment port (Vercel assigns PORT dynamically, defaults to 80)
ENV PORT=80
EXPOSE 80

# Start high-performance Node.js production server
CMD ["node", "server.js"]
