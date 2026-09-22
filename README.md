# SK Hand Embroidery Boutique

A full-stack dynamic e-commerce website for an abaya/modest-wear boutique with a customer-facing storefront and password-protected admin panel.

## Features

### Customer-Facing Website
- **Home Page**: Hero section, featured products, category preview tiles
- **Shop Page**: Product grid with category filtering (Plain, Design, Simple)
- **Product Detail Page**: Image gallery, product info, WhatsApp order integration
- **Contact Page**: Boutique story, WhatsApp CTA, contact form

### Admin Panel
- **Authentication**: Secure admin signup and login with NextAuth
- **Product Management**: Full CRUD operations for products
- **Category Management**: Add/edit/delete product categories
- **Settings**: Configure WhatsApp number, boutique description, social media links
- **Image Upload**: Direct image upload to Cloudinary

## Tech Stack

- **Frontend**: Next.js 16 with TypeScript, React 19
- **Styling**: Tailwind CSS v4 with custom boutique color palette
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth with bcryptjs
- **Image Storage**: Cloudinary
- **Fonts**: Playfair Display (headings), Inter (body)

## Color Palette

- Rose Light: `#fce4ec`
- Rose: `#f8bbd9`
- Rose Dark: `#ec407a`
- Mauve: `#ce93d8`
- Plum: `#7b1fa2`
- Plum Dark: `#4a148c`
- Gold: `#d4af37`
- Gold Light: `#f4e4bc`
- Cream: `#faf8f5`

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local, Supabase, or Neon)
- Cloudinary account (free tier available)

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# PostgreSQL Database
DATABASE_URL=postgresql://username:password@localhost:5432/abayas

# Cloudinary (Image Upload)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# NextAuth
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

### 3. Cloudinary Setup

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Go to Dashboard > Account Details
4. Copy the Cloud Name, API Key, and API Secret
5. Add them to your `.env.local` file

### 4. Database Setup

#### Option 1: Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create a database: `createdb abayas`
3. Update `DATABASE_URL` in `.env.local`

#### Option 2: Supabase (Recommended for Free Hosting)
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Copy the Connection String from Project Settings > Database
4. Update `DATABASE_URL` in `.env.local`

#### Option 3: Neon (Serverless PostgreSQL)
1. Go to [Neon](https://neon.tech/)
2. Create a new project
3. Copy the connection string
4. Update `DATABASE_URL` in `.env.local`

### 5. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### 7. Initial Admin Setup

1. Navigate to `/admin/signup`
2. Create your admin account
3. Login at `/admin/login`
4. Access dashboard at `/admin/dashboard`

## Project Structure

```
src/
├── app/
│   ├── admin/              # Admin panel pages
│   │   ├── dashboard/      # Main admin dashboard
│   │   ├── login/          # Admin login
│   │   ├── signup/         # Admin signup
│   │   ├── products/       # Product management
│   │   ├── categories/     # Category management
│   │   └── settings/       # Store settings
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth configuration
│   │   ├── products/       # Product CRUD
│   │   ├── categories/     # Category CRUD
│   │   ├── settings/       # Settings management
│   │   └── admin/          # Admin signup
│   ├── shop/               # Shop page
│   ├── product/[id]/       # Product detail page
│   ├── contact/            # Contact page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── Navbar.tsx          # Navigation component
│   ├── Footer.tsx          # Footer component
│   └── SessionProvider.tsx # NextAuth provider
├── lib/
│   └── prisma.ts           # Prisma client
└── prisma/
    └── schema.prisma       # Database schema
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

- `DATABASE_URL` (PostgreSQL connection string)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (Cloudinary cloud name)
- `CLOUDINARY_API_KEY` (Cloudinary API key)
- `CLOUDINARY_API_SECRET` (Cloudinary API secret)
- `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` (your production domain)

## WhatsApp Integration

The site uses WhatsApp for order confirmation. The default number is `923122789939`. This can be changed in the admin settings panel.

Orders are sent via WhatsApp with pre-filled messages containing:
- Product name
- Price
- Customer inquiry details (from contact form)

## Default Categories

The site comes with three default categories:
- **Plain**: Elegant simplicity
- **Design**: Embroidered elegance
- **Simple**: Everyday comfort

Additional categories can be added via the admin panel.

## Future Enhancements

- Customer reviews/testimonials
- Simple analytics dashboard
- Bulk image upload
- WhatsApp Business API integration
- Order tracking system
- Email notifications

## License

This project is proprietary software for SK Hand Embroidery Boutique.
