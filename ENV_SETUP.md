# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# PostgreSQL Database
DATABASE_URL=postgresql://username:password@localhost:5432/abayas

# Cloudinary (Image Upload)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Getting Cloudinary Credentials

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Go to Dashboard > Account Details
4. Copy:
   - **Cloud Name** (for NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
   - **API Key** (for CLOUDINARY_API_KEY)
   - **API Secret** (for CLOUDINARY_API_SECRET)

## Getting PostgreSQL Connection String

### Option 1: Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create a database: `createdb abayas`
3. Use this connection string: `postgresql://username:password@localhost:5432/abayas`

### Option 2: Supabase (Recommended for Free Hosting)
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Project Settings > Database
4. Copy the Connection String (URI format)
5. Replace with your database password

### Option 3: Neon (Serverless PostgreSQL)
1. Go to [Neon](https://neon.tech/)
2. Create a new project
3. Copy the connection string from the dashboard

## Setting up Prisma

After setting up your `.env.local` file:

1. Install Prisma CLI (already in package.json):
   ```bash
   npm install
   ```

2. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

3. Push schema to database:
   ```bash
   npx prisma db push
   ```

4. (Optional) Open Prisma Studio to view data:
   ```bash
   npx prisma studio
   ```

## Image Storage

Images are now uploaded to Cloudinary. The free tier includes:
- 25 GB storage
- 25 GB bandwidth per month
- Unlimited transformations

Images are stored in the `abayas/products` folder in your Cloudinary account.
