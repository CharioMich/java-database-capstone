# Step 1: Use Maven with JDK 17 to build the app
FROM maven:3.9.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .

# Copy source code
COPY src ./src

# Build the .jar file.
RUN mvn clean package -DskipTests

# Step 2: Use lightweight JRE 17 for running the app
FROM eclipse-temurin:17.0.15_6-jre

WORKDIR /app

# Copy the built JAR from the previous stage
COPY --from=builder /app/target/back-end-0.0.1-SNAPSHOT.jar app.jar
# Expose the port app runs on
EXPOSE 8080
# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]