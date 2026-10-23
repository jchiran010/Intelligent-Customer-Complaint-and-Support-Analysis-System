# Multi-stage Docker build for Intelligent Customer Complaint & Support Analysis System
# Cloud Deployment: Railway, Render, Docker Hub, Fly.io, AWS, Azure

# Stage 1: Build Application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies
COPY backend/pom.xml backend/
WORKDIR /app/backend
RUN mvn dependency:go-offline -B || true

# Copy sources and build package
WORKDIR /app
COPY backend/src backend/src
COPY frontend frontend

WORKDIR /app/backend
RUN mvn clean package -DskipTests

# Stage 2: Production JRE 21 Runtime Image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root security user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy compiled jar and frontend assets
COPY --from=build /app/backend/target/*.jar app.jar
COPY frontend /app/frontend

# Assign ownership
RUN chown -R appuser:appgroup /app
USER appuser

# Cloud platforms automatically pass PORT environment variable
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=default
EXPOSE 8080

# Execute with dynamic port assignment and container memory awareness
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT} -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE} -jar app.jar"]
