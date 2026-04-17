# Cointelligence

A personal editorial and thought-leadership platform for Richard Ramdial built with Next.js 16, Payload CMS 3, PostgreSQL, and Traefik, deployed on Azure VMs.

## Technology Stack

- **Frontend**: Next.js 16.2.4 with App Router
- **CMS**: Payload CMS 3.x
- **Database**: PostgreSQL 16
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Typography**: Fraunces (headings) + Inter (body)
- **Reverse Proxy**: Traefik v3 (TLS termination, Let's Encrypt)
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Auth**: Payload CMS native authentication (Phase 1)

## Local Development

### Prerequisites

- Node.js 20.9.0 or later
- Docker and Docker Compose (optional, for local PostgreSQL)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with local database credentials

3. **Start PostgreSQL (optional):**
   ```bash
   docker run --name cointelligence-db \
     -e POSTGRES_USER=cointelligence \
     -e POSTGRES_PASSWORD=local-password \
     -e POSTGRES_DB=cointelligence \
     -p 5432:5432 \
     -d postgres:16
   ```

4. **Run database migrations:**
   ```bash
   npm run payload migrate
   ```

5. **Seed admin user (optional):**
   ```bash
   ADMIN_PASSWORD=your-password npx ts-node scripts/seed.ts
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

## VM Provisioning (Richard's Tasks)

### Prerequisites

- Azure account with permissions to create VMs
- Available domain name

### Steps

1. **Provision Azure VM:**
   - OS: Ubuntu 22.04 LTS
   - Ports: Open 80 (HTTP) and 443 (HTTPS)
   - Note the public IP address

2. **Install Docker:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y docker.io docker-compose
   sudo usermod -aG docker $USER
   ```

3. **Clone repository and set up:**
   ```bash
   cd ~
   git clone https://github.com/richardramdial/cointelligence.git
   cd cointelligence
   ```

4. **Create `.env` file with production values**

5. **Point domain DNS A record at the VM**

6. **Add GitHub Actions secrets:**
   - `SSH_PRIVATE_KEY`: Deploy SSH private key
   - `VM_HOST`: VM public IP or hostname
   - `VM_USER`: SSH user on VM (e.g., `azureuser`)
   - `GHCR_TOKEN`: GitHub PAT with `packages:write` scope

7. **Start services:**
   ```bash
   docker compose pull
   docker compose up -d
   ```

## Deployment

### Automatic Deployment (GitHub Actions)

Push to `main` branch — GitHub Actions will build, push to GHCR, and deploy.

### Manual Deployment

```bash
cd ~/cointelligence
docker compose pull
docker compose up -d
```

## Admin Panel

- Local: `http://localhost:3000/admin`
- Production: `https://yourdomain.com/admin`

## Phase 1 Verification

- [ ] Navigate to `https://<domain>/admin` and log in
- [ ] Edit `SiteSettings` and verify persistence
- [ ] Upload test image, restart containers, verify it persists
- [ ] `docker compose ps` — all services show `Up`

## Documentation

- [Implementation Plan](docs/implementation-plan.md)
- [Design & Requirements](docs/design-and-requirements.md)
- [Architecture](docs/architecture.md)

## License

MIT
