# Backend Learning ORM

A dockerized full-stack todo application that showcases a Node.js + Express backend, PostgreSQL managed through Prisma ORM, JWT-powered authentication, and a responsive static frontend. This project is meant for learning end-to-end backend fundamentals while keeping the developer experience modern (TypeScript, pnpm, tsx).

## ✨ Features

- **JWT authentication** – user registration, login, and account deletion with hashed passwords (bcrypt).
- **Todo CRUD** – authenticated users can create, list, update, and delete their own todos.
- **Prisma ORM** – strongly-typed database access and migrations targeting PostgreSQL.
- **TypeScript everywhere** – strict typing for Express middleware, routes, and Prisma clients.
- **Docker-first workflow** – one command to spin up the API + PostgreSQL stack.
- **Static frontend** – served directly by Express from `public/`.

## 🧱 Tech Stack

| Layer        | Tools                                                                 |
|--------------|-----------------------------------------------------------------------|
| Runtime      | Node.js 20, TypeScript, tsx                                           |
| Web Server   | Express 5                                                             |
| Database     | PostgreSQL 15 + Prisma Client                                         |
| Auth & Crypto| JSON Web Tokens, bcryptjs                                             |
| Tooling      | pnpm, ESLint, Prettier                                                |
| Container    | Dockerfile + docker-compose                                           |

## 📁 Project Structure

```
backend-learning-orm/
├── prisma/
│   └── schema.prisma          # Prisma data model (Users, Todos)
├── src/
│   ├── middleware/
│   │   └── auth-middleware.ts # JWT verification + request augmentation
│   ├── routes/
│   │   ├── auth-routes.ts     # Register, login, delete account
│   │   └── todo-routes.ts     # Todo CRUD endpoints
│   ├── prisma-client.ts       # Prisma client singleton
│   └── server.ts              # Express app and route wiring
├── public/                    # Static HTML/CSS served by Express
├── Dockerfile                 # App container definition
├── docker-compose.yml         # App + PostgreSQL stack
├── .env.example               # Sample environment variables
└── package.json               # Scripts and dependencies
```

## ⚙️ Environment Variables

The server reads configuration from `.env`. Duplicate `.env.example` and adjust values:

```bash
cp .env.example .env
```

| Variable      | Description                                                                    | Example                                 |
|---------------|--------------------------------------------------------------------------------|-----------------------------------------|
| `PORT`        | HTTP port for the Express server                                               | `3000`                                  |
| `JWT_SECRET`  | Secret string for signing JSON Web Tokens                                     | `super-secret-string`                   |
| `DATABASE_URL`| Prisma connection string (PostgreSQL or SQLite during local development)      | `postgresql://user:pass@localhost:5432/db`

> The Docker Compose file injects its own `DATABASE_URL` that points at the bundled PostgreSQL container.

## 🚀 Getting Started (Local pnpm workflow)

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Generate the Prisma Client**
   ```bash
   pnpm prisma generate
   ```

3. **Apply migrations / sync schema** (pick one)
   ```bash
   # development loop – creates or alters tables based on schema.prisma
   pnpm prisma migrate dev --name init

   # or, if you do not want migration files, push schema directly (not recommended for prod)
   pnpm prisma db push
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```
   The API will be reachable at `http://localhost:3000` and will serve the static frontend from `/public`.

5. **Type-check without emitting JS**
   ```bash
   pnpm check
   ```

## 🐳 Running with Docker Compose

> Requires Docker Desktop or a compatible container runtime.

```bash
# Build images (app + postgres) and start in the background
cd backend-learning-orm
docker compose up -d

# Tail logs if needed
docker compose logs -f

# Stop and remove containers and network
docker compose down
```

The compose stack exposes:
- **API** – `http://localhost:3000`
- **PostgreSQL** – `localhost:5432` (user `postgres` / password `postgres` / db `learningorm`)

Volumes keep the database persistent (`db-data`).

## 🔌 API Reference

All JSON responses use the shape `{ data?, message?, error? }`. Authentication routes return a JWT token; todo routes require the token in the `Authorization` header.

### Auth (`/auth`)

| Method | Path               | Description                          | Body                                  |
|--------|--------------------|--------------------------------------|---------------------------------------|
| GET    | `/auth/`           | List users (development/testing)     | –                                     |
| POST   | `/auth/register`   | Create user & receive JWT            | `{ "username": string, "password": string }` |
| POST   | `/auth/login`      | Login and receive JWT                | `{ "username": string, "password": string }` |
| DELETE | `/auth/delete-account` | Delete user and their todos     | `{ "username": string, "password": string }` |

### Todos (`/todos`) – requires `Authorization: <token>`

| Method | Path         | Description                   | Body                                              |
|--------|--------------|-------------------------------|---------------------------------------------------|
| GET    | `/todos/`    | Fetch current user's todos    | –                                                 |
| POST   | `/todos/`    | Create a todo                 | `{ "task": string, "completed?": boolean }`    |
| PUT    | `/todos/:id` | Update an existing todo       | `{ "task": string, "completed": boolean }`     |
| DELETE | `/todos/:id` | Remove a todo                 | –                                                 |

### Sample REST Client Request (`test.rest` compatible)

```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "supersecret"
}
```

Use the returned token for subsequent `/todos` requests.

## 🧪 Useful Scripts

| Command            | Description                                   |
|-------------------|-----------------------------------------------|
| `pnpm dev`        | Start Express with live reload via `tsx watch` |
| `pnpm build`      | Transpile TypeScript to `dist/`                |
| `pnpm check`      | Type-check the codebase                        |
| `pnpm prisma studio` | Launch Prisma Studio GUI (optional)        |

## 🗄️ Database Schema Snapshot

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  todos     Todo[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Todo {
  id        Int      @id @default(autoincrement())
  task      String
  completed Boolean  @default(false)
  user      User     @relation(fields: [userId], references: [id])
  userId    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🛠️ Troubleshooting

- **`PrismaClient is not defined`** – run `pnpm prisma generate` after installing dependencies or when the schema changes.
- **Database connection refused** – ensure PostgreSQL is running (locally or via Docker) and that `DATABASE_URL` is correct.
- **Docker volume permissions** – remove the `db-data` volume with `docker volume rm backend-learning-orm_db-data` if you need a clean database.

## 🤝 Contributing

1. Fork the repo, create a feature branch (`git checkout -b feature/my-change`).
2. Run `pnpm check` and, if relevant, `pnpm prisma migrate dev` to capture schema updates.
3. Commit with clear messages and open a Pull Request.

## 📄 License

This project is released under the [ISC License](./LICENSE) unless stated otherwise.

---

Happy hacking! If you build something cool on top of this stack, share it back so others can learn too. 🚀
