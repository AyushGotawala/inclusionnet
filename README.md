# InclusionNet - Peer-to-Peer Lending Platform

InclusionNet is a comprehensive peer-to-peer (P2P) lending platform that connects borrowers and lenders directly, facilitating loan applications, KYC verification, real-time communication, and loan management. The platform includes ML-powered credit scoring, intelligent loan matching, and a complete admin dashboard for platform management.

## 🚀 Features

### Borrower Functionalities
- **User Registration & KYC Verification**: Complete registration with KYC document upload (Aadhaar, PAN)
- **Loan Application**: Submit loan applications with personal and financial details
- **Credit Score Viewing**: View ML-generated credit scores with detailed insights
- **Application Tracking**: Track loan application status with real-time updates and system feedback
- **Matching Lenders**: View and request funding from matching lenders based on loan requirements
- **Real-time Chat**: Communicate with lenders through WhatsApp-like chat interface
- **Profile Management**: Upload profile pictures and manage personal information

### Lender Functionalities
- **Lender Registration & KYC**: Complete registration with KYC authentication and interest rate specification (5-12%)
- **Lending Preferences**: Specify investment capacity, risk appetite, and lending criteria
- **Borrower Insights**: Access comprehensive borrower profiles with credit scores, loan history, and financial metrics
- **Loan Matching**: Browse matching loan opportunities based on available funds and preferences
- **Loan Requests**: Send and receive loan funding requests
- **Real-time Chat**: Communicate with borrowers through real-time messaging

### Admin Functionalities
- **Platform Monitoring**: Monitor all platform activity including registrations, KYC status, and loan applications
- **KYC Management**: Review and approve/reject borrower and lender KYC submissions
- **Loan Management**: Review loan applications, update status, and add remarks
- **Analytics & Reporting**: Access comprehensive insights for academic evaluation and reporting
- **Support Ticket Management**: Handle user support tickets with priority-based categorization

### Additional Features
- **Real-time Notifications**: Push notifications for new messages and loan requests
- **WhatsApp-like Chat**: Real-time messaging with read receipts, online status, and typing indicators
- **Emoji Support**: Full emoji picker with skin tone selection
- **File Upload**: Secure document and profile picture uploads
- **Role-based Access Control**: Secure authentication and authorization for different user roles
- **Responsive Design**: Modern UI built with Tailwind CSS, fully responsive across devices

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - UI library
- **React Router v7** - Client-side routing
- **Redux Toolkit** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool and dev server
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **Emoji Picker React** - Emoji selection component
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express 5.1.0** - Web framework
- **Prisma 7.1.0** - ORM and database toolkit
- **PostgreSQL** - Relational database
- **Socket.io 4.8.1** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Cloud file storage (optional)
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
inclusionnet/
├── backend/
│   ├── prisma/
│   │   ├── migrations/          # Database migrations
│   │   └── schema.prisma        # Prisma schema definition
│   ├── scripts/
│   │   └── createAdmin.js       # Admin user creation script
│   ├── src/
│   │   ├── app.js               # Express app configuration
│   │   ├── controllers/         # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── kycController.js
│   │   │   ├── loanController.js
│   │   │   ├── loanEligibilityController.js
│   │   │   ├── loanRequestController.js
│   │   │   ├── chatController.js
│   │   │   ├── userController.js
│   │   │   ├── supportController.js
│   │   │   └── adminKycController.js
│   │   ├── middlewares/          # Custom middleware
│   │   │   ├── auth.js          # JWT authentication
│   │   │   ├── authValidate.js  # Authorization & validation
│   │   │   ├── kycValidators.js
│   │   │   ├── loanValidators.js
│   │   │   ├── kycUplaod.js     # KYC document upload
│   │   │   ├── profilePictureUpload.js
│   │   │   └── invalidRoute.js  # 404 handler
│   │   ├── models/              # Database models
│   │   │   ├── User.js
│   │   │   ├── BorrowerProfile.js
│   │   │   ├── LenderProfile.js
│   │   │   └── LoanApplication.js
│   │   ├── routes/               # API routes
│   │   │   ├── authRoute.js
│   │   │   ├── kycRoutes.js
│   │   │   ├── loanRoutes.js
│   │   │   ├── loanRequestRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── supportRoutes.js
│   │   ├── socket/               # Socket.io implementation
│   │   │   ├── socketServer.js   # Socket server setup
│   │   │   ├── socketHandlers.js # Socket event handlers
│   │   │   └── index.js         # Socket initialization
│   │   ├── utils/                # Utility functions
│   │   │   ├── loanEligibility.js  # Loan eligibility calculations
│   │   │   └── loanMatching.js      # Loan matching algorithm
│   │   └── lib/
│   │       └── prisma.js         # Prisma client instance
│   ├── server.js                 # Server entry point
│   ├── package.json
│   └── .env                      # Environment variables
│
├── frontend/
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── auth/             # Authentication components
│   │   │   ├── dashboards/       # Dashboard components
│   │   │   ├── kyc/              # KYC forms
│   │   │   ├── loans/            # Loan management
│   │   │   ├── chat/             # Chat interface
│   │   │   ├── messages/         # Messages page
│   │   │   ├── profile/           # Profile management
│   │   │   ├── requests/         # Loan requests
│   │   │   ├── Layout.jsx        # Main layout
│   │   │   ├── LandingPage.jsx   # Landing page
│   │   │   └── ProtectedRoute.jsx # Route protection
│   │   ├── store/                # Redux store
│   │   │   ├── index.js          # Store configuration
│   │   │   └── slices/          # Redux slices
│   │   │       ├── authSlice.js
│   │   │       ├── kycSlice.js
│   │   │       ├── loanSlice.js
│   │   │       ├── loanRequestSlice.js
│   │   │       └── chatSlice.js
│   │   ├── utils/                # Utility functions
│   │   │   └── loanEligibility.js
│   │   ├── styles/               # Global styles
│   │   │   └── animations.css
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx             # Entry point
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Tailwind configuration
│   └── package.json
│
└── README.md                      # This file
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd inclusionnet
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env  # Or create manually
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/inclusionnet?schema=public"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# File Upload Configuration (Optional - for Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5174
```

### 4. Database Setup

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database with initial data
# npx prisma db seed
```

