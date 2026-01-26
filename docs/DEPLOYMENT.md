# Deployment Guide - Vercel + CI/CD Pipeline

**Last Updated:** January 26, 2026  
**Status:** Production Ready

---

## 🚀 Overview

This project uses **Vercel** for hosting with an automated **GitHub Actions** CI/CD pipeline that runs quality checks before deployment.

### Deployment Flow

```
Push to main → GitHub Actions CI → Quality Checks → Vercel Auto-Deploy → Live URL
```

---

## 📋 Prerequisites

- [x] Vercel account (free tier works)
- [x] GitHub repository connected
- [x] Supabase project with API keys

---

## 🔧 Setup Instructions

### 1. Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Choose `ViktorSivek/money_tracker_app`
5. Configure project settings:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (default)
   - **Install Command:** `npm install --legacy-peer-deps` (configured in vercel.json)
   - **Output Directory:** Next.js default

### 2. Add Environment Variables in Vercel

In the Vercel project settings, add these environment variables:

| Key                             | Value                     | Where to Get It                     |
| ------------------------------- | ------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://xxx.supabase.co` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...`                  | Supabase Dashboard → Settings → API |

**Important:** Add these for **Production**, **Preview**, and **Development** environments.

### 3. Add GitHub Secrets (for CI Pipeline)

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the same environment variables as secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Enable Auto-Deploy

In Vercel project settings:

- ✅ Enable **"Automatic Deployments"** for `main` branch
- ✅ Enable **"Preview Deployments"** for pull requests (optional)

---

## 🔄 CI/CD Pipeline

### What Gets Checked (GitHub Actions)

Every push to `main` triggers:

1. **ESLint** - Code quality and style checks
2. **TypeScript** - Type checking for errors
3. **Security Audit** - Check for vulnerable dependencies
4. **Build Test** - Ensure the app builds successfully

### Pipeline Configuration

File: `.github/workflows/ci.yml`

```yaml
- Runs on: Ubuntu latest
- Node version: 20
- Install: npm ci --legacy-peer-deps
- Checks: lint → type-check → audit → build
```

### If CI Fails

- ❌ Check the GitHub Actions tab for error details
- Fix the issues locally
- Push again to re-trigger the pipeline

---

## 🌐 Accessing Your Deployed App

### Production URL

After deployment, Vercel provides:

- **Production:** `https://money-tracker-app.vercel.app` (or custom domain)
- **Preview:** Unique URL for each commit/PR

### Testing on Mobile

1. Open the production URL on your phone
2. Add to home screen for app-like experience
3. Test all features (auth, dashboard, income tracking)

---

## 📦 Deployment Commands

### Manual Deployment (if needed)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

### Local Testing Before Deploy

```bash
# Run all CI checks locally
npm run lint:check
npm run type-check
npm run build

# If all pass, you're good to push!
```

---

## 🔐 Security Best Practices

- ✅ Never commit `.env` files (already in `.gitignore`)
- ✅ Use environment variables for all secrets
- ✅ Keep Supabase keys secure (use Row Level Security)
- ✅ Run `npm audit` regularly to check for vulnerabilities

---

## 🐛 Troubleshooting

### Build Fails on Vercel

**Issue:** "Module not found" or dependency errors

**Solution:**

```bash
# Ensure vercel.json has correct install command
"installCommand": "npm install --legacy-peer-deps"
```

### Environment Variables Not Working

**Issue:** Supabase connection fails in production

**Solution:**

1. Check Vercel dashboard → Settings → Environment Variables
2. Ensure variables are set for "Production" environment
3. Redeploy after adding variables

### CI Pipeline Fails

**Issue:** GitHub Actions shows red X

**Solution:**

1. Check Actions tab for specific error
2. Common fixes:
   - ESLint errors: Run `npm run lint` locally and fix
   - Type errors: Run `npm run type-check` locally
   - Build errors: Run `npm run build` locally

### Middleware Warning

**Issue:** Next.js 16 middleware deprecation warning

**Solution:** This is expected and can be ignored for now. Will be fixed in future Next.js updates.

---

## 📊 Monitoring

### Vercel Dashboard

- View deployment logs
- Monitor build times
- Check error rates
- View analytics (page views, performance)

### GitHub Actions

- View CI pipeline history
- Check which commits passed/failed
- Monitor build times

---

## 🔄 Updating the App

### Standard Workflow

```bash
# 1. Make changes locally
git add .
git commit -m "feat: add new feature"

# 2. Push to main
git push origin main

# 3. GitHub Actions runs checks
# 4. If pass → Vercel auto-deploys
# 5. Check live URL for changes
```

### Rollback if Needed

In Vercel dashboard:

1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

---

## 🎯 Next Steps

### Immediate

- [ ] Complete Vercel setup with environment variables
- [ ] Push to main and verify first deployment
- [ ] Test on mobile device

### Future Enhancements

- [ ] Add custom domain
- [ ] Set up branch protection rules (require CI to pass)
- [ ] Add E2E tests with Playwright
- [ ] Set up monitoring/error tracking (Sentry)
- [ ] Add performance monitoring

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Supabase + Vercel Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

## 🆘 Support

If you encounter issues:

1. Check this guide first
2. Review Vercel deployment logs
3. Check GitHub Actions logs
4. Consult Next.js/Vercel documentation
