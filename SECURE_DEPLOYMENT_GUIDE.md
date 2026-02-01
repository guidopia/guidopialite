# 🔒 Secure Deployment Guide for Guidopia Lite

This guide ensures your Guidopia Lite application is deployed securely with proper protection for sensitive data like OpenAI API keys.

## 🚨 Security Overview

Guidopia Lite implements a secure architecture where:
- **OpenAI API keys are stored ONLY in the backend environment**
- **Frontend communicates through secure backend endpoints**
- **API keys are never exposed to client-side code**
- **Comprehensive input validation and rate limiting**
- **Security headers and CORS protection**

## 📋 Prerequisites

Before deployment, ensure you have:
- Node.js 16+ installed
- MongoDB database access
- OpenAI API account with API key
- SSL certificate for production

## 🔐 Environment Variables Setup

### Backend Environment Variables (`.env`)

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=5001

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/guidopia_prod?retryWrites=true&w=majority

# JWT Configuration (Generate secure random strings)
JWT_SECRET=your-super-secure-random-jwt-secret-key-here-64-chars-minimum
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

JWT_REFRESH_SECRET=your-super-secure-random-refresh-secret-key-here-64-chars-minimum
JWT_REFRESH_EXPIRES_IN=30d
JWT_REFRESH_COOKIE_EXPIRES_IN=30

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# CORS Configuration (Update with your domain)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Security Configuration
SESSION_SECRET=your-super-secure-random-session-secret-key-here-64-chars-minimum
```

### Generating Secure Secrets

Use one of these methods to generate secure random strings:

**Option 1: Node.js REPL**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Option 2: OpenSSL**
```bash
openssl rand -hex 64
```

**Option 3: Python**
```bash
python3 -c "import secrets; print(secrets.token_hex(64))"
```

### OpenAI API Key Security

1. **Never commit API keys to version control**
2. **Use OpenAI's project-based keys** instead of user-based keys for better security
3. **Set up API key restrictions** in your OpenAI account:
   - Restrict to specific IP addresses if possible
   - Set usage limits
   - Monitor usage regularly

## 🚀 Deployment Steps

### 1. Environment Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd guidopia_lite

# Install backend dependencies
cd backend
npm install

# Create and configure .env file (see above)
nano .env

# Install frontend dependencies
cd ../client
npm install
```

### 2. Security Checks

Before deploying, run these security checks:

```bash
# Backend security validation
cd backend
npm run setup  # This validates environment variables

# Check for any hardcoded secrets
grep -r "sk-" . --exclude-dir=node_modules
grep -r "mongodb+srv://" . --exclude-dir=.env
```

### 3. Build Frontend

```bash
cd client
npm run build
```

### 4. Production Server Setup

#### Option A: Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Option B: Using Docker

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env
    depends_on:
      - mongodb

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

  mongodb:
    image: mongo:6.0
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secure_password

volumes:
  mongodb_data:
```

### 5. SSL/TLS Configuration

**Always use HTTPS in production:**

```nginx
# Example nginx configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        root /path/to/built/frontend;
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔍 Security Monitoring

### API Key Monitoring

```bash
# Check OpenAI API usage regularly
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     https://api.openai.com/v1/usage

# Monitor application logs for suspicious activity
tail -f backend/logs/app.log | grep -i error
```

### Rate Limiting Status

The application includes built-in rate limiting:
- **50 requests per 15 minutes** for OpenAI endpoints
- **Configurable** via environment variables

### Health Checks

```bash
# Backend health check
curl https://yourdomain.com/api/health

# OpenAI service health check
curl https://yourdomain.com/api/openai/health
```

## 🚨 Security Best Practices

### 1. Regular Updates
```bash
# Keep dependencies updated
npm audit
npm update

# Update base images regularly for Docker deployments
docker-compose pull
```

### 2. Backup Strategy
```bash
# Database backups
mongodump --db guidopia_prod --out /path/to/backups/$(date +%Y%m%d)

# Environment file backups (encrypted)
gpg -c .env > .env.gpg
```

### 3. Incident Response
- **Monitor logs** for unusual activity
- **Rotate API keys** immediately if compromised
- **Have backup deployment** ready
- **Document incident response procedures**

### 4. Access Control
- **Use strong passwords** for all services
- **Implement MFA** where possible
- **Limit database access** to specific IPs
- **Regular security audits**

## 🆘 Troubleshooting

### Common Issues

**API Key Not Working:**
- Verify key format starts with `sk-`
- Check OpenAI account has credits
- Confirm key restrictions allow your server IP

**CORS Errors:**
- Update `CORS_ORIGIN` in environment variables
- Check if HTTPS is required for production

**Rate Limiting:**
- Increase limits in environment variables if needed
- Implement user-specific rate limits for premium users

**Environment Variables Not Loading:**
- Ensure `.env` file is in backend root directory
- Check file permissions: `chmod 600 .env`
- Restart application after changes

## 📞 Support

For security-related issues:
1. **Immediately rotate compromised API keys**
2. **Check application logs** for error details
3. **Contact OpenAI support** if API access is blocked
4. **Review deployment configuration**

## 🔄 Updates and Maintenance

- **Monthly security updates** for dependencies
- **Quarterly security audits**
- **API key rotation** every 90 days
- **Backup testing** monthly
- **Performance monitoring** continuous

---

**Remember:** Security is an ongoing process. Regularly review and update your security measures as threats evolve.
