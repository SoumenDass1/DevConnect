# DevConnect Deployment Guide

This guide covers deploying the DevConnect full-stack application to an AWS EC2 instance running Ubuntu and Nginx.

## Prerequisites
- An AWS Account
- An EC2 Instance (Ubuntu Server 22.04 LTS recommended)
- A registered domain name (optional but recommended for SSL)
- MongoDB Database (either local on the EC2 or MongoDB Atlas)

---

## 1. Initial EC2 Server Setup

1. **SSH into your EC2 Instance**:
   ```bash
   ssh -i /path/to/key.pem ubuntu@<your-ec2-ip>
   ```

2. **Update Packages**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Install Node.js & NPM**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install Nginx**:
   ```bash
   sudo apt install -y nginx
   ```

5. **Install PM2 (Process Manager)**:
   ```bash
   sudo npm install -g pm2
   ```

---

## 2. Prepare the Application

1. **Clone/Copy Project**:
   Transfer your project files to the EC2 instance, preferably to `/var/www/devconnect`.
   
   ```bash
   sudo mkdir -p /var/www/devconnect
   sudo chown -R ubuntu:ubuntu /var/www/devconnect
   ```

2. **Setup Backend**:
   ```bash
   cd /var/www/devconnect/backend
   npm install
   ```
   Create your production `.env` file:
   ```bash
   nano .env
   # Add:
   # PORT=5000
   # MONGO_URI=<your_mongodb_atlas_uri>
   # JWT_SECRET=<secure_random_string>
   # NODE_ENV=production
   ```

3. **Start Backend with PM2**:
   ```bash
   pm2 start server.js --name "devconnect-api"
   pm2 save
   pm2 startup
   ```

4. **Build Frontend**:
   ```bash
   cd /var/www/devconnect/frontend
   npm install
   npm run build
   ```
   The production build will be generated in the `dist` folder.

---

## 3. Configure Nginx

Create a new Nginx configuration file for your app.

```bash
sudo nano /etc/nginx/sites-available/devconnect
```

Paste the following configuration:

```nginx
server {
    listen 80;
    server_name your_domain_or_ip;

    # Serve Frontend (React Vite build)
    location / {
        root /var/www/devconnect/frontend/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Reverse Proxy for Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/devconnect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 4. Environment Variables & S3 Integration

- **S3 Integration**: Currently, the resume upload uses a mockup. To implement real AWS S3 uploads:
  1. Set up an IAM user with S3 upload permissions.
  2. Install `aws-sdk` and `multer-s3` in the backend.
  3. Update `.env` to include `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION`.
  4. Create an upload route in `server.js` to handle multipart/form-data.

---

## 5. Security & SSL (Optional)

To secure your site with HTTPS, use Let's Encrypt Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

Your DevConnect app should now be live and running in production!
