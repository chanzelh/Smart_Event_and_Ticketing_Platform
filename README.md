# Smart Event and Ticketing Platform 
## Project Overview
This full-stack web application serves as a smart event management and ticketing platform, which is developed for Advanced Events (Pty) Ltd. This platform enables users securely log in, look through all the available events, book their tickets and submit enquiries. Administrators are also able to create, update and delete events as well as view booking analytics while managing all customer enquiries.
This entire system was developed using Node.js, Express.js, EJS and MongoDB and was constructed to follow the MVC (Model-View-Controller) architectural pattern.
---
## Features

### User Features
- Register and log in securely
- Browse and search through events
- Book tickets
- View booking history
- Submit enquiries through a contact form

### Admin Features
- Role-based access control (Standard user and Admin)
- Create, edit and delete events
- View the booking analytics dashboard
- Manage customer enquiries

### Merchant Features
- Able to create events
- Able to view analytics of events created by them
- Needs approval from admin before publishing events

---
## Technologies Used

### Backend
- Node.js 
- Express.js

### Frontend
- EJS
- HTML5
- CSS3
- Bootstrap

### Database
- MongoDB
- Mongoose

### Security
- bcrypt
- express-session
- dotenv

### Development Tools
- Github
- Visual Studio Code

---

## MVC Architecture

project-root/

├── config/

├── controllers/

├── middleware/

├── models/

├── routes/

├── views/

├── public/

├── .env

├── app.js

├── package.json

└── README.md

---

## Team Members and Roles
| Team Member | Role | Responsibilities |
|-----------|-----------|----------------|
| Chanzel Hammond | Documentation & Coordination | README, GitHub management, presentation preparation |
| Edward Goosen | Backend Developer | Authentication and business logic |
| Jonathan Rossouw | Frontend Developer & Team Lead | EJS templates and styling |
| Dewald Allers | Database Engineer | MongoDB schemas and validation |
| Gerald Enright | Security / DevOps Engineer | Middleware, RBAC, environment configuration |

---

## Setup Instructions
In order to run this project locally, follow these steps:

1. **Clone the repository:**
Open your terminal and run:
`git clone <insert-the-github-repo-link>`

2. **Navigate to the project folder:**
`cd Smart_Event_and_Ticketing_Platform`
Tip: Type cd and the first 3 letters of your folder name and then Tab. Visual Studio Code will complete the rest of the name and then you just hit Enter.

3. **Setup the Environment Variables:**
- Create a new file in the root directory and call it '.env'
- Get the Database credentials and secret keys from the team
- Add the following variables to the '.env' file:
`PORT = 3000
MONGO_URI=<insert_provided_database_link>
SESSION_SECRET=<insert_provided_secret>`

4. **Install the dependencies:**
Run this command to make sure all the required packages are downloaded:
`npm install`

5. **Start the server:**
Run this command to start up the application:
`npm run dev`

6. **View the application:**
Open up your web browser and make sure to go to 'http://localhost:3000'
