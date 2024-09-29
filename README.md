# Bulletin Board Application


This is a simple bulletin board web application where users can sign up, log in, upload posters, and leave reviews. Admins can manage user content and delete posters. Additionally, the system features automatic poster expiration and deletion based on set dates using cron jobs.
## Video Walkthrough

Here's a walkthrough of implemented features:

<img src='poster.gif' title='Video Walkthrough' width='' alt='Video Walkthrough' />


GIF created with Licecap.  

## Features

- User authentication (sign up, login, logout)
- Poster upload system using Multer for file handling
- Admin panel for managing user posters
- Socket.io integration for real-time updates on poster uploads and deletions
- Reviews system where users can leave and view reviews
- Cron jobs to auto-delete expired posters
- MongoDB for data storage using Mongoose ORM

## Technologies Used

- Node.js
- Express.js
- EJS for templating
- MongoDB and Mongoose
- Multer for file uploads
- Bcrypt for password hashing
- Node-cron for scheduling tasks
- Socket.io for real-time communication
- dotenv for environment configuration

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/bulletin-board.git

2.	Navigate into the project directory:
cd bulletin-board
3.	Install dependencies:
npm install
4.	Create a .env file and add your environment variables:
PORT=3000
SECRET=your_secret_key
MONGODB_URI=your_mongodb_uri
5.	Ensure MongoDB is running, either locally or remotely.
   
## Usage

1.	Start the server:
npm start
2.	Open your browser and visit http://localhost:3000 to access the app.
   
## Routes

•	/ - Home page
•	/sign_up - Sign up page for new users
•	/login - Login page for existing users
•	/users - User's dashboard to view their uploaded posters
•	/upload - Poster upload page
•	/admin_login - Admin login page
•	/admin - Admin dashboard to manage all posters
•	/reviews - View all reviews
•	/addreview - Add a new review

## Admin Features

•	Admins can log in and manage user posters (delete posters)
•	Real-time updates for admin and user dashboards using Socket.io
•	Posters are automatically deleted when they expire, thanks to cron jobs.

## File Structure
```
├── public/
│   ├── images/      # Stores uploaded poster images
├── views/           # EJS templates
├── dbs.js           # MongoDB schema for Posters, Users, and Reviews
├── .env             # Environment variables
├── server.js        # Main server file
└── README.md
```
License
This project is licensed under the MIT License.



