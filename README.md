# Currency Info API

A REST API service that provides currency-related information including quotes, average rates, and slippage calculations.

## Features

- Currency quote retrieval
- Average rate calculations
- Slippage analysis
- RESTful endpoints
- TypeScript implementation
- Prisma ORM integration
- PostgreSQL database

## Tech Stack

- Node.js
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── routes/         # API route definitions
├── services/       # Business logic services
└── server.ts      # Main application entry point

prisma/
├── schema.prisma  # Database schema
└── migrations/    # Database migrations
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm package manager
- PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/doTryCatch/currency-info-api.git
cd currency-info-api
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up your environment variables (create a `.env` file):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/currency_info_db"
```

4. Run database migrations:

```bash
pnpm prisma migrate dev
```

5. Start the development server:

```bash
pnpm dev
```

## API Endpoints

Base URL:

```
https://currency-info-api.vercel.app/api
```

For local development:

```
http://localhost:3000/api
```

The API provides the following endpoints:

### 1. Get Currency Quotes

```http
GET /quotes?region={region}
```

Fetches current exchange rates from multiple sources for the specified region.

**Parameters:**

- `region` (required): Currency region code (`ARS` or `BRL`)

**Example Response:**

```json
[
  {
    "buy_price": 350.5,
    "sell_price": 352.5,
    "source": "https://www.ambito.com/contenidos/dolar.html",
    "timestamp": "2025-11-02T12:00:00Z",
    "spread": 0.005
  }
]
```

### 2. Get Average Rates

```http
GET /average?region={region}
```

**Parameters:**

- `region` (required): Currency region code (`ARS` or `BRL`)

### 3. Get Slippage Analysis

```http
GET /slippage?region={region}
```

**Parameters:**

- `region` (required): Currency region code (`ARS` or `BRL`)

## Database Schema

```prisma
model Quote {
  id         Int      @id @default(autoincrement())
  region     String
  source     String
  buy_price  Decimal
  sell_price Decimal
  spread     Decimal?
  timestamp  DateTime @default(now())
  createdAt  DateTime @default(now())

  @@unique([region, source], name: "region_source")
}
```

## Data Sources

### ARS (Argentine Peso)

- Ámbito Financiero (ambito.com) | unable to fetch from this url
- Cronista (cronista.com)
- Dolar Hoy (dolarhoy.com)

### BRL (Brazilian Real)

- Wise (wise.com)
- Nubank (nubank.com.br)
- Nomad (nomadglobal.com) | unable to fetch from this url

## Author

[doTryCatch](https://github.com/doTryCatch)
