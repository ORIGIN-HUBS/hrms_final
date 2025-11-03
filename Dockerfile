FROM openjdk:21-jdk-slim

# Set working directory
WORKDIR /app

# Install required packages
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make mvnw executable
RUN chmod +x ./mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build application
RUN ./mvnw clean package -DskipTests

# Create directories for uploads and logs
RUN mkdir -p /opt/hrms/uploads /var/log/hrms

# Create non-root user
RUN groupadd -r hrms && useradd -r -g hrms hrms
RUN chown -R hrms:hrms /opt/hrms /var/log/hrms /app

# Switch to non-root user
USER hrms

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "target/HRMS-0.0.1-SNAPSHOT.war"]