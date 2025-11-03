# HRMS Production Deployment Guide

## Production Readiness Checklist

### ✅ Security Enhancements
- [x] Environment-based configuration (dev/prod profiles)
- [x] Removed hardcoded credentials
- [x] Added security headers (CSP, HSTS, X-Frame-Options)
- [x] Input validation with custom ValidationUtils
- [x] Global exception handling
- [x] Session management and CSRF protection
- [x] File upload security (size/type validation)

### ✅ Monitoring & Observability
- [x] Spring Boot Actuator endpoints
- [x] Prometheus metrics integration
- [x] Structured logging with Logback
- [x] Health checks for Docker
- [x] Audit logging configuration

### ✅ Performance Optimizations
- [x] Connection pooling configuration
- [x] Caching implementation
- [x] Database query optimization
- [x] File upload size limits

### ✅ Error Handling
- [x] Custom error pages (404, 500)
- [x] Global exception handler
- [x] Validation error handling
- [x] User-friendly error messages

### ✅ Documentation
- [x] OpenAPI/Swagger integration
- [x] API documentation
- [x] Deployment documentation

## Environment Variables for Production

### Required Environment Variables
```bash
# Database Configuration
DATABASE_URL=jdbc:postgresql://your-db-host:5432/hrms_db
DATABASE_USERNAME=your_db_user
DATABASE_PASSWORD=your_secure_password

# JWT Security
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here
JWT_EXPIRATION=86400000

# File Storage
FILE_UPLOAD_DIR=/opt/hrms/uploads

# Logging
LOG_FILE=/var/log/hrms/hrms.log

# Server Configuration
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=prod
```

## Deployment Options

### Option 1: Docker Deployment (Recommended)

1. **Build and run with Docker Compose:**
```bash
# Set environment variables
export JWT_SECRET="your_secure_jwt_secret_key_minimum_32_characters"

# Start services
docker-compose up -d
```

2. **Access the application:**
- Application: http://localhost:8080
- API Documentation: http://localhost:8080/swagger-ui.html
- Health Check: http://localhost:8080/actuator/health

### Option 2: Traditional Server Deployment

1. **Build the application:**
```bash
./mvnw clean package -Pprod
```

2. **Set environment variables:**
```bash
export SPRING_PROFILES_ACTIVE=prod
export DATABASE_URL=jdbc:postgresql://your-db:5432/hrms_db
export DATABASE_USERNAME=your_user
export DATABASE_PASSWORD=your_password
export JWT_SECRET=your_secure_jwt_secret
```

3. **Run the application:**
```bash
java -jar target/HRMS-0.0.1-SNAPSHOT.war
```

### Option 3: Cloud Deployment (AWS/Azure/GCP)

1. **Configure cloud database (RDS/Azure SQL/Cloud SQL)**
2. **Set up file storage (S3/Blob Storage/Cloud Storage)**
3. **Configure environment variables in cloud platform**
4. **Deploy using cloud-specific methods**

## Database Setup

### PostgreSQL Production Setup
```sql
-- Create database
CREATE DATABASE hrms_db;

-- Create user with limited privileges
CREATE USER hrms_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE hrms_db TO hrms_user;
GRANT USAGE ON SCHEMA public TO hrms_user;
GRANT CREATE ON SCHEMA public TO hrms_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO hrms_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO hrms_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO hrms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO hrms_user;
```

## SSL/TLS Configuration

### Nginx Configuration (nginx.conf)
```nginx
events {
    worker_connections 1024;
}

http {
    upstream hrms_backend {
        server hrms-app:8080;
    }

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

        location / {
            proxy_pass http://hrms_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## Monitoring Setup

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'hrms'
    static_configs:
      - targets: ['hrms-app:8080']
    metrics_path: '/actuator/prometheus'
```

### Grafana Dashboard
- Import dashboard for Spring Boot applications
- Monitor JVM metrics, HTTP requests, database connections
- Set up alerts for critical metrics

## Backup Strategy

### Database Backup
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U hrms_user hrms_db > /backups/hrms_backup_$DATE.sql
find /backups -name "hrms_backup_*.sql" -mtime +7 -delete
```

### File Storage Backup
```bash
# Backup uploaded files
rsync -av /opt/hrms/uploads/ /backups/uploads/
```

## Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secret (minimum 32 characters)
- [ ] Enable HTTPS in production
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Implement rate limiting
- [ ] Regular penetration testing

## Performance Tuning

### JVM Options for Production
```bash
JAVA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

### Database Connection Pool
```properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check network connectivity
   - Verify credentials
   - Check firewall rules

2. **File Upload Issues**
   - Verify directory permissions
   - Check disk space
   - Validate file size limits

3. **Memory Issues**
   - Monitor JVM heap usage
   - Adjust memory settings
   - Check for memory leaks

### Log Locations
- Application logs: `/var/log/hrms/hrms.log`
- Error logs: `/var/log/hrms/hrms-error.log`
- Access logs: Nginx access logs

## Maintenance

### Regular Tasks
- [ ] Database maintenance (VACUUM, ANALYZE)
- [ ] Log rotation and cleanup
- [ ] Security updates
- [ ] Backup verification
- [ ] Performance monitoring
- [ ] Certificate renewal (if using SSL)

### Update Process
1. Test updates in staging environment
2. Create database backup
3. Deploy during maintenance window
4. Verify functionality
5. Monitor for issues

## Support

For production support:
- Monitor application logs
- Check health endpoints
- Review metrics dashboards
- Contact development team for critical issues