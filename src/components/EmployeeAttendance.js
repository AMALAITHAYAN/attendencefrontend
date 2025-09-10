import React, { useState } from 'react';
import axios from 'axios';

const EmployeeAttendance = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [checkInData, setCheckInData] = useState(null);
  const [message, setMessage] = useState('');

  const handleCheckIn = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/attendance/checkin/${user.id}`
      );
      setCheckInData(response.data); // store attendance record (with its ID)
      setMessage('✅ Checked in successfully!');
    } catch (err) {
      setMessage('❌ Failed to check in: ' + err.response.data);
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/attendance/checkout/${checkInData.id}`
      );
      setMessage('✅ Checked out successfully!');
    } catch (err) {
      setMessage('❌ Failed to check out: ' + err.response.data);
    }
  };

  return (
    <div className="attendance-container" style={{ textAlign: 'center', marginTop: '40px' }}>
      <h2>Attendance Portal</h2>
      <p>Welcome, {user?.name}</p>
      <div style={{ margin: '20px' }}>
        <button
          onClick={handleCheckIn}
          style={{ padding: '10px 20px', marginRight: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px' }}
        >
          Check In
        </button>
        <button
          onClick={handleCheckOut}
          disabled={!checkInData}
          style={{
            padding: '10px 20px',
            backgroundColor: checkInData ? '#dc3545' : '#aaa',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: checkInData ? 'pointer' : 'not-allowed',
          }}
        >
          Check Out
        </button>
      </div>
      {message && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
};

export default EmployeeAttendance;
