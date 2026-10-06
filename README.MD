# CodeCraftHub

A simple REST API to track your personal learning goals and courses.

## Overview

CodeCraftHub helps developers keep track of courses they want to learn. Built with Node.js and Express, the platform provides a straightforward REST API for managing your learning journey.

## Features

- Full CRUD operations for course management
- JSON file-based storage
- RESTful API design
- Proper error handling
- Automatic course ID generation
- Automatic `created_at` timestamps
- Automatic creation of `courses.json`

## Installation

Clone or download the project.

Install the Node.js dependencies:

```bash
npm install
```

## Running the Application

Start the Express server:

```bash
npm start
```

The API will be available at:

```text
http://localhost:5000
```

## API Endpoints

### 1. Add a Course

**POST**

```text
/api/courses
```

Example request body:

```json
{
  "name": "Python Basics",
  "description": "Learn Python fundamentals",
  "target_date": "2025-12-31",
  "status": "Not Started"
}
```

Example using curl:

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Python Basics",
    "description": "Learn Python fundamentals",
    "target_date": "2025-12-31",
    "status": "Not Started"
  }'
```

### 2. Get All Courses

**GET**

```text
/api/courses
```

Example using curl:

```bash
curl http://localhost:5000/api/courses
```

### 3. Get a Specific Course

**GET**

```text
/api/courses/:id
```

Example:

```bash
curl http://localhost:5000/api/courses/1
```

### 4. Update a Course

**PUT**

```text
/api/courses/:id
```

Example request body:

```json
{
  "status": "In Progress"
}
```

Example using curl:

```bash
curl -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Progress"
  }'
```

### 5. Delete a Course

**DELETE**

```text
/api/courses/:id
```

Example using curl:

```bash
curl -X DELETE http://localhost:5000/api/courses/1
```

## Course Status Values

The `status` field must be one of the following:

- `Not Started`
- `In Progress`
- `Completed`

## Testing

You can test all API endpoints using `curl` or Postman.

Make sure the server is running before testing the endpoints.

## Troubleshooting

### Problem: Cannot find module 'express'

Run:

```bash
npm install
```

Then start the application again:

```bash
npm start
```

### Problem: Port 5000 is already in use

Stop any other application that is using port 5000 or change the `PORT` value in `app.js`.

### Problem: courses.json is missing

The application creates `courses.json` automatically when it starts.

If necessary, create the file manually and add:

```json
[]
```

### Problem: Course not found

Check the existing courses:

```bash
curl http://localhost:5000/api/courses
```

Then use an existing course ID.

## Project Structure

```text
codecrafthub/
├── app.js
├── courses.json
├── package.json
└── README.md
```

The `courses.json` file is created automatically when the application starts if it does not already exist.