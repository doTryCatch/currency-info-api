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

The API provides the following endpoints:

### Quotes

- Get currency quotes
- Historical quote data
- Real-time exchange rates

### Average Rates

- Calculate average rates over time periods
- Moving averages
- Weighted averages

### Slippage Analysis

- Calculate price slippage
- Market impact analysis
- Trading cost analysis

## Database Schema

The database schema is managed through Prisma and includes tables for storing currency data, historical rates, and market analysis information. See `prisma/schema.prisma` for detailed schema information.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

[doTryCatch](https://github.com/doTryCatch)
