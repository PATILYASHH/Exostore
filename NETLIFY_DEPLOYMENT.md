# Exostore - Netlify Deployment Guide

## 🚀 Quick Deploy to Netlify

### Prerequisites
1. A [Netlify](https://netlify.com) account
2. A [Supabase](https://supabase.com) project set up
3. Your Exostore repository on GitHub/GitLab

### Step 1: Prepare Your Supabase Project
1. Go to your Supabase dashboard
2. Copy your project URL and anon key from Settings > API
3. Make sure your database tables are set up (store_items, etc.)

### Step 2: Deploy to Netlify

#### Option A: Connect Git Repository (Recommended)
1. Go to [Netlify](https://app.netlify.com)
2. Click "New site from Git"
3. Connect your GitHub/GitLab account
4. Select your Exostore repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

#### Option B: Manual Deploy
1. Build your project locally: `npm run build`
2. Drag and drop the `dist` folder to Netlify

### Step 3: Set Environment Variables
In your Netlify site dashboard, go to **Site settings > Environment variables** and add:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Configure Domain (Optional)
1. Go to **Site settings > Domain management**
2. Add your custom domain or use the provided Netlify subdomain

### Step 5: Enable Form Handling (Optional)
If you add contact forms later, Netlify can handle them automatically.

## 🔧 Configuration Files

### netlify.toml
This file configures:
- Build settings
- Redirects for SPA routing
- Security headers
- Cache optimization

### .env.example
Template for environment variables needed.

## 🚀 Build Commands

- **Development**: `npm run dev`
- **Production Build**: `npm run build`
- **Preview Build**: `npm run preview`
- **Lint Code**: `npm run lint`

## 📱 Features Ready for Production

✅ **Responsive Design**: Mobile-first, works on all devices  
✅ **PWA Ready**: Can be installed as a mobile app  
✅ **SEO Optimized**: Proper meta tags and structure  
✅ **Fast Loading**: Optimized assets and caching  
✅ **Security Headers**: XSS protection and security headers  
✅ **Database Integration**: Full Supabase integration  
✅ **Admin Panel**: Ready for content management  

## 🌟 Performance Optimizations

- **Static Asset Caching**: 1 year cache for images and assets
- **Gzip Compression**: Automatic compression on Netlify
- **Tree Shaking**: Unused code elimination
- **Code Splitting**: Optimized bundle sizes
- **Image Optimization**: Proper format and sizing

## 🔒 Security

- XSS Protection headers
- Content Type validation
- Frame protection
- Referrer policy security

## 📊 Analytics (Optional)

You can add Netlify Analytics or Google Analytics later by:
1. Adding tracking scripts to `index.html`
2. Using Netlify's built-in analytics

## 🛠 Troubleshooting

### Common Issues:
1. **Build fails**: Check environment variables are set
2. **404 on refresh**: Netlify redirects are configured in `netlify.toml`
3. **Supabase errors**: Verify your environment variables

### Support:
- Check Netlify deploy logs for build errors
- Verify Supabase connection in browser console
- Test locally with `npm run preview` before deploying

---

**Your Exostore is now ready for production deployment! 🎉**