### 5. Create Admin User (Optional)

```bash
cd backend
node scripts/createAdmin.js
```

### 6. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (if needed)
# VITE_API_URL=http://localhost:5000
```

## 🚀 Running the Project

### Development Mode

#### Start Backend Server

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5174
```

### Production Build

#### Build Frontend

```bash
cd frontend
npm run build
# Output in dist/ directory
```

#### Start Backend in Production

```bash
cd backend
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/SignUp` - User registration
- `POST /api/auth/Login` - User login

### KYC Management
- `POST /api/kyc/borrower` - Submit borrower KYC
- `POST /api/kyc/lender` - Submit lender KYC
- `GET /api/kyc/borrower` - Get borrower KYC status
- `GET /api/kyc/lender` - Get lender KYC status
- `GET /api/kyc/admin/borrowers` - Get all borrower KYC (Admin)
- `GET /api/kyc/admin/lenders` - Get all lender KYC (Admin)
- `PATCH /api/kyc/admin/borrowers/:userId` - Update borrower KYC status (Admin)
- `PATCH /api/kyc/admin/lenders/:userId` - Update lender KYC status (Admin)

### Loan Management
- `GET /api/loans/eligibility` - Get loan eligibility
- `POST /api/loans/apply` - Submit loan application
- `GET /api/loans/my-applications` - Get borrower's loan applications
- `GET /api/loans/:id` - Get loan application by ID
- `GET /api/loans/:loanApplicationId/matching-lenders` - Get matching lenders
- `GET /api/loans/matching-loans` - Get matching loans (Lender)
- `GET /api/loans/borrowers/:borrowerId/profile` - Get borrower profile (Lender)
- `GET /api/loans/admin/all` - Get all loan applications (Admin)
- `PATCH /api/loans/admin/:id/status` - Update loan status (Admin)

