# Admin Configuration Guide

**Purpose:** Configure who can access the Cointelligence admin panel, both via Google OAuth and email+password authentication.

---

## Quick Start

Add these to your `.env` file:

```bash
# One admin
ADMIN_EMAILS=richard.ramdial@gmail.com
ADMIN_PASSWORD=your-secure-password

# Multiple admins
ADMIN_EMAILS=richard@example.com,admin@example.com
ADMIN_PASSWORD=your-secure-password
```

Run the seed script to create admin users:

```bash
ADMIN_PASSWORD=your-password npm run payload seed
```

Or in Docker:

```bash
docker compose exec app npm run payload seed
```

---

## Configuration Options

### `ADMIN_EMAILS` (Required)

**Format:** Comma-separated list of email addresses

**Examples:**
```bash
# Single admin
ADMIN_EMAILS=richard.ramdial@gmail.com

# Multiple admins
ADMIN_EMAILS=richard@example.com,admin@example.com,editor@example.com

# With spaces (spaces are trimmed automatically)
ADMIN_EMAILS=richard@example.com, admin@example.com, editor@example.com
```

**Behavior:**
- Email addresses are case-insensitive (converted to lowercase)
- Only emails in this list can access `/admin` and `/api/auth/*`
- Google OAuth sign-in restricts to these emails
- All configured emails are created as users during seed script

**Default:** `richard.ramdial@gmail.com` (if not set)

### `ADMIN_PASSWORD` (Required during setup)

**Format:** Plain text password string

**Examples:**
```bash
# Simple password (not recommended)
ADMIN_PASSWORD=mypassword123

# Strong password (recommended)
ADMIN_PASSWORD=Tr0pic@l-P!ssw0rd-2025

# Generate random:
#   $ openssl rand -base64 24
#   $ node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

**Behavior:**
- Used only during initial admin user creation (seed script)
- All configured admin emails get this password initially
- Admins should change passwords in the CMS after first login
- Required each time seed script is run (for idempotency)
- Not used if user already exists

**Important:**
- This is NOT the password for Google OAuth (OAuth doesn't use passwords)
- This is ONLY for email+password local authentication
- This is ONLY used during seed script execution
- After creation, passwords are managed in the CMS

---

## Authentication Flows

### Google OAuth (Recommended)

1. User visits `/admin`
2. Clicks "Sign in with Google"
3. Google login page opens
4. User enters Google credentials
5. Callback verifies email is in `ADMIN_EMAILS`
6. If allowed: user logged in, session created
7. If blocked: "Sign in failed" (email not in admin list)

**Requirements:**
- `GOOGLE_CLIENT_ID` in `.env`
- `GOOGLE_CLIENT_SECRET` in `.env`
- Email address in `ADMIN_EMAILS`
- Valid Google account

### Email + Password (Local)

1. User visits `/auth/signin`
2. Enters email and password
3. Payload CMS authenticates against Users collection
4. If credentials valid: user logged in, session created
5. If invalid: "Invalid credentials"

**Requirements:**
- Email in Users collection (created via seed script)
- Password set to `ADMIN_PASSWORD` value from seed script
- User must know their password

**Note:** Passwords in the CMS can be changed after first login.

---

## Setup Instructions

### Local Development

1. **Copy `.env.example` to `.env.local`:**
   ```bash
   cp .env.example .env.local
   ```

2. **Set admin configuration:**
   ```bash
   # Edit .env.local
   ADMIN_EMAILS=your-email@example.com
   ADMIN_PASSWORD=your-password

   # Or for multiple admins:
   ADMIN_EMAILS=admin1@example.com,admin2@example.com
   ADMIN_PASSWORD=shared-password
   ```

3. **Start PostgreSQL (if needed):**
   ```bash
   docker run -d --name cointelligence-db \
     -e POSTGRES_USER=cointelligence \
     -e POSTGRES_PASSWORD=local-password \
     -e POSTGRES_DB=cointelligence \
     -p 5432:5432 postgres:16
   ```

4. **Configure `.env.local` database:**
   ```bash
   DATABASE_URI=postgresql://cointelligence:local-password@localhost:5432/cointelligence
   ```

5. **Run seed script:**
   ```bash
   ADMIN_PASSWORD=your-password npx ts-node scripts/seed.ts
   ```

6. **Start dev server:**
   ```bash
   npm run dev
   ```

7. **Test:**
   - Navigate to `http://localhost:3000/admin`
   - Sign in with email+password OR Google OAuth
   - Should see Payload admin dashboard

