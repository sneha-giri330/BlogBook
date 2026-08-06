# 📝 BlogBook – Full Stack Blogging Application

BlogBook is a full-stack blogging platform that enables users to create, edit, manage, and read blogs through a clean and responsive interface. The application includes secure user authentication, authorization, and complete CRUD functionality for blog posts.

---

## 🚀 Features

- 🔐 User Registration & Login Authentication
- ✍️ Create, Read, Update, and Delete (CRUD) Blogs
- 👤 Secure user authorization (users can manage only their own blogs)
- 📖 Dynamic blog rendering using EJS templates
- 📱 Responsive and user-friendly interface
- 💾 MongoDB database integration
- ⚡ Server-side rendering with Express.js and EJS
- 🔒 Password hashing using bcrypt
- 🍪 Session-based authentication

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- EJS

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- Express Session
- bcrypt

---

## 📂 Project Structure

```
BlogBook/
│
├── models/
├── routes/
├── views/
│   ├── partials/
│   ├── blogs/
│   └── users/
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── middleware/
├── app.js
├── package.json
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/BlogBook.git
cd BlogBook
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a `.env` File

```env
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
PORT=3000
```

---

## ▶️ Run the Application

Using Node.js

```bash
node app.js
```

or using Nodemon

```bash
nodemon app.js
```

The application will start at

```
http://localhost:3000
```

---

## 📸 Core Functionalities

- User Signup/Login
- Create Blog Posts
- Edit Existing Blogs
- Delete Blogs
- Read Blogs
- User Authorization
- Dynamic Content Rendering

---

## 📚 Learning Outcomes

Through this project, I gained practical experience in:

- Full Stack Web Development
- Express.js Routing
- MongoDB CRUD Operations
- Authentication & Authorization
- Session Management
- MVC Project Structure
- Server-side Rendering using EJS
- RESTful Routing

---
