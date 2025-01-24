# Medium Blog App Backend

This is the backend of the Medium Blog App. It is written in Hono and uses Prisma with a PostgreSQL database. All APIs are written using Hono and Zod for validation.

## Technologies Used

- Hono
- Prisma
- Prisma Accelerate (for connection pooling)
- PostgreSQL
- TypeScript
- Cloudflare Worker
- Custom NPM Package: @abhinashsinghwk/mediumblog-zod

## Installation

```bash
git clone https://github.com/avinashsinghwk/medium-Blog-backend.git
```

```bash
cd medium-Blog-backend
```

```bash
npm install
```
`Copy the contents from .env.sample to .env and paste your direct PostgreSQL database link and Prisma Accelerate link to the DATABASE_URL. Also, add this information in the wrangler.toml file and write the JWT_SECRET in the wrangler.toml file.`

```bash
npx prisma migrate dev
```

```bash
npx prisma generate
```

```bash
npm run dev
```
## Deployment

The backend is deployed on Cloudflare Worker. You can access it [here](https://medium-blog-frontend.vercel.app).

## Notes

- Ensure that the frontend is also installed and running for full functionality.

- The frontend repository can be found [here](https://github.com/avinashsinghwk/medium-Blog-frontend).

