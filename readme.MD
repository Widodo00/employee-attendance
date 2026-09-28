# Employee Attendance

---

# Backend Setup

## 1. Install dependencies

Navigate to the backend directory:

cd backend
npm install

## 2. Configure environment variables

Create a .env file inside the backend directory:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/employee_attendance?schema=public"
JWT_SECRET="your-secret-key"
```

Replace 'your_password' with your PostgreSQL password

## 3. Create database

Create database in your PostgreSQL:

CREATE DATABASE employee_attendance;

## 4. Run database migration and generate prisma client

Generate and apply the Prisma migration:

npx prisma migrate dev --name init
npx prisma generate

## 5. Run database seeder

npx prisma db seed

## 6. Start the backend

npm run start:dev

The backend will run at: http://localhost:3000

---

# Frontend Setup

## 1. Install dependencies

Navigate to the frontend directory:

cd frontend
npm install

## 2. Configure environment variables

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000/
VITE_PUBLIC_KEY=o5HcZTIiyosF12jdBErN5r1iOEjxZHBh
VITE_PUBLIC_KEY_TOKEN=RfEM6HubGzb2LZnnZzlju6eGMjemxFEG
```

## 3. Start the frontend

npm run dev

The frontend will usually run at: http://localhost:5173

---
