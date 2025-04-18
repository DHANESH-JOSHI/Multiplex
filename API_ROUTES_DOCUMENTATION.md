# API Routes Documentation

This document provides a comprehensive list of all API routes available in the Multiplex application.

## Base URL

All API endpoints are prefixed with:
```
/nodeapi/rest-api/v130
```

## Mobile Routes

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

## Web Routes

### Web Authentication Routes
Base path: `/web/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/login` | Web login |
| GET    | `/google` | Google OAuth login |
| GET    | `/google/callback` | Google OAuth callback |

## Generic CRUD Routes

The application also includes generic CRUD routes that can be used with any model:

Base path: `/crud/:model`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/` | Create a new record |
| GET    | `/` | Get all records |
| GET    | `/:id` | Get a record by ID |
| PUT    | `/:id` | Update a record |
| DELETE | `/:id` | Delete a record |

Note: These routes require API key authentication.
