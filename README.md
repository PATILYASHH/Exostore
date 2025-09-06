# Exostore 🚀

A modern, responsive digital marketplace built with React, TypeScript, and Supabase. Discover and share amazing apps, games, and websites.

## ✨ Features

- 🎨 **Modern Design**: Beautiful, responsive UI with Tailwind CSS
- 📱 **Mobile-First**: Perfect experience on all devices
- 🔐 **Authentication**: Secure user accounts with Supabase
- 👑 **Admin Panel**: Content management for administrators
- 🗄️ **Database**: Full CRUD operations with Supabase
- ⚡ **Fast**: Optimized performance and loading
- 🛡️ **Secure**: Built-in security headers and validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PATILYASHH/Yashstore.git
   cd Yashstore
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🌐 Deployment

### Deploy to Netlify
See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on every push

### Build for Production
```bash
npm run build
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Check code quality
- `npm run lint:fix` - Fix linting issues
- `npm run type-check` - Check TypeScript types

## 🏗️ Project Structure

```
src/
├── components/        # React components
├── contexts/         # React contexts (Auth, etc.)
├── lib/             # Utilities and configurations
├── data/            # Static data and types
└── icons/           # Icon assets

public/              # Static assets
├── favicon.png      # Site favicon
└── ...

Configuration files:
├── netlify.toml     # Netlify deployment config
├── tailwind.config.js # Tailwind CSS config
├── vite.config.ts   # Vite configuration
└── tsconfig.json    # TypeScript config
```

## 🎯 Key Components

- **Header**: Responsive navigation with mobile bottom nav
- **CategoryGrid**: Dynamic content grid with filtering
- **ItemCard**: Responsive card component
- **AdminPanel**: Content management interface
- **AuthModal**: User authentication

## 🔧 Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage)
- **Build Tool**: Vite
- **Deployment**: Netlify
- **Icons**: Lucide React

## 👤 Admin Access

Default admin email: `yashpatil575757@gmail.com`

To access admin features:
1. Sign up/Sign in with the admin email
2. Click your profile icon
3. Select "Admin Panel"

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with ❤️ for the developer community
- Inspired by modern app store designs
- Powered by Supabase and Netlify

---

**Ready to launch your digital marketplace? Deploy Exostore today! 🚀**
