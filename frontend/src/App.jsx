import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import React, { useState, useEffect } from "react";

/* ===============================
   MAIN APP
================================ */
export default function App() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [step, setStep] = useState("login");
  const [search, setSearch] = useState("");
  const [activeSession, setActiveSession] = useState(null);

  /* 🔔 Notifications */
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  /* 💳 Payment */
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  /* ⭐ Rating */
  const [showRating, setShowRating] = useState(false);

  /* ===============================
     FETCH TUTORS
  ============================== */
  useEffect(() => {
    fetch("http://localhost:5000/api/tutors")
      .then((res) => res.json())
      .then((data) => {
        setTutors(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* ===============================
     AUTO LOGIN
  ============================== */
  useEffect(() => {
    const saved = localStorage.getItem("edugigs_user");
    if (saved) {
      setUser(JSON.parse(saved));
      setStep("home");
    }
  }, []);

  /* ===============================
     NOTIFICATIONS
  ============================== */
  const addNotification = (message) => {
    if (!notificationsEnabled) return;
    const newNotification = {
      id: Date.now(),
      message,
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  const clearNotifications = () => setNotifications([]);

  /* ===============================
     AUTH
  ============================== */
  const handleLogin = (email, role) => {
    const newUser = { email, role };
    setUser(newUser);
    localStorage.setItem("edugigs_user", JSON.stringify(newUser));
    setStep("profile");
  };

  const handleProfile = (data) => {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("edugigs_user", JSON.stringify(updated));
    setStep("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("edugigs_user");
    setUser(null);
    setActiveSession(null);
    setStep("login");
  };

  /* ===============================
     BOOK SESSION
  ============================== */
  const handleBooking = (tutor, slot) => {
    setActiveSession({ tutor, slot });
    setShowPaymentForm(true);
    addNotification(`Session booked with ${tutor.name}`);
  };

  /* ===============================
     PAYMENT SUCCESS
  ============================== */
  const handlePaymentSuccess = (card) => {
    setPaymentMethod(card);
    setPaymentCompleted(true);
    setShowPaymentForm(false);
    addNotification("Payment completed successfully 💳");
  };

  /* ===============================
     END SESSION
  ============================== */
  const handleEndSession = () => {
    setShowRating(true);
    addNotification("Session ended. Please rate your tutor.");
  };

  const handleRatingSubmit = () => {
    addNotification("Thank you for your feedback ⭐");
    setShowRating(false);
    setActiveSession(null);
    setPaymentCompleted(false);
  };

  const filteredTutors = tutors.filter((t) =>
    t.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={step === "login" ? styles.loginContainer : styles.homeContainer}>
      {step === "login" && <Login onLogin={handleLogin} />}
      {step === "profile" && <Profile user={user} onComplete={handleProfile} />}

      {step === "home" && user && (
        <>
          {/* HEADER */}
          <div style={styles.header}>
            <h2>Welcome {user.role} 👋</h2>

            <div style={{ display: "flex", gap: 15 }}>
              {/* 🔔 Notifications */}
              <div style={styles.notificationWrapper}>
                <button style={styles.bellButton}
                  onClick={() => setShowNotifications(!showNotifications)}>
                  🔔
                  {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
                </button>

                {showNotifications && (
                  <div style={styles.notificationBox}>
                    <h4>Notifications</h4>
                    {notifications.length === 0 && <p>No notifications</p>}
                    {notifications.map((n) => (
                      <div key={n.id}
                        style={{
                          ...styles.notificationItem,
                          background: n.read ? "#f3f4f6" : "#e0f2fe",
                        }}>
                        {n.message}
                      </div>
                    ))}
                    <button onClick={markAllRead} style={styles.smallBtn}>Mark all read</button>
                    <button onClick={clearNotifications} style={styles.smallBtn}>Clear</button>
                  </div>
                )}
              </div>

              <button style={styles.logout} onClick={handleLogout}>Logout</button>
            </div>
          </div>

          {/* STUDENT VIEW */}
          {user.role === "Student" && (
            <>
              <input
                style={styles.search}
                placeholder="Search subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {loading && <p>Loading tutors...</p>}

              {filteredTutors.map((tutor) => (
                <div key={tutor.id} style={styles.tutorCard}>
                  <h3>{tutor.name}</h3>
                  <p><strong>{tutor.subject}</strong></p>
                  <p>${tutor.price}/hr</p>

                  {tutor.slots?.map((slot, index) => (
                    <button
                      key={index}
                      style={styles.button}
                      onClick={() => handleBooking(tutor, slot)}
                      disabled={activeSession}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ))}
            </>
          )}

          {/* PAYMENT FORM */}
          {showPaymentForm && (
            <PaymentForm
              tutor={activeSession.tutor}
              onSuccess={handlePaymentSuccess}
            />
          )}

          {/* ACTIVE SESSION */}
          {activeSession && paymentCompleted && (
            <div style={styles.activeSession}>
              <h3>Active Session</h3>
              <p>{activeSession.tutor.name} at {activeSession.slot}</p>
              <button style={styles.endButton} onClick={handleEndSession}>
                End Session
              </button>
            </div>
          )}

          {/* RATING FORM */}
          {showRating && (
            <RatingForm onSubmit={handleRatingSubmit} />
          )}
        </>
      )}
    </div>
  );
}

/* ===============================
   PAYMENT COMPONENT
================================ */
function PaymentForm({ tutor, onSuccess }) {
  const [cardNumber, setCardNumber] = useState("");
  const [name, setName] = useState("");

  return (
    <div style={styles.card}>
      <h3>Pay {tutor.name}</h3>
      <input style={styles.input}
        placeholder="Card Holder Name"
        onChange={(e) => setName(e.target.value)}
      />
      <input style={styles.input}
        placeholder="Card Number"
        onChange={(e) => setCardNumber(e.target.value)}
      />
      <button
        style={styles.primaryButton}
        onClick={() => onSuccess({ name, cardNumber })}
      >
        Pay Now
      </button>
    </div>
  );
}

/* ===============================
   RATING COMPONENT
================================ */
function RatingForm({ onSubmit }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  return (
    <div style={styles.card}>
      <h3>Rate Your Tutor</h3>
      <select
        style={styles.input}
        onChange={(e) => setRating(e.target.value)}
      >
        {[1,2,3,4,5].map(num => (
          <option key={num}>{num} ⭐</option>
        ))}
      </select>

      <textarea
        style={styles.input}
        placeholder="Write your feedback..."
        onChange={(e) => setFeedback(e.target.value)}
      />

      <button style={styles.primaryButton} onClick={onSubmit}>
        Submit Feedback
      </button>
    </div>
  );
}

/* ===============================
   LOGIN & PROFILE COMPONENTS
================================ */
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Student");

  return (
    <div style={styles.loginCard}>
      <h2>Login - EduGigs</h2>
      <input style={styles.input}
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <select style={styles.input}
        onChange={(e) => setRole(e.target.value)}>
        <option>Student</option>
        <option>Tutor</option>
        <option>Parent</option>
      </select>
      <button style={styles.primaryButton}
        onClick={() => onLogin(email, role)}>
        Login
      </button>
    </div>
  );
}

function Profile({ onComplete }) {
  const [name, setName] = useState("");
  return (
    <div style={styles.card}>
      <h2>Profile Setup</h2>
      <input style={styles.input}
        placeholder="Full Name"
        onChange={(e) => setName(e.target.value)}
      />
      <button style={styles.primaryButton}
        onClick={() => onComplete({ name })}>
        Continue
      </button>
    </div>
  );
}

/* ===============================
   STYLES
================================ */
const styles = {
  homeContainer: { padding: 20, background: "#8BD3E6", minHeight: "100vh" },
  loginContainer: { padding: 20, background: "#b1e6f3", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  tutorCard: { background: "#a2bffe", padding: 15, margin: 10, borderRadius: 12 },
  card: { background: "#ffffff", padding: 15, margin: 10, borderRadius: 12 },
  loginCard: { background: "#ffffff", padding: 25, maxWidth: 400, margin: "100px auto", borderRadius: 12 },
  input: { display: "block", margin: "10px 0", padding: 10, width: "100%" },
  primaryButton: { padding: 10, background: "#4f46e5", color: "white", border: "none", cursor: "pointer", width: "100%" },
  button: { padding: 8, margin: 5, cursor: "pointer" },
  logout: { background: "red", color: "white", border: "none", padding: 8, cursor: "pointer" },
  search: { padding: 10, margin: 10, width: "100%" },
  activeSession: { background: "#ffffff", padding: 15, margin: 10, borderRadius: 12 },
  endButton: { background: "red", color: "white", padding: 8, border: "none", cursor: "pointer" },
  notificationWrapper: { position: "relative" },
  bellButton: { background: "white", border: "none", fontSize: 20, cursor: "pointer" },
  badge: { position: "absolute", top: -5, right: -8, background: "red", color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: 12 },
  notificationBox: { position: "absolute", right: 0, top: 40, background: "white", width: 250, padding: 10, borderRadius: 10, boxShadow: "0 5px 15px rgba(0,0,0,0.2)" },
  notificationItem: { padding: 8, marginBottom: 5, borderRadius: 6 },
  smallBtn: { margin: 5, padding: 5, fontSize: 12, cursor: "pointer" },
};
