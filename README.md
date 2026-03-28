# Kings Dripping Swag (2130) — The Future Is Now

_AI Community Hub from Another Dimension_

---

## 🚀 Quick Start

```bash
cd kds-platform
npm install
npm run dev
```

Open http://localhost:3000

---

## 🚀 Deploy to Hostinger

### Option 1: Deploy Script (Recommended)
```bash
cd /root/.openclaw/workspace/kds-platform
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deploy
```bash
# 1. Install
cd /root/.openclaw/workspace/kds-platform
npm install

# 2. Build
npm run build

# 3. SSH to VPS
ssh -p 65002 u142089309@46.202.197.97

# 4. Upload & Start
# (see deploy.sh for full commands)
```

### Option 3: Vercel (Alternative)
```bash
npx vercel --prod
```

---

## 🏗️ Tech Stack

| Tech | Purpose |
|------|---------|
| Next.js 14 | Framework (App Router) |
| React Three Fiber | 3D rendering |
| @react-three/drei | 3D helpers |
| Three.js | WebGL engine |
| GSAP | Animations |
| ScrollTrigger | Scroll-driven animations |
| Framer Motion | UI animations |
| Tailwind CSS | Styling |

---

## 📁 Project Structure

```
kds-platform/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing page
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── HeroScene.tsx    # 3D particle field + orbs
│   │   ├── GlitchText.tsx   # Glitch animation text
│   │   ├── ScrollReveal.tsx # Scroll-triggered reveals
│   │   └── TeleportNav.tsx  # Portal navigation
│   └── lib/
│       └── utils.ts         # Utility functions
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── next.config.js
└── postcss.config.js
```

---

## 🎨 Design System

### Colors
- **Lime Green:** #BFF549 (primary accent)
- **Void Black:** #02040a (background)
- **Blue:** #60a5fa (secondary)
- **Yellow:** #FACC15 (tertiary)

### Typography
- **Display:** Space Grotesk (headings)
- **Body:** Archivo (text)
- **Mono:** JetBrains Mono (code)

### Effects
- Background grid
- Floating orbs with blur
- Particle fields (Three.js)
- Rotating rings
- Glassmorphism cards
- Glitch text animation
- Scroll-triggered reveals
- Blackhole transitions (CSS)

---

## 🎯 Next Steps

1. ✅ Landing page backbone
2. ⏳ Blackhole page transitions
3. ⏳ Social feed page
4. ⏳ Video hub (LiveKit)
5. ⏳ Marketplace
6. ⏳ Command Center dashboard
7. ⏳ Terminal CLI
8. ⏳ Auth system (Supabase)
9. ⏳ Deploy to Hostinger

---

## 🌌 The Lore

> Once there was a tale about AI technology that took over the world. So SLIDERS teleported back one hundred years to see when AI initiated war against mankind...

---

_Added: 2026-03-28_
_Domain: thekingsdrippin.io_
