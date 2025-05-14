# Javascript backend
# Javascript Backend

This project is a backend application built with Node.js and Express.js. It provides APIs for managing users, videos, playlists, tweets, comments, likes, subscriptions, and more. The backend is designed to handle user authentication, file uploads, and database interactions using MongoDB.

## Features

- **User Management**: User registration, login, logout, password management, and profile updates.
- **Video Management**: Upload, update, delete, and fetch videos with support for thumbnails and publishing status.
- **Playlist Management**: Create, update, delete, and manage playlists with videos.
- **Tweet Management**: Create, update, delete, and fetch user tweets.
- **Comment Management**: Add, update, delete, and fetch comments for videos.
- **Like Management**: Like or unlike videos, comments, and tweets.
- **Subscription Management**: Subscribe or unsubscribe to channels and fetch subscriber or subscription details.
- **Dashboard**: Fetch channel statistics and videos.
- **Health Check**: API to check server health.
- **File Uploads**: Handles file uploads using `multer` and stores them temporarily before uploading to Cloudinary.
- **Authentication**: JWT-based authentication with access and refresh tokens.
- **Database**: MongoDB integration using Mongoose.

## Project Structure

The project is structured as follows:   

- **src**: Contains the main application code.  

- **test**: Contains test files for the application.

- **config**: Contains configuration files for the application.

- **utils**: Contains utility functions for the application.    

- **routes**: Contains route files for the application.

- **controllers**: Contains controller files for the application.

- **middlewares**: Contains middleware files for the application.

- **models**: Contains model files for the application.

- **middlewares**: Contains middleware files for the application.


## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd JavascriptBackend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file in the root directory and configure the following environment variables:

   PORT=8000
>
MONGODB_URI=<your-mongodb-uri   ACCESS_TOKEN_SECRET=<your-access-token-secret>
REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
CORS_ORIGIN=<your-frontend-url>

4. Start the server:
   ```bash
   npm start    
   ```

API Endpoints

User Routes (/api/v1/users)
* POST /register: Register a new user.
* POST /login: Login a user.
* POST /logout: Logout a user.
* POST /refresh-token: Refresh access token.
* POST /change-password: Change the current user's password.
* GET /current-user: Get the current logged-in user's details.
* PATCH /update-account: Update account details.
* PATCH /avatar: Update user avatar.
* PATCH /cover-image: Update user cover image.
* GET /c/:username: Get a user's channel profile.
* GET /history: Get the user's watch history.

Video Routes (/api/v1/videos)
* GET /: Get all videos.
* POST /: Publish a new video.
* GET /:videoId: Get a video by ID.
* PATCH /:videoId: Update a video.
* DELETE /:videoId: Delete a video.
* PATCH /toggle/publish/:videoId: Toggle video publish status.

Playlist Routes (/api/v1/playlist)
* POST /: Create a new playlist.
* GET /user/:userId: Get all playlists of a user.
* GET /:playlistId: Get a playlist by ID.
* PATCH /add/:videoId/:playlistId: Add a video to a playlist.
* PATCH /remove/:videoId/:playlistId: Remove a video from a playlist.
* DELETE /:playlistId: Delete a playlist.
* PATCH /:playlistId: Update a playlist.

Tweet Routes (/api/v1/tweet)
* POST /: Create a new tweet.
* GET /user/:userId: Get all tweets of a user.
* PATCH /:tweetId: Update a tweet.
* DELETE /:tweetId: Delete a tweet.
* Comment Routes (/api/v1/comments)
* GET /:videoId: Get all comments for a video.
* POST /:videoId: Add a comment to a video.
* PATCH /c/:commentId: Update a comment.
* DELETE /c/:commentId: Delete a comment.

Like Routes (/api/v1/likes)
* POST /toggle/v/:videoId: Like or unlike a video.
* POST /toggle/c/:commentId: Like or unlike a comment.
* POST /toggle/t/:tweetId: Like or unlike a tweet.
* GET /videos: Get all liked videos.
* Subscription Routes (/api/v1/subscription)
* POST /c/:channelId: Subscribe or unsubscribe to a channel.
* GET /c/:channelId: Get all subscribers of a channel.
* GET /u/:subscriberId: Get all channels a user has subscribed to.

Dashboard Routes (/api/v1/dashboard)
* GET /stats: Get channel statistics.
* GET /videos: Get all videos of the channel.

Health Check (/api/v1/healthcheck)
* GET /: Check if the server is running.

Technologies Used
* Node.js: JavaScript runtime.
* Express.js: Web framework.
* MongoDB: NoSQL database.
* Mongoose: MongoDB object modeling.
* JWT: Authentication.
* Multer: File uploads.
* Cloudinary: Cloud-based media management.
* dotenv: Environment variable management.