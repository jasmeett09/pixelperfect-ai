# PixelPerfect AI - Complete Usage & Teaching Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Project Setup](#project-setup)
3. [Understanding the Architecture](#understanding-the-architecture)
4. [Customizing Content](#customizing-content)
5. [Styling & Design](#styling--design)
6. [Adding New Sections](#adding-new-sections)
7. [Animations & Interactions](#animations--interactions)
8. [Deployment Guide](#deployment-guide)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites
Before you begin, ensure you have:
- Node.js 18+ installed
- A code editor (VS Code recommended)
- Basic knowledge of React and Tailwind CSS
- Git installed for version control

### Quick Start (5 minutes)

```bash
# 1. Clone or download the project
cd pixelperfect-ai

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm dev

# 4. Open in your browser
# Navigate to http://localhost:3000
```

You should now see the PixelPerfect AI landing page live in your browser!

---

## Project Setup

### Understanding package.json

The project uses these key dependencies:

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Environment Setup

The project requires no environment variables for basic setup. If you plan to add:
- Analytics: Configure in `next.config.mjs`
- Forms: Add your backend endpoint in components
- CMS: Configure API keys in environment variables

---

## Understanding the Architecture

### File Structure Overview

```
project-root/
├── app/
│   ├── layout.tsx          ← Root layout, fonts, metadata
│   ├── page.tsx            ← Main page component
│   └── globals.css         ← Design tokens & utilities
├── components/
│   └── sections/
│       ├── Navbar.tsx      ← Navigation
│       ├── Hero.tsx        ← Hero section
│       ├── Features.tsx    ← Features section
│       ├── Pricing.tsx     ← Pricing section
│       └── ...             ← Other sections
└── public/                 ← Static assets
```

### Component Architecture

Each section is a standalone component:

```tsx
// Example: Hero component structure
export default function Hero() {
  return (
    <section className="relative py-20">
      {/* Content */}
    </section>
  )
}
```

Benefits:
- Easy to maintain and update
- Reusable across projects
- Clear separation of concerns
- Simple to add/remove sections

### Design System Files

**app/globals.css:**
- Design tokens (colors, spacing, radius)
- Utility classes (glass-card, gradient-text, glow effects)
- Global styles

**components/sections/GlassCard.tsx:**
- Reusable glassmorphic card component
- Hover effects and animations built-in

---

## Customizing Content

### 1. Change Text Content

Find the section you want to edit in `components/sections/`:

```tsx
// Example: Editing Hero section
export default function Hero() {
  return (
    <section>
      <h1 className="text-5xl font-bold">
        Your Custom Headline Here {/* ← Change this */}
      </h1>
      <p className="text-xl text-gray-400">
        Your custom description {/* ← And this */}
      </p>
    </section>
  )
}
```

### 2. Update Product Information

**Key locations:**

| Item | Location |
|------|----------|
| Product Name | `components/sections/Navbar.tsx` |
| Tagline | `components/sections/Hero.tsx` |
| Features | `components/sections/Features.tsx` |
| Pricing | `components/sections/Pricing.tsx` |
| Testimonials | `components/sections/Testimonials.tsx` |
| Footer Links | `components/sections/Footer.tsx` |

### 3. Modify Contact Information

Edit `components/sections/Footer.tsx`:

```tsx
const footerLinks = {
  company: [
    { name: 'About', href: 'https://yoursite.com/about' },
    { name: 'Contact', href: 'https://yoursite.com/contact' },
    // Add your links here
  ]
}
```

### 4. Update Metadata & SEO

Edit `app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: 'Your Product Name - Subtitle',
  description: 'Your product description for search engines',
  // ... other metadata
}
```

---

## Styling & Design

### Color System

The design uses a dark theme with purple/pink/blue gradients.

**Edit colors in `app/globals.css`:**

```css
:root {
  --background: oklch(0.08 0 0);        /* Dark charcoal */
  --foreground: oklch(0.95 0 0);        /* Off-white text */
  --primary: oklch(0.7 0.25 290);       /* Purple gradient */
  --accent: oklch(0.65 0.22 300);       /* Pink glow */
}
```

**To change the color scheme:**

1. Pick 3-5 main colors (background, text, primary, secondary, accent)
2. Use OKLch color space for better perceptual consistency
3. Update the color variables in `globals.css`
4. All components will automatically use the new colors

**Example: Change to Blue/Teal theme**

```css
:root {
  --background: oklch(0.08 0 0);        /* Keep dark background */
  --primary: oklch(0.6 0.25 200);       /* Blue instead of purple */
  --accent: oklch(0.65 0.22 200);       /* Teal glow */
}
```

### Using Utility Classes

The project includes custom Tailwind utilities:

```tsx
// Glassmorphic card
<div className="glass-card p-6">Content</div>

// Gradient text
<h1 className="gradient-text text-5xl">Headline</h1>

// Glow effects
<div className="glass-card glow-purple">Glowing card</div>

// Gradient hover effect
<div className="glass-card-hover">Hover me</div>
```

### Adding Custom Styles

**Option 1: Use Tailwind classes (recommended)**

```tsx
<div className="bg-purple-600 rounded-2xl p-6 shadow-lg">
  Content with Tailwind
</div>
```

**Option 2: Add utility class in globals.css**

```css
@layer components {
  .my-custom-style {
    @apply rounded-2xl p-6 bg-gradient-to-r from-purple-600 to-pink-600;
  }
}
```

**Option 3: Inline styles (avoid if possible)**

```tsx
<div style={{ color: '#rgb', padding: '24px' }}>Content</div>
```

---

## Adding New Sections

### Step 1: Create a New Component

Create `components/sections/NewSection.tsx`:

```tsx
'use client'

import { motion } from 'framer-motion'

export default function NewSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="gradient-text text-4xl font-bold mb-12">
          Section Title
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Your content here */}
        </div>
      </div>
    </section>
  )
}
```

### Step 2: Add to Main Page

Edit `app/page.tsx`:

```tsx
import NewSection from '@/components/sections/NewSection'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <NewSection /> {/* ← Add your new section */}
      <Features />
      {/* ... other sections ... */}
    </main>
  )
}
```

### Step 3: Style Your Section

Use the existing utility classes:

```tsx
// Use glass cards
<div className="glass-card p-8">Content</div>

// Use gradient text
<h3 className="gradient-text text-2xl">Heading</h3>

// Use glow effects
<div className="glass-card glow-purple">Glowing content</div>
```

---

## Animations & Interactions

### Using Framer Motion

The project uses Framer Motion for smooth animations:

```tsx
import { motion } from 'framer-motion'

export default function AnimatedComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}      // Start state
      whileInView={{ opacity: 1, y: 0 }}   // When visible
      transition={{ duration: 0.6 }}        // Animation speed
      className="glass-card p-6"
    >
      Content
    </motion.div>
  )
}
```

### Common Animation Patterns

**Fade In:**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  transition={{ duration: 0.6 }}
>
  Content fades in
</motion.div>
```

**Slide In from Left:**
```tsx
<motion.div
  initial={{ opacity: 0, x: -50 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8 }}
>
  Content slides in
</motion.div>
```

**Hover Effect:**
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

### Adding Scroll-Based Animations

All sections in this project use `whileInView` which triggers animations when scrolling into view. To customize:

```tsx
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true, amount: 0.5 }} // Trigger at 50% visibility
  transition={{ duration: 0.6 }}
>
  Animated content
</motion.div>
```

---

## Deployment Guide

### Deploy to Vercel (Recommended)

**Option 1: Using Vercel Dashboard**

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repository
5. Click "Deploy"

**Option 2: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Deploy to Other Platforms

**Netlify:**
```bash
# Build the project
pnpm build

# Deploy
# Connect your Git repo on netlify.com
```

**AWS Amplify:**
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize and deploy
amplify init
amplify publish
```

### Pre-Deployment Checklist

- [ ] Update metadata in `app/layout.tsx`
- [ ] Verify all links are correct
- [ ] Test on mobile devices
- [ ] Check for console errors
- [ ] Optimize images
- [ ] Update favicon (public/icon.svg)
- [ ] Test all buttons and CTAs
- [ ] Review content for typos

---

## Troubleshooting

### Issue: Page not rendering

**Solution:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
pnpm install
pnpm dev
```

### Issue: Styles not applying

**Check:**
1. Are Tailwind classes spelled correctly?
2. Is `globals.css` imported in `layout.tsx`?
3. Is the component using the correct className format?

**Fix:**
```tsx
// Wrong
<div class="glass-card">Content</div>

// Correct
<div className="glass-card">Content</div>
```

### Issue: Images not showing

**Check:**
1. Is the image in the `public/` folder?
2. Is the path correct (starting with `/`)?

**Fix:**
```tsx
// Correct
<img src="/images/logo.png" alt="Logo" />

// Wrong
<img src="images/logo.png" alt="Logo" />
<img src="./images/logo.png" alt="Logo" />
```

### Issue: Animations not working

**Check:**
1. Is the component using `'use client'`?
2. Is Framer Motion imported?
3. Is the animation syntax correct?

**Fix:**
```tsx
'use client'

import { motion } from 'framer-motion'

export default function Component() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
    >
      Content
    </motion.div>
  )
}
```

### Issue: TypeScript errors

**Common fixes:**
```bash
# Regenerate TypeScript types
pnpm build

# Clear and reinstall
rm -rf node_modules .next
pnpm install
pnpm dev
```

---

## Performance Tips

1. **Use Next.js Image component** for images
2. **Lazy load sections** with `whileInView`
3. **Avoid heavy animations** on mobile
4. **Compress images** before adding to project
5. **Use CSS classes** instead of inline styles
6. **Minimize font imports** (currently using Geist)

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Vercel Deployment Guide](https://vercel.com/docs)

---

**Happy building! 🚀**

If you have questions or need help, refer back to the relevant section above or check the official documentation links.
