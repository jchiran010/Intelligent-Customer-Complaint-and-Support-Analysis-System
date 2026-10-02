# Multi-stage Docker build for Intelligent Customer Complaint & Support Analysis System

# Stage 1: Build Java 21 Spring Boot application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy Maven descriptor and source code
COPY backend/pom.xml backend/
COPY backend/src backend/src
COPY frontend frontend

# Build executable jar skipping test execution for quick build
WORKDIR /app/backend
RUN mvn clean package -DskipTests

# Stage 2: Minimal JRE 21 Runtime Image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy compiled jar and frontend assets
COPY --from=build /app/backend/target/*.jar app.jar
COPY frontend /app/frontend

# Expose default Spring Boot port
EXPOSE 8080

# Run Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
