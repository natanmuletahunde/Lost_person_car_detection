# Lost Person and Car Detection Backend

A production-ready Node.js Express backend API for the Lost Person and Car Detection System.

## Features

- User authentication (JWT-based)
- User profile management
- Sightings reporting and tracking
- Feedback system
- Alert management
- Admin dashboard
- Role-based access control
- Secure API endpoints
- Input validation
- Rate limiting
- Error handling

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose)
- **Authentication:** JWT
- **Security:** Helmet, CORS, Rate Limiting, Mongo Sanitize, XSS Clean

## Project Structure

```
backend/
├── config/
│   ├── database.js       # MongoDB connection
│   └── index.js          # Configuration
├── controllers/
│   ├── alert.controller.js
│   ├── auth.controller.js
│   ├── feedback.controller.js
│   ├── sighting.controller.js
│   └── user.controller.js
├── middlewares/
│   ├── auth.js           # Authentication middleware
│   ├── errorHandler.js   # Error handling
│   └── validate.js       # Validation middleware
├── models/
│   ├── Alert.js
│   ├── Feedback.js
│   ├── Sighting.js
│   ├── Subscription.js
│   └── User.js
├── routes/
│   ├── alert.routes.js
│   ├── auth.routes.js
│   ├── feedback.routes.js
│   ├── sighting.routes.js
│   └── user.routes.js
├── utils/
│   ├── ApiResponse.js
│   ├── helpers.js
│   └── jwt.js
├── validations/
│   ├── auth.validation.js
│   ├── feedback.validation.js
│   └── sighting.validation.js
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lost_person_car_detection
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` with your configuration**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/lost_person_car_detection
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-refresh-secret-key
   JWT_REFRESH_EXPIRES_IN=30d
   BCRYPT_SALT_ROUNDS=12
   FRONTEND_URL=http://localhost:3000
   CORS_ORIGIN=http://localhost:3000
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system or use MongoDB Atlas.

6. **Run the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

7. **API will be available at**
   ```
   http://localhost:5000/api/v1
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user
- `PATCH /api/v1/auth/profile` - Update profile
- `PATCH /api/v1/auth/change-password` - Change password

### Users (Admin only)
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `GET /api/v1/users/stats` - Get dashboard stats

### Sightings
- `POST /api/v1/sightings` - Report new sighting
- `GET /api/v1/sightings/my-sightings` - Get user's sightings
- `GET /api/v1/sightings` - Get all sightings (Admin)
- `GET /api/v1/sightings/:id` - Get sighting by ID
- `PATCH /api/v1/sightings/:id` - Update sighting
- `DELETE /api/v1/sightings/:id` - Delete sighting (Admin)
- `GET /api/v1/sightings/nearby` - Get nearby sightings

### Feedback
- `POST /api/v1/feedback` - Submit feedback
- `GET /api/v1/feedback/my-feedback` - Get user's feedback
- `GET /api/v1/feedback` - Get all feedback (Admin)
- `GET /api/v1/feedback/:id` - Get feedback by ID
- `PATCH /api/v1/feedback/:id/respond` - Respond to feedback
- `PATCH /api/v1/feedback/:id/status` - Update feedback status
- `DELETE /api/v1/feedback/:id` - Delete feedback (Admin)

### Alerts
- `POST /api/v1/alerts` - Create alert
- `GET /api/v1/alerts/my-alerts` - Get user's alerts
- `GET /api/v1/alerts` - Get all alerts (Admin)
- `PATCH /api/v1/alerts/:id/read` - Mark as read
- `PATCH /api/v1/alerts/mark-all-read` - Mark all as read
- `PATCH /api/v1/alerts/:id/dismiss` - Dismiss alert
- `DELETE /api/v1/alerts/:id` - Delete alert

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment (development/production) | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/lost_person_car_detection |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRES_IN | JWT token expiry | 7d |
| JWT_REFRESH_SECRET | Refresh token secret | - |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry | 30d |
| BCRYPT_SALT_ROUNDS | Password hashing rounds | 12 |
| CORS_ORIGIN | CORS allowed origin | http://localhost:3000 |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 900000 (15 min) |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet security headers
- MongoDB injection prevention
- XSS protection

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error message"
    }
  ]
}
```

## Pagination

List endpoints support pagination:

```
GET /api/v1/users?page=1&limit=10
```

Response includes metadata:
```json
{
  "success": true,
  "message": "Items retrieved",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## License

ISC
