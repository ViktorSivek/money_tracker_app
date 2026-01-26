# Vercel Setup Checklist

**Status:** Ready to deploy! Follow these steps to complete the setup.

---

## ✅ Completed (Automated)

- [x] GitHub Actions CI/CD pipeline configured
- [x] Vercel configuration file created
- [x] npm scripts added (lint:check, type-check)
- [x] Code pushed to GitHub
- [x] CI pipeline triggered (check: https://github.com/ViktorSivek/money_tracker_app/actions)

---

## 📝 Manual Steps Required

### Step 1: Add GitHub Secrets (for CI Pipeline)

1. Go to: https://github.com/ViktorSivek/money_tracker_app/settings/secrets/actions
2. Click **"New repository secret"**
3. Add these two secrets:

**Secret 1:**

- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: Your Supabase project URL (from Supabase Dashboard → Settings → API)

**Secret 2:**

- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: Your Supabase anon key (from Supabase Dashboard → Settings → API)

> **Note:** These secrets allow the CI pipeline to build your app during checks.

---

### Step 2: Connect GitHub to Vercel

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select: `ViktorSivek/money_tracker_app`
4. Configure the project:

   - **Project Name:** `money-tracker-app` (or your preference)
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `./`
   - **Build Command:** Leave default (`npm run build`)
   - **Install Command:** Leave default (vercel.json handles this)
   - **Output Directory:** Leave default

5. **BEFORE clicking Deploy**, add environment variables (see Step 3)

---

### Step 3: Add Environment Variables in Vercel

In the Vercel project setup screen, scroll to **"Environment Variables"** section:

**Variable 1:**

- Key: `NEXT_PUBLIC_SUPABASE_URL`
- Value: Your Supabase project URL
- Environments: ✅ Production, ✅ Preview, ✅ Development

**Variable 2:**

- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: Your Supabase anon key
- Environments: ✅ Production, ✅ Preview, ✅ Development

> **Tip:** You can paste the contents of your local `.env.local` file using the "Paste .env" option.

---

### Step 4: Deploy!

1. Click **"Deploy"** button in Vercel
2. Wait for the build to complete (~2-3 minutes)
3. You'll get a production URL like: `https://money-tracker-app.vercel.app`

---

## 🎉 Post-Deployment

### Verify Everything Works

1. **Check CI Pipeline:**

   - Go to: https://github.com/ViktorSivek/money_tracker_app/actions
   - Verify the latest workflow run passed ✅

2. **Check Vercel Deployment:**

   - Go to your Vercel dashboard
   - Verify deployment status is "Ready"
   - Click "Visit" to open your live app

3. **Test the App:**
   - Open the production URL
   - Try logging in / signing up
   - Test on mobile device
   - Verify Supabase connection works

---

## 🔄 Future Deployments

From now on, every time you push to `main`:

1. **GitHub Actions** runs automatically:

   - Lints your code
   - Checks TypeScript types
   - Runs security audit
   - Tests the build

2. **If CI passes** → **Vercel deploys automatically**
3. **If CI fails** → Deployment is blocked (you'll see errors in GitHub Actions)

---

## 📱 Testing on Mobile

1. Open your production URL on your phone
2. For iOS: Tap Share → "Add to Home Screen"
3. For Android: Tap Menu → "Add to Home screen"
4. Now you have a PWA-like experience!

---

## 🐛 Troubleshooting

### CI Pipeline Fails

**Check:** https://github.com/ViktorSivek/money_tracker_app/actions

**Common issues:**

- Missing GitHub secrets → Add them in Step 1
- Lint errors → Run `npm run lint:check` locally
- Type errors → Run `npm run type-check` locally

### Vercel Build Fails

**Check:** Vercel dashboard → Deployments → Click failed deployment → View logs

**Common issues:**

- Missing environment variables → Add them in Vercel settings
- Build errors → Check if `npm run build` works locally

### App Works Locally But Not in Production

**Check:** Environment variables in Vercel

- Make sure both Supabase variables are set
- Make sure they're set for "Production" environment
- Redeploy after adding variables

---

## 📚 Next Steps

- [ ] Set up custom domain (optional)
- [ ] Enable branch protection rules (require CI to pass before merge)
- [ ] Add preview deployments for feature branches
- [ ] Set up error monitoring (Sentry)
- [ ] Add analytics (Vercel Analytics)

---

## 🆘 Need Help?

- **Deployment Guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Vercel Docs:** https://vercel.com/docs
- **GitHub Actions:** https://github.com/ViktorSivek/money_tracker_app/actions
- **Vercel Dashboard:** https://vercel.com/dashboard

---

**Good luck! 🚀**