---

### Azure VM Deployment

1. **SSH into VM:**
   ```bash
   ssh azureuser@<VM_IP>
   cd ~/cointelligence
   ```

2. **Create `.env` with admin configuration:**
   ```bash
   cat >> .env << 'EOF'
   # Admin configuration
   ADMIN_EMAILS=richard@example.com,admin@example.com
   ADMIN_PASSWORD=$(openssl rand -base64 24)
   EOF
   ```

3. **Record the generated password** (save to secure location)

4. **Verify `.env` contains admin config:**
   ```bash
   grep -E "ADMIN_EMAILS|ADMIN_PASSWORD" .env
   ```

5. **Start services:**
   ```bash
   docker compose pull
   docker compose up -d
   docker compose logs -f app  # Wait for startup
   ```

6. **Run seed script to create admin users:**
   ```bash
   docker compose exec app npm run payload seed
   ```

   Expected output:
   ```
   Creating admin user(s): richard@example.com, admin@example.com
   ✓ Admin user created: richard@example.com
   ✓ Admin user created: admin@example.com
   Engagements seeded successfully
   ```

7. **Test admin access:**
   ```bash
   curl -I https://yourdomain.com/admin
   # Should return HTTP 200 (OK)
   ```

8. **Test via browser:**
   - Navigate to `https://yourdomain.com/admin`
   - Sign in with Google (if credentials configured) OR email+password
   - Should see Payload admin dashboard

---

## Common Scenarios

### Scenario 1: Single Admin (Richard)

```bash
ADMIN_EMAILS=richard.ramdial@gmail.com
ADMIN_PASSWORD=RichardSecure123
```

- Richard can sign in via Google OAuth
- Richard can also sign in via email+password
- Only Richard can access admin

### Scenario 2: Multiple Admins with Shared Password

```bash
ADMIN_EMAILS=richard@example.com,admin@example.com
ADMIN_PASSWORD=SharedPassword123
```

- Both can sign in via Google OAuth
- Both can sign in via email+password with shared password
- Both can access admin
- Each can change their own password in the CMS

### Scenario 3: Team with Mixed Auth

```bash
ADMIN_EMAILS=richard@example.com,editor@example.com,contributor@example.com
ADMIN_PASSWORD=InitialPassword123
```

- All 3 can sign in initially with email+password
- All 3 can sign in via Google OAuth (if Google accounts exist)
- Each should change their password in the CMS after first login

---

## Password Management

### Initial Setup
- During seed script: all admins created with `ADMIN_PASSWORD` value
- This password is temporary for initial login only

### After First Login
- Admins navigate to `/admin` → Profile/Settings
- Click "Change Password"
- Create unique, strong password
- Future logins use their new password

### Lost Password
- Admin can click "Forgot Password" on login page (if configured)
- Or via SQL directly: `UPDATE users SET password = '...' WHERE email = '...'`
- Or re-run seed script to reset password to `ADMIN_PASSWORD`

### Rotating Passwords
```bash
# Update ADMIN_PASSWORD in .env
ADMIN_PASSWORD=NewPassword456

# Re-run seed script (only updates existing users, doesn't create duplicates)
docker compose exec app npm run payload seed
```

---

## Security Considerations

### ✅ Best Practices

1. **Use strong passwords**
   ```bash
   # Generate random 24-char password
   openssl rand -base64 24
   ```

2. **Use Google OAuth when possible**
   - Offloads authentication to Google
   - No password storage needed for OAuth users
   - Better security than email+password

3. **Change initial passwords after login**
   - Don't keep `ADMIN_PASSWORD` as permanent password
   - Each admin should set unique password in CMS

4. **Limit admin emails list**
   - Only add necessary admins
   - Remove emails when admins leave

