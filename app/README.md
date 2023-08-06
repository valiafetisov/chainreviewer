This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm install
cp .env.example .env.local
npm run prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment variables

You can see all the environment variables in`.env.example`.
You can copy this file to create`.env.local`:

```bash
cp .env.example .env.local
```

### Etherscan API call

To use etherscan/optimism etherscan API call, you need to add api keys to `.env` file.
`ETHERSCAN_API_KEY`: to search for `mainnet`, `mainnet-georli`, `mainnet-sapolia`,
`ETHERSCAN_API_KEY_OPTIMISM`: to search for `optimism`
We only support chains specified above for now.

### Database

For development, we use `SQLite + prisma ORM`.
To setup database locally, please manually add `DATABASE_URL` to `.env.local` or copy the `.env.example` file.

```bash
# to create database locally
npm run prisma db push

# to check database state
npm run prisma studio

# to format schema.prisma file
npm run prisma format
```
