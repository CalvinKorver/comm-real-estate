# Keystone Commercial Real Estate

## Overview
A commercial real estate investment management platform built with Next.js, Prisma, NextAuth, and Vercel Postgres.

## Features

### Property Management
- Create, view, edit, and delete properties
- Property search and filtering
- Owner management and contact information
- Property images and details

### Interactive Map View
- **Google Maps Integration**: Properties are displayed on an interactive Google Maps interface
- **Property Markers**: Each property with coordinates is shown as a marker on the map
- **Price Labels**: Markers display the property price in a formatted label (e.g., "$1500k")
- **Automatic Bounds**: Map automatically fits to show all property markers
- **Responsive Design**: Map works on both desktop and mobile devices

### Map Features
- **Coordinate Support**: Properties can have latitude/longitude coordinates stored in the database
- **Marker Management**: Markers are automatically created, updated, and cleaned up
- **Click Handling**: Markers can be clicked for property details (extensible)
- **Custom Styling**: Map markers have custom CSS styling for better visibility

### Geocoding
- Google Maps Geocoding API integration
- Batch geocoding for multiple properties
- Address validation and coordinate storage

## Map Implementation

### Database Schema
Properties can have associated coordinates stored in a separate `Coordinate` table:
```sql
model Coordinate {
  id          String   @id @default(uuid())
  propertyId  String   @unique
  latitude    Float
  longitude   Float
  confidence  String   // 'high', 'medium', 'low'
  placeId     String?  // Google Place ID
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
}
```

### Components
- `GoogleMapContainer`: Core map component that handles Google Maps integration
- `PropertyMapView`: Main map view component with property list and map panels
- `PropertyMapPanel`: Map panel component
- `PropertyListPanel`: Property list panel component

### Usage
Navigate to `/properties/map` to view the interactive property map. The map will:
1. Fetch all properties from the API
2. Filter properties that have coordinates
3. Create Google Maps markers for each property
4. Display price labels on markers
5. Automatically fit the map bounds to show all markers

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/comm-real-estate.git
cd comm-real-estate
```

### 2. Install dependencies
```bash
npm install
```

Install colima

colima start --cpu 1 --memory 2 --disk 10

### 3. Set up environment variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

- `DATABASE_URL` (Vercel Postgres connection string)
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `MAILCHIMP_API_KEY`, `MAILCHIMP_SERVER_PREFIX`, `MAILCHIMP_LIST_ID`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`

### 4. Set up the database
Run Prisma migrations to set up your Postgres database:
```bash
npx prisma migrate deploy
npx prisma generate
```

### 5. Run locally
```bash
npm run dev
```

## Deployment

### Deploying to Vercel
1. Push your code to GitHub.
2. Import your repo into [Vercel](https://vercel.com/).
3. Set all environment variables in the Vercel dashboard.
4. Vercel will automatically build and deploy your app.

### Database
- Use [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres/overview) for production.
- Update your `DATABASE_URL` accordingly.

## Scripts
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npx prisma migrate deploy` — Deploy migrations
- `npx prisma generate` — Generate Prisma client

## License
MIT
