# Docker Deployment Guide

This directory contains the containerization assets for the **Intelligent Customer Complaint & Support Analysis System**.

## Building the Docker Container

Run from the project root directory:

```bash
docker build -f docker/Dockerfile -t intelligent-complaint-system:latest .
```

## Running the Docker Container

```bash
docker run -p 8080:8080 intelligent-complaint-system:latest
```

Once started, access the application at `http://localhost:8080`.
