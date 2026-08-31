# SkillBridge — Freelance Marketplace

A full-stack freelance marketplace built with the MERN stack, TailwindCSS, and Razorpay payment integration. Clients can post jobs and hire freelancers. Freelancers can offer services and receive secure escrow payments.

---

## Tech Stack

| Layer     | Technology                                    |
|-----------|-----------------------------------------------|
| Frontend  | React 18 (Vite), TailwindCSS, React Router v6 |
| Backend   | Node.js, Express.js                           |
| Database  | MongoDB, Mongoose                             |
| Payments  | Razorpay (Orders, Escrow, Route Transfers)    |
| Real-time | Socket.IO                                     |
| Auth      | JWT (JSON Web Tokens)                         |

---

## Features

### User Authentication
- Register and login as **Freelancer** or **Client**
- JWT-based authentication with role-based access control
- Forgot password and reset password via email token
- Change password from settings

### Freelancer Features
- Create and manage service listings with Basic / Standard / Premium pricing packages
- Browse job listings and submit proposals
- Accept contracts and submit work deliveries
- Receive payments via Razorpay Route (escrow release)
- View all contracts, transaction history
- Portfolio and profile showcase
- Respond to client reviews

### Client Features
- Post job listings with budget, skills, and deadline
- Browse freelancer services with search and filters
- Accept proposals and create contracts
- Fund escrow securely via Razorpay
- Approve delivered work — payment auto-releases and project auto-completes
- Leave star ratings and reviews after project completion

### Payment Flow (Razorpay)
1. Client funds escrow → Razorpay Order created → Payment verified via signature
2. Freelancer delivers work → Client approves
3. Client clicks Approve & Release → Razorpay Route transfer to freelancer
4. Contract status automatically set to **Completed**
5. Both parties notified in real-time

### Other Features
- Real-time notifications via Socket.IO
- In-contract messaging between client and freelancer
- Dashboard with stats (earnings, contracts, jobs)
- Transaction history
- Advanced search and filter for services and jobs
- Fully responsive design

---

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) running locally
  OR a free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud connection string
- A free [Razorpay](https://dashboard.razorpay.com/signup) account (test mode)

---

## Setup Instructions

### Step 1 — Clone or unzip the project

```bash
cd skillbridge
```

### Step 2 — Configure the Backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillbridge
JWT_SECRET=your_long_random_secret_key_here
JWT_EXPIRE=7d

# Get from https://dashboard.razorpay.com → Settings → API Keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=

# Gmail App Password (not your real Gmail password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password

CLIENT_URL=http://localhost:3000
PLATFORM_FEE_PERCENT=10
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App passwords → Generate one for Mail.

### Step 3 — Configure the Frontend

```bash
cd ../frontend
cp .env.example .env
```
```env
VITE_API_URL=
VITE_SOCKET_URL=
```

### Step 4 — Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 5 — Load sample data (optional but recommended)

```bash
cd backend
```

### Step 6 — Run the project

Open **two terminals**:

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
```
You should see:
```
MongoDB Connected: localhost
Server running on port 5000
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
```
You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

Open **http://localhost:3000** in your browser.

---

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register new user |
| POST | `/login` | Login |
| GET | `/me` | Get logged-in user |
| POST | `/forgot-password` | Send reset email |
| PUT | `/reset-password/:token` | Reset password |
| PUT | `/change-password` | Change password |

### Users — `/api/users`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/freelancers` | Browse freelancers |
| GET | `/dashboard` | Get dashboard stats |
| PUT | `/profile` | Update profile |
| GET | `/:id` | Get user profile |

### Services — `/api/services`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Browse all services |
| GET | `/my` | My services (freelancer) |
| GET | `/:id` | Service detail |
| POST | `/` | Create service |
| PUT | `/:id` | Update service |
| DELETE | `/:id` | Delete service |

### Jobs — `/api/jobs`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Browse all jobs |
| GET | `/my` | My jobs |
| GET | `/:id` | Job detail |
| POST | `/` | Post a job |
| PUT | `/:id` | Update job |
| DELETE | `/:id` | Delete job |
| POST | `/:id/proposals` | Submit proposal |
| PUT | `/:id/proposals/:pid` | Accept/reject proposal |

### Contracts — `/api/contracts`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create contract |
| GET | `/` | List contracts |
| GET | `/:id` | Contract detail |
| PUT | `/:id/status` | Update status |
| POST | `/:id/messages` | Send message |
| POST | `/:id/deliver` | Submit delivery |

### Payments — `/api/payments`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/create-order` | Create Razorpay order |
| POST | `/verify` | Verify payment signature |
| POST | `/release/:contractId` | Release payment to freelancer |
| POST | `/milestone/:cid/:mid` | Create milestone order |
| POST | `/milestone/:cid/:mid/verify` | Verify milestone payment |
| GET | `/transactions` | Transaction history |
| GET | `/razorpay-key` | Get Razorpay public key |
| POST | `/webhook` | Razorpay webhook handler |

### Reviews — `/api/reviews`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Submit review |
| GET | `/user/:userId` | Get user reviews |
| GET | `/contract/:contractId` | Get contract reviews |
| POST | `/:id/response` | Respond to review |

### Notifications — `/api/notifications`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get notifications |
| PUT | `/:id/read` | Mark as read |
| PUT | `/read-all` | Mark all as read |
| DELETE | `/:id` | Delete notification |

---

## Razorpay Test Credentials

Use these in the Razorpay payment popup during testing:

| Method | Details |
|---|---|
| UPI | `success@razorpay` |
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date (e.g. `12/26`) |
| CVV | `123` |
| OTP | `1234` |

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable                  | Required | Description |
|---------------------------|----------|-------------|
| `PORT`                    | No       | Server port (default: 5000) |
| `MONGO_URI`               | Yes      | MongoDB connection string |
| `JWT_SECRET`              | Yes      | Long random string for signing tokens |
| `JWT_EXPIRE`              | No       | Token expiry (default: 7d) |
| `RAZORPAY_KEY_ID`         | Yes      | Razorpay API Key ID |
| `RAZORPAY_KEY_SECRET`     | Yes      | Razorpay API Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | No       | Razorpay webhook secret |
| `EMAIL_HOST`              | No       | SMTP host for password reset emails |
| `EMAIL_PORT`              | No       | SMTP port |
| `EMAIL_USER`              | No       | SMTP email address |
| `EMAIL_PASS`              | No       | SMTP password or app password |
| `CLIENT_URL`              | Yes      | Frontend URL (http://localhost:3000) |
| `PLATFORM_FEE_PERCENT`    | No       | Platform fee % (default: 10) |

### Frontend (`frontend/.env`)

| Variable          | Description                               |
|-------------------|-------------------------------------------|
| `VITE_API_URL`    | Backend URL — leave blank for local dev   |
| `VITE_SOCKET_URL` | Socket.IO URL — leave blank for local dev |

---

## Known Limitations

- Password reset emails are logged to the console unless real SMTP credentials are provided
- File uploads accept URLs only — direct file upload requires adding multer + cloud storage (S3 / Cloudinary)
- Razorpay Route transfers require the freelancer's linked account to be verified with Razorpay KYC

---
#   f r e e l a n c e r s _ m a r k e t P l a c e  
 #   f r e e l a n c e r s _ m a r k e t P l a c e _  
 