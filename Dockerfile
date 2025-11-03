# Use a multi-stage build to create a lean final image

# 1. The 'build' stage
# Use a valid Maven image with Eclipse Temurin (formerly AdoptOpenJDK) for Java 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# Copy the pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline
# Copy the rest of the source code and build the application
COPY src ./src
RUN mvn clean install

# 2. The 'run' stage
# Use a slim JRE image for the final container
FROM eclipse-temurin:21-jre
WORKDIR /app
# Copy the executable jar from the build stage
COPY --from=build /app/target/HRMS-0.0.1-SNAPSHOT.jar .
# Expose the port the app runs on
EXPOSE 8080
# Command to run the application
CMD ["java", "-jar", "HRMS-0.0.1-SNAPSHOT.jar"]