5. **Rotate `.env` file on VM**
   - After setting up, don't share or expose `.env`
   - Permissions: `chmod 600 .env`
   - Backup to secure location

### ⚠️ What NOT to Do

1. ❌ Don't hardcode email addresses in code
   - Always use `ADMIN_EMAILS` from `.env`

2. ❌ Don't use simple passwords
   - Avoid "password123", "admin", "test"
   - Use `openssl rand -base64 24` to generate

3. ❌ Don't commit `.env` to git
   - Only `.env.example` is in git
   - `.env` stays on the VM only

4. ❌ Don't enable weak auth options
   - Always require email+password OR Google OAuth
   - No anonymous access

---

## Troubleshooting

### Issue: "Email not allowed" on sign-in

**Cause:** Email address not in `ADMIN_EMAILS`

**Solution:**
```bash
# Check current ADMIN_EMAILS
grep ADMIN_EMAILS .env

# Add the email (comma-separated)
sed -i 's/ADMIN_EMAILS=.*/ADMIN_EMAILS=email1@example.com,newadmin@example.com/' .env

# Restart app
docker compose restart app

# Run seed to create the user
docker compose exec app npm run payload seed
```

### Issue: "Invalid credentials" on email+password login

**Cause:** Wrong password or user doesn't exist

**Solution:**
```bash
# Re-run seed script to (re)create user with correct password
docker compose exec app npm run payload seed

# Verify user was created
docker compose exec app npx ts-node -e "
  const payload = require('payload');
  payload.find({collection: 'users'}).then(r => console.log(r.docs));
"
```

### Issue: Google OAuth returns "Email not allowed"

**Cause:** Google account email not in `ADMIN_EMAILS`

**Solution:**
```bash
# Check what email you're using for Google
# It must match exactly (case-insensitive) one in ADMIN_EMAILS

# Add the email
sed -i 's/ADMIN_EMAILS=.*/ADMIN_EMAILS=yourgoogleemail@gmail.com/' .env
docker compose restart app
```

### Issue: Seed script fails with "User already exists"

**Cause:** User already created; script is idempotent

**Solution:** This is expected behavior. Script skips existing users.

```bash
# To change password:
docker compose exec app npm run payload seed
# (uses ADMIN_PASSWORD from current .env)
```

---

## Environment Variables Reference

```bash
# Required
ADMIN_EMAILS=email1@example.com,email2@example.com
ADMIN_PASSWORD=secure-password-for-initial-login

# Optional (defaults provided)
# ADMIN_EMAILS defaults to: richard.ramdial@gmail.com
# ADMIN_PASSWORD defaults to: change-me-in-production
```

---

## Examples

### Example 1: Dev Setup

```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URI=postgresql://cointelligence:local-password@localhost:5432/cointelligence

ADMIN_EMAILS=you@example.com
ADMIN_PASSWORD=devpassword123

# Run
npm run dev
# Seed: ADMIN_PASSWORD=devpassword123 npx ts-node scripts/seed.ts
```

### Example 2: Production Single Admin

```bash
# .env (on VM)
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://cointelligence.example.com
ADMIN_EMAILS=richard.ramdial@gmail.com
ADMIN_PASSWORD=SuperSecure123!@

# Setup
docker compose pull
docker compose up -d
docker compose exec app npm run payload seed
```

### Example 3: Production Team

```bash
# .env (on VM)
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://cointelligence.example.com
ADMIN_EMAILS=richard@example.com,editor@example.com,contributor@example.com
ADMIN_PASSWORD=$(openssl rand -base64 24)

# Setup
docker compose pull
docker compose up -d
docker compose exec app npm run payload seed
# Each admin changes their password after first login
```

---

## Summary

✅ **Admin Configuration is now fully flexible:**
- Multiple admins supported
- Email addresses configurable via `.env`
- Password configurable via `.env`
- Both Google OAuth and email+password supported
- Seed script creates/updates all configured admins automatically

**Next steps:**
1. Add `ADMIN_EMAILS` and `ADMIN_PASSWORD` to your `.env`
2. Run `npm run payload seed` (local) or `docker compose exec app npm run payload seed` (VM)
3. Test sign-in via Google OAuth and email+password
4. Each admin changes their password in CMS after first login
