# Web Authentication Implementation

This document provides instructions on how to set up and use the web authentication functionality, including Google OAuth and email/mobile login.

## Features

1. **Google OAuth Authentication**
   - Users can sign in with their Google accounts
   - Automatically creates a new user account if the user doesn't exist

2. **Email/Mobile Login**
   - Users can log in with their email or mobile number
   - Password is encrypted with MD5

## Setup Instructions

### 1. Install Dependencies

```bash
npm install passport passport-google-oauth20 express-session
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables (see `.env.example`):

```
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/rest-api/v130/web/auth/google/callback

# Session
SESSION_SECRET=your-session-secret
```

### 3. Google Developer Console Setup

1. Go to the [Google Developer Console](https://console.developers.google.com/)
2. Create a new project
3. Enable the Google+ API
4. Create OAuth credentials
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/rest-api/v130/web/auth/google/callback`
5. Copy the Client ID and Client Secret to your `.env` file

## API Endpoints

### Google OAuth

- **GET /rest-api/v130/web/auth/google**
  - Initiates Google OAuth authentication
  - Redirects to Google login page

- **GET /rest-api/v130/web/auth/google/callback**
  - Google OAuth callback
  - Redirects to `/auth/success?userId={user_id}` on success
  - Redirects to `/login?error=auth_failed` on failure

### Email/Mobile Login

- **POST /rest-api/v130/web/auth/login**
  - Logs in a user with email/mobile and password
  - Request body:
    ```json
    {
      "identifier": "user@example.com", // or mobile number
      "password": "your-password"
    }
    ```
  - Response:
    ```json
    {
      "status": "success",
      "user_id": 123,
      "name": "John Doe",
      "email": "user@example.com",
      "phone": "1234567890",
      "role": "user",
      "join_date": "2023-01-01T00:00:00.000Z",
      "last_login": "2023-01-01T00:00:00.000Z"
    }
    ```

## Frontend Integration

### Google OAuth

Add a Google Sign-In button to your login page:

```html
<a href="/rest-api/v130/web/auth/google" class="google-btn">
  Sign in with Google
</a>
```

### Email/Mobile Login

Create a login form:

```html
<form id="loginForm">
  <input type="text" name="identifier" placeholder="Email or Mobile Number" required>
  <input type="password" name="password" placeholder="Password" required>
  <button type="submit">Login</button>
</form>

<script>
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const identifier = e.target.identifier.value;
    const password = e.target.password.value;
    
    try {
      const response = await fetch('/rest-api/v130/web/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': 'ec8590cb04e0e37c6706ab6c'
        },
        body: JSON.stringify({ identifier, password })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // Store user data in localStorage or sessionStorage
        localStorage.setItem('user', JSON.stringify(data));
        // Redirect to dashboard or home page
        window.location.href = '/dashboard';
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  });
</script>
```
