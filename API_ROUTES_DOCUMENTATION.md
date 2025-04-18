# Multiplex API Routes Documentation

This document provides a comprehensive list of all API routes available in the Multiplex application, organized by category.

## Base URL

All API endpoints are prefixed with:
```
/nodeapi/rest-api/v130
```

## Authentication

Most API endpoints require authentication. There are two authentication methods:

1. **API Key Authentication**: Required for most endpoints
   - Add the API key to the request header: `x-api-key: YOUR_API_KEY`

2. **User Authentication**: Required for user-specific operations
   - Login to obtain a JWT token
   - Add the token to the request header: `Authorization: Bearer YOUR_JWT_TOKEN`

## Table of Contents

1. [Mobile Routes](#mobile-routes)
2. [Admin Routes](#admin-routes)
3. [Web Routes](#web-routes)
4. [Generic CRUD Routes](#generic-crud-routes)

## Mobile Routes

These routes are primarily used by mobile applications to interact with the Multiplex platform.

### Comment Routes
Base path: `/comment`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/` | Get all comments |
| POST   | `/` | Create a new comment |
| GET    | `/:id` | Get a comment by ID |
| PUT    | `/:id` | Update a comment |
| DELETE | `/` | Delete a comment |

### Country Routes
Base path: `/country`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/` | Get all countries |

### Config Routes
Base path: `/config`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/` | Get full configuration |

### Movies Routes
Base path: `/movies`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/` | Get all movies |
| GET    | `/:id` | Get a movie by ID |
| POST   | `/` | Create a new movie |
| PUT    | `/:id` | Update a movie |
| DELETE | `/:id` | Delete a movie |

#### Example Request/Response

**Request - Get all movies**
```http
GET /nodeapi/rest-api/v130/movies
Content-Type: application/json
x-api-key: your-api-key
```

**Response**
```json
{
  "status": "success",
  "data": [
    {
      "videos_id": 1,
      "title": "Example Movie",
      "description": "This is an example movie",
      "slug": "example-movie",
      "release": "2023-01-01",
      "is_paid": "1",
      "runtime": "120",
      "video_quality": "HD",
      "thumbnail_url": "https://example.com/thumbnail.jpg",
      "poster_url": "https://example.com/poster.jpg"
    }
  ]
}
```

### Web Series Routes
Base path: `/webseries`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/` | Get all web series |
| GET    | `/:id` | Get a web series by ID |
| POST   | `/` | Create a new web series |
| PUT    | `/:id` | Update a web series |
| DELETE | `/:id` | Delete a web series |
| POST   | `/:id/seasons` | Add a season to a web series |
| POST   | `/:id/seasons/:seasonId/episodes` | Add an episode to a season |

### Favorite Routes
Base path: `/favorite`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/` | Get user favorites |
| POST   | `/add` | Add to favorites |
| GET    | `/verify` | Verify if item is in favorites |
| DELETE | `/remove` | Remove from favorites |

### User Login Routes
Base path: `/user`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/login` | User login |

#### Example Request/Response

**Request - User Login**
```http
POST /nodeapi/rest-api/v130/user/login
Content-Type: application/json
x-api-key: your-api-key

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user_id": 123,
    "name": "John Doe",
    "email": "user@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Home Content Routes
Base path: `/home_content_for_android`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/` | Get home content for Android |

### Subscription Routes
Base path: `/check_user_subscription_status`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/` | Get user subscription status |

## Admin Routes

These routes are used for administrative functions and content management.

### Genre Routes
Base path: `/genres`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/add` | Add a new genre |
| GET    | `/all` | Get all genres |
| GET    | `/:id` | Get a genre by ID |
| PUT    | `/:id` | Update a genre |
| DELETE | `/:id` | Delete a genre |

### Channel Routes
Base path: `/getchannellist`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/` | Get channel list |
| POST   | `/` | Create a channel |
| PUT    | `/:id` | Update a channel |
| DELETE | `/:id` | Delete a channel |
| POST   | `/status` | Update channel status |

### Plan Routes
Base path: `/all_package`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/plans` | Get all plans |
| GET    | `/plans/:id` | Get a plan by ID |
| POST   | `/plans` | Create a new plan |
| PUT    | `/plans/:id` | Update a plan |
| DELETE | `/plans/:id` | Delete a plan |

### Slider Routes
Base path: `/slider`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/` | Get all sliders |
| GET    | `/:id` | Get a slider by ID |
| POST   | `/` | Create a new slider |
| PUT    | `/:id` | Update a slider |
| DELETE | `/:id` | Delete a slider |

### Admin Authentication Routes
Base path: `/adminauth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/login` | Admin login |
| POST   | `/register` | Admin registration |

#### Example Request/Response

**Request - Admin Login**
```http
POST /nodeapi/rest-api/v130/adminauth/login
Content-Type: application/json
x-api-key: your-api-key

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response**
```json
{
  "status": "success",
  "message": "Admin login successful",
  "data": {
    "admin_id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Admin Movies Routes
Base path: `/adminmovies`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/movies` | Get all movies |
| GET    | `/movie/:id` | Get a movie by ID |
| POST   | `/movies` | Add a new movie |
| PUT    | `/movies/:id` | Upload video for a movie |
| PUT    | `/movie/:id` | Update a movie |
| DELETE | `/movie/:id` | Delete a movie |

### Admin Web Series Routes
Base path: `/adminwebseries`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/webseries` | Get all web series |
| GET    | `/webseries/:id` | Get a web series by ID |
| POST   | `/webseries` | Add a new web series |
| PUT    | `/webseries/:id` | Update a web series |
| DELETE | `/webseries/:id` | Delete a web series |

### Admin Plans Routes
Base path: `/adminplans`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/plans` | Get all plans |
| GET    | `/plans/:id` | Get a plan by ID |
| POST   | `/plans` | Add a new plan |
| PUT    | `/plans/:id` | Update a plan |
| DELETE | `/plans/:id` | Delete a plan |

### Admin Banner Routes
Base path: `/adminbanner`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/slider` | Get all sliders |
| GET    | `/slider/:id` | Get a slider by ID |
| POST   | `/slider` | Add a new slider |
| PUT    | `/slider/:id` | Update a slider |
| DELETE | `/slider/:id` | Delete a slider |

### Payment Routes
Base path: `/payment`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/` | Get all subscriptions |
| GET    | `/:id` | Get subscription by ID |
| POST   | `/` | Add a new subscription |
| PUT    | `/:id` | Update a subscription |
| DELETE | `/:id` | Delete a subscription |

## Web Routes

These routes are specifically designed for web application interfaces.

### Web Authentication Routes
Base path: `/web/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/login` | Web login |
| GET    | `/google` | Google OAuth login |
| GET    | `/google/callback` | Google OAuth callback |

## Generic CRUD Routes

The application includes generic CRUD routes that can be used with any model. These provide a standardized way to perform common operations on any data model in the system.

Base path: `/crud/:model`

| Method | Endpoint | Description | Example |
|--------|----------|-------------|--------|
| POST   | `/` | Create a new record | `POST /crud/users` |
| GET    | `/` | Get all records | `GET /crud/movies` |
| GET    | `/:id` | Get a record by ID | `GET /crud/genres/5` |
| PUT    | `/:id` | Update a record | `PUT /crud/channels/3` |
| DELETE | `/:id` | Delete a record | `DELETE /crud/comments/7` |

**Note:**
- These routes require API key authentication
- Replace `:model` with the name of your data model
- The model name should match the collection name in MongoDB (usually lowercase plural)

## Error Handling

All API endpoints follow a consistent error handling pattern:

```json
{
  "status": "error",
  "message": "Error message describing what went wrong",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details if available"
  }
}
```

## Status Codes

| Status Code | Description |
|------------|-------------|
| 200 | OK - The request was successful |
| 201 | Created - A new resource was successfully created |
| 400 | Bad Request - The request was invalid or cannot be served |
| 401 | Unauthorized - Authentication failed or user doesn't have permissions |
| 404 | Not Found - The resource was not found |
| 500 | Internal Server Error - Server error occurred |

## Conclusion

This documentation covers all the API routes available in the Multiplex application. For additional details about specific endpoints or request/response formats, please contact the development team.
