import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">

      {/* Navbar */}
      <nav className="navbar">
        <div className="container nav-container">
          <h2 className="logo">CCMS</h2>
          <div className="nav-buttons">
            <button className="btn btn-secondary" onClick={() => navigate('/login')}>Login</button>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>Register</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <h1 className="hero-title">College Complaint Management System</h1>
          <p className="hero-subtitle">
            Your voice matters. Submit, track, and resolve complaints related to academics,
            infrastructure, faculty, hostel, and campus facilities — all in one place.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary btn-large" onClick={() => navigate('/register')}>
              🚀 Get Started
            </button>
            <button className="btn btn-secondary btn-large" onClick={() => navigate('/login')}>
              Already have an account? Login
            </button>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="stats-banner">
        <div className="container">
          <div className="stats-row">
            <div className="stat-item"><h3>500+</h3><p>Complaints Resolved</p></div>
            <div className="stat-item"><h3>6</h3><p>Categories Covered</p></div>
            <div className="stat-item"><h3>24h</h3><p>Avg. Response Time</p></div>
            <div className="stat-item"><h3>98%</h3><p>Student Satisfaction</p></div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Simple 4-step process to get your complaint resolved</p>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-step">1</span>
              <div className="feature-icon">📝</div>
              <h3>Register & Login</h3>
              <p>Create your student account and securely log in to access the complaint portal.</p>
            </div>
            <div className="feature-card">
              <span className="feature-step">2</span>
              <div className="feature-icon">📋</div>
              <h3>Submit Complaint</h3>
              <p>Fill the complaint form with title, category, department, and full description.</p>
            </div>
            <div className="feature-card">
              <span className="feature-step">3</span>
              <div className="feature-icon">📊</div>
              <h3>Track Status</h3>
              <p>Monitor your complaint in real-time: Pending → In Progress → Resolved.</p>
            </div>
            <div className="feature-card">
              <span className="feature-step">4</span>
              <div className="feature-icon">✅</div>
              <h3>Get Resolution</h3>
              <p>Receive admin remarks and confirmation once your issue has been resolved.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <div className="container">
          <h2 className="section-title">Complaint Categories</h2>
          <p className="section-subtitle">We handle complaints across all major areas of college life</p>
          <div className="categories-grid">
            <div className="category-box">📚 Academics</div>
            <div className="category-box">🏢 Infrastructure</div>
            <div className="category-box">👨‍🏫 Faculty</div>
            <div className="category-box">🏠 Hostel</div>
            <div className="category-box">🧹 Sanitation</div>
            <div className="category-box">🔧 Other</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to raise your voice?</h2>
            <p>Join hundreds of students who have already used CCMS to resolve their complaints effectively.</p>
            <div className="cta-buttons">
              <button className="btn btn-primary btn-large" onClick={() => navigate('/register')}>
                🎓 Register as Student
              </button>
              <button className="btn btn-secondary btn-large" onClick={() => navigate('/login')}>
                Login to Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <span className="footer-logo">CCMS</span>
          <p>&copy; 2026 College Complaint Management System. All rights reserved.</p>
          <div className="footer-links">
            <a href="/">Home</a>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default HomePage;