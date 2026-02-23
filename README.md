# 🛡️ Finora. | Premium Developer Dashboard

Modern, şık ve **SaaS mimarisine sahip** Bento Grid tabanlı kişisel API kasası. Geliştiriciler için tasarlanmış bu dashboard ile dijital ayak izlerinizi tek bir noktadan, güvenli ve estetik bir şekilde takip edin.

![Finora Preview]

## ✨ Özellikler

- 💎 **Premium Bento Grid Tasarımı:** Modern karanlık mod ve akıcı animasyonlar.
- 🔐 **SaaS Mimarisi:** Her kullanıcı kendi GitHub hesabıyla giriş yapabilir ve kendi API anahtarlarını ekleyebilir.
- 📊 **GitHub Stats:** Takipçiler, repolar, yıldızlar ve en çok kullanılan diller.
- 🎵 **Music Integration (Last.fm):** Anlık olarak ne dinlediğinizi görün ve müzik arayın.
- ☁️ **Weather Widget:** Şehrinizdeki hava durumunu anlık takip edin.
- ✅ **Quick Tasks:** Hızlı görev listesi ile verimliliğinizi artırın.
- 📈 **Market Watch:** Kripto (BTC/ETH) ve Döviz (USD/TRY) kurlarını canlı izleyin.
- 🛡️ **Güvenli Saklama:** API anahtarlarınız Supabase üzerinde kullanıcıya özel olarak saklanır.

## 🛠️ Teknolojiler

- **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Motion](https://motion.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Backend:** [Express.js](https://expressjs.com/) (API Proxy & Auth Verification)
- **Database & Auth:** [Supabase](https://supabase.com/) (GitHub OAuth)

## 🚀 Kurulum

### 1. Yerel Çalıştırma
```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme modunda başlatın
npm run dev
```

### 2. Environment Variables (.env)
Kök dizinde bir `.env` dosyası oluşturun ve şu değerleri girin:
```env
VITE_SUPABASE_URL="your_supabase_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
```

## 🌍 Deployment (Vercel)

Bu proje Vercel için optimize edilmiştir.

1. Projeyi GitHub'a pushlayın.
2. Vercel Dashboard'unda "New Project" diyerek repoyu seçin.
3. **Environment Variables** kısmına yukarıdaki Supabase anahtarlarını ekleyin.
4. **Önemli:** Supabase Dashboard'unda GitHub OAuth ayarlarını yapmayı ve `Redirect URL` olarak Vercel URL'nizi eklemeyi unutmayın.

## 📝 Kullanım

1. Dashboard'a GitHub hesabınızla giriş yapın.
2. Sağ üstteki **Ayarlar (Settings)** ikonuna tıklayın.
3. Kendi GitHub Token, Last.fm ve Weather API anahtarlarınızı girin.
4. Dashboard'unuz anında sizin verilerinizle canlanacaktır!

---
Built with ❤️ for developers.