### Loan Requests
- `POST /api/loan-requests` - Create loan request
- `GET /api/loan-requests/borrower` - Get borrower's loan requests
- `GET /api/loan-requests/lender` - Get lender's loan requests
- `PATCH /api/loan-requests/:id/accept` - Accept loan request
- `PATCH /api/loan-requests/:id/reject` - Reject loan request

### Chat & Messaging
- `GET /api/chat/active-chats` - Get active chat conversations
- `GET /api/chat/messages/:loanRequestId` - Get chat messages
- `POST /api/chat/messages` - Send message
- `PATCH /api/chat/messages/:loanRequestId/read` - Mark messages as read
- `GET /api/chat/unread-count` - Get unread message count

### User Management
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update user profile
- `POST /api/user/profile/picture` - Upload profile picture
- `POST /api/user/reset-password` - Request password reset
- `POST /api/user/reset-password/:token` - Reset password with token

### Support Tickets
- `POST /api/support/tickets` - Create support ticket
- `GET /api/support/tickets` - Get user's support tickets
- `GET /api/support/tickets/:id` - Get ticket details
- `POST /api/support/tickets/:id/replies` - Add ticket reply
- `PATCH /api/support/tickets/:id/status` - Update ticket status (Admin)

### Static Files
- `GET /api/documents/kyc/:filename` - Serve KYC documents
- `GET /api/profile-pictures/:filename` - Serve profile pictures

## 🗄️ Database Schema

### Main Entities
- **User**: Core user accounts with authentication
- **BorrowerProfile**: Borrower KYC and financial information
- **LenderProfile**: Lender KYC and investment capacity
- **LoanApplication**: Loan applications submitted by borrowers
- **LoanRequest**: Funding requests between borrowers and lenders
- **ChatMessage**: Real-time chat messages
- **SupportTicket**: User support tickets
- **SupportTicketReply**: Support ticket replies

### Key Relationships
- User → BorrowerProfile (1:1)
- User → LenderProfile (1:1)
- BorrowerProfile → LoanApplication (1:N)
- LoanApplication → LoanRequest (1:N)
- LoanRequest → ChatMessage (1:N)
- User → SupportTicket (1:N)

## 🔐 Authentication & Authorization

- **JWT-based Authentication**: All protected routes require a valid JWT token
- **Role-based Access Control**: Three roles - BORROWER, LENDER, ADMIN
- **Protected Routes**: Middleware validates user authentication and role permissions
- **Password Security**: Passwords are hashed using bcrypt (12 rounds)

## 💬 Real-time Features

### Socket.io Events

#### Client → Server
- `join_chat_room` - Join a chat room
- `send_message` - Send a chat message
- `user_typing` - Typing indicator
- `mark_as_read` - Mark messages as read
- `check_online_status` - Check if user is online

#### Server → Client
- `new_message` - New message received
- `message_sent` - Message delivery confirmation
- `messages_read` - Messages marked as read
- `user_online` - User came online
- `user_offline` - User went offline
- `online_status` - Online status response
- `message_notification` - New message notification

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: (Can be implemented)
- **Real-time Updates**: Live notifications and status updates
- **WhatsApp-like Chat**: Familiar chat interface with read receipts
- **Smooth Animations**: CSS animations for better user experience
- **Form Validation**: Client-side and server-side validation
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during API calls

## 🧪 Testing

```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

## 📦 Deployment

### Backend Deployment

1. Set production environment variables
2. Build and start the server:
   ```bash
   npm start
   ```
3. Ensure PostgreSQL database is accessible
4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Frontend Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```
2. Deploy the `dist/` directory to a static hosting service (Vercel, Netlify, etc.)
3. Configure environment variables for API URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Ayush Gotawala

## 🙏 Acknowledgments

- React Team
- Express.js Community
- Prisma Team
- Socket.io Team
- Tailwind CSS Team

## 📞 Support

For support, email support@inclusionnet.com or create a support ticket in the platform.

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - User registration and authentication
  - KYC verification system
  - Loan application and management
  - Real-time chat functionality
  - Admin dashboard
  - Support ticket system

---

**Note**: This is a development version. Ensure all environment variables are properly configured and security best practices are followed before deploying to production.
