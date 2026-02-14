 // ==============================
// IMPORTS
// ==============================
const express = require("express");
const cors = require("cors");

// ==============================
// APP CONFIG
// ==============================
const app = express();
const PORT = 5000;

app.use(cors());          // Allow frontend connection
app.use(express.json());  // Read JSON body

// ==============================
// DUMMY DATABASE (Temporary)
// ==============================

let users = [];
let tutors = [
  {
    id: 1,
    name: "Jessica R.",
    subject: "Math",
    price: 15,
    slots: ["4 PM", "6 PM"],
  },
  {
    id: 2,
    name: "Marcus T.",
    subject: "Python",
    price: 20,
    slots: ["5 PM", "7 PM"],
  },
  {
    id:3,
    name:"Sarah l.",
    subject:"Chemistry",
    price:18,
    slots:["3 PM","8 PM"],
  }
];

let bookings = [];

// ==============================
// ROUTES
// ==============================

// Test Route
app.get("/", (req, res) => {
  res.send("EduGigs Backend Running ✅");
});

// Get All Tutors
app.get("/api/tutors", (req, res) => {
  res.json(tutors);
});

// Register / Login User
app.post("/api/login", (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const newUser = { id: Date.now(), email, role };
  users.push(newUser);

  res.json({
    message: "Login successful",
    user: newUser,
  });
});

// Book Session
app.post("/api/book", (req, res) => {
  const { tutorId, slot, studentEmail } = req.body;

  if (!tutorId || !slot || !studentEmail) {
    return res.status(400).json({ message: "Missing booking data" });
  }

  const booking = {
    id: Date.now(),
    tutorId,
    slot,
    studentEmail,
  };

  bookings.push(booking);

  res.json({
    message: "Booking successful",
    booking,
  });
});

// Get All Bookings
app.get("/api/bookings", (req, res) => {
  res.json(bookings);
});

// ==============================
// START SERVER
// ==============================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});