/**
 * CodeCraftHub - Personal Learning Goal Tracker API
 *
 * A simple REST API to track courses you want to learn.
 */

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// Configuration
const DATA_FILE = path.join(__dirname, "courses.json");
const PORT = 5000;

// Middleware to parse JSON request bodies
app.use(express.json());

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Load courses from the JSON file.
 * If the file doesn't exist, create an empty one.
 */
function loadCourses() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    return [];
  }

  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading courses file:", error);
    return [];
  }
}

/**
 * Save courses to the JSON file.
 */
function saveCourses(courses) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(courses, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving courses: ${error}`);
    return false;
  }
}

/**
 * Generate the next available ID for a new course.
 */
function getNextId(courses) {
  if (courses.length === 0) {
    return 1;
  }

  return Math.max(...courses.map((course) => course.id)) + 1;
}

/**
 * Find a course by its ID.
 */
function findCourseById(courses, courseId) {
  const index = courses.findIndex((course) => course.id === courseId);

  if (index !== -1) {
    return {
      course: courses[index],
      index: index
    };
  }

  return {
    course: null,
    index: -1
  };
}

/**
 * Check if target_date uses YYYY-MM-DD format.
 */
function isValidDate(date) {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(date)) {
    return false;
  }

  const parsedDate = new Date(`${date}T00:00:00Z`);

  return !Number.isNaN(parsedDate.getTime());
}

/**
 * Validate course data.
 */
function validateCourseData(data, requiredFields) {
  const missingFields = requiredFields.filter(
    (field) => !(field in data) || data[field] === ""
  );

  if (missingFields.length > 0) {
    return {
      isValid: false,
      errorMessage: `Missing required fields: ${missingFields.join(", ")}`
    };
  }

  // Validate status
  const validStatuses = [
    "Not Started",
    "In Progress",
    "Completed"
  ];

  if ("status" in data && !validStatuses.includes(data.status)) {
    return {
      isValid: false,
      errorMessage: `Status must be one of: ${validStatuses.join(", ")}`
    };
  }

  // Validate target date
  if ("target_date" in data && !isValidDate(data.target_date)) {
    return {
      isValid: false,
      errorMessage: "target_date must use the format YYYY-MM-DD"
    };
  }

  return {
    isValid: true,
    errorMessage: null
  };
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * Home endpoint
 */
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to CodeCraftHub API!",
    version: "1.0",
    endpoints: {
      "GET /api/courses": "Get all courses",
      "GET /api/courses/<id>": "Get a specific course",
      "POST /api/courses": "Add a new course",
      "PUT /api/courses/<id>": "Update a course",
      "DELETE /api/courses/<id>": "Delete a course"
    }
  });
});

/**
 * GET /api/courses
 *
 * Retrieve all courses.
 */
app.get("/api/courses", (req, res) => {
  try {
    const courses = loadCourses();

    res.status(200).json({
      success: true,
      count: courses.length,
      courses: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to retrieve courses: ${error.message}`
    });
  }
});

/**
 * GET /api/courses/:id
 *
 * Retrieve a specific course by ID.
 */
app.get("/api/courses/:id", (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);

    if (Number.isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID"
      });
    }

    const courses = loadCourses();
    const { course } = findCourseById(courses, courseId);

    if (course) {
      res.status(200).json({
        success: true,
        course: course
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Course with ID ${courseId} not found`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to retrieve course: ${error.message}`
    });
  }
});

/**
 * POST /api/courses
 *
 * Add a new course.
 */
app.post("/api/courses", (req, res) => {
  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No data provided"
      });
    }

    const requiredFields = [
      "name",
      "description",
      "target_date",
      "status"
    ];

    const { isValid, errorMessage } =
      validateCourseData(data, requiredFields);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: errorMessage
      });
    }

    const courses = loadCourses();

    const newCourse = {
      id: getNextId(courses),
      name: data.name,
      description: data.description,
      target_date: data.target_date,
      status: data.status,
      created_at: new Date()
        .toISOString()
        .replace("T", " ")
        .substring(0, 19)
    };

    courses.push(newCourse);

    if (saveCourses(courses)) {
      res.status(201).json({
        success: true,
        message: "Course added successfully",
        course: newCourse
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to save course"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to add course: ${error.message}`
    });
  }
});

/**
 * PUT /api/courses/:id
 *
 * Update an existing course.
 */
app.put("/api/courses/:id", (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);

    if (Number.isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID"
      });
    }

    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No data provided"
      });
    }

    const { isValid, errorMessage } =
      validateCourseData(data, []);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: errorMessage
      });
    }

    const courses = loadCourses();

    const { course, index } =
      findCourseById(courses, courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: `Course with ID ${courseId} not found`
      });
    }

    if ("name" in data) {
      course.name = data.name;
    }

    if ("description" in data) {
      course.description = data.description;
    }

    if ("target_date" in data) {
      course.target_date = data.target_date;
    }

    if ("status" in data) {
      course.status = data.status;
    }

    courses[index] = course;

    if (saveCourses(courses)) {
      res.status(200).json({
        success: true,
        message: "Course updated successfully",
        course: course
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to save changes"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to update course: ${error.message}`
    });
  }
});

/**
 * DELETE /api/courses/:id
 *
 * Delete a course.
 */
app.delete("/api/courses/:id", (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);

    if (Number.isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID"
      });
    }

    const courses = loadCourses();

    const { course, index } =
      findCourseById(courses, courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: `Course with ID ${courseId} not found`
      });
    }

    const deletedCourse = courses.splice(index, 1)[0];

    if (saveCourses(courses)) {
      res.status(200).json({
        success: true,
        message: "Course deleted successfully",
        deleted_course: deletedCourse
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to save changes"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to delete course: ${error.message}`
    });
  }
});

// ============================================================================
// ERROR HANDLER
// ============================================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found"
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log("CodeCraftHub API is starting...");
  console.log("=".repeat(60));
  console.log(
    `Data will be stored in: ${path.resolve(DATA_FILE)}`
  );
  console.log(
    `API is available at: http://localhost:${PORT}`
  );
  console.log("=".repeat(60));
  console.log("\nPress CTRL+C to stop the server\n");
});