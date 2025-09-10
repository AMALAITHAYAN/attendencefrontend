import React from 'react';
// import './Dashboard.css'; // No longer needed
import logo from './assets/logo.png'; // Make sure this path is correct
import { useNavigate } from 'react-router-dom';

const EmployeeProfile = () => {
  // Mock user data for demonstration if localStorage is empty
  const mockUser = {
    name: 'Alex Doe',
    username: 'alex.doe',
    email: 'alex.doe@example.com',
    dob: '1995-08-15',
    status: 'Active',
    lastLogin: new Date().toISOString(),
  };

  const user = JSON.parse(localStorage.getItem('user')) || mockUser;
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };
    try {
      return new Date(dateString).toLocaleString('en-US', options);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDOB = (dateString) => {
     if (!dateString) return 'N/A';
     const options = { year: 'numeric', month: 'long', day: 'numeric' };
     try {
       return new Date(dateString).toLocaleDateString('en-US', options);
     } catch(e) {
       return dateString; // fallback to original string if invalid
     }
  }

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

    .profile-page-bg {
      min-height: 100vh;
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(135deg, #020617, #0f172a, #1e3a8a);
      color: #e2e8f0;
      padding: 2rem 1rem;
      box-sizing: border-box;
    }

    .profile-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      margin-bottom: 2.5rem;
      text-align: center;
    }

    .profile-logo {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .profile-header h1 {
      font-size: 2.5rem;
      font-weight: 600;
      color: #f8fafc;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }

    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .profile-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }

    .profile-card p {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      line-height: 1.6;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 1rem;
    }

    .profile-card p:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .profile-card strong {
      color: #93c5fd; /* A lighter, accent blue */
      font-weight: 600;
      margin-right: 0.75rem;
    }

    .profile-buttons-row {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .profile-btn {
      padding: 12px 28px;
      font-size: 1rem;
      font-weight: 600;
      color: #fff;
      background: linear-gradient(to right, #3b82f6, #60a5fa);
      border: none;
      border-radius: 50px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
      text-align: center;
    }
    
    .profile-btn.back-btn {
       background: transparent;
       border: 2px solid #3b82f6;
    }

    .profile-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
    }
    
    .profile-btn.back-btn:hover {
      background: #3b82f6;
    }

    /* --- Responsive Design --- */
    @media (max-width: 768px) {
      .profile-page-bg {
        padding: 1.5rem 0.5rem;
      }

      .profile-header {
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
      }
      
      .profile-header h1 {
        font-size: 2rem;
      }

      .profile-logo {
        width: 50px;
        height: 50px;
      }

      .profile-card {
        padding: 1.5rem;
      }

      .profile-card p {
        font-size: 1rem;
      }
      
      .profile-buttons-row {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      .profile-btn {
        width: 80%;
        max-width: 300px;
        padding: 14px 20px;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="profile-page-bg">
        <div className="profile-header">
          {logo && <img src={logo} alt="Company Logo" className="profile-logo" />}
          <h1>{user?.name}'s Profile</h1>
        </div>

        <div className="profile-container">
          <div className="profile-card">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Username:</strong> {user?.username || 'N/A'}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> Student</p>
            <p><strong>Date of Birth:</strong> {formatDOB(user?.dob)}</p>
            <p><strong>Status:</strong> {user?.status || 'N/A'}</p>
            <p><strong>Last Login:</strong> {formatDate(user?.lastLogin)}</p>
          </div>

          <div className="profile-buttons-row">
            <button className="profile-btn" onClick={() => navigate('/employee-shift-calendar')}>
              View Shift Calendar
            </button>
            <button className="profile-btn back-btn" onClick={() => navigate('/employee-dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeProfile;