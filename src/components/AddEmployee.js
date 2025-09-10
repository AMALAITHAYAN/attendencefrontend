import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddEmployee.css';

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    employeeCode: '',
    name: '',
    username: '',
    email: '',
    mobileNumber: '', // ✅ Renamed from "mobile"
    dob: '',
    joiningDate: '',
    shiftDetails: '',
    salary: '',
    status: '',
    role: '',
    password: '',
    emergencyContactNumber: '',
    emergencyRelation: '',
  });

  const navigate = useNavigate();

  const roles = [
    'Software Engineer',
    'Project Manager',
    'UI/UX Designer',
    'QA Tester',
    'Business Analyst',
    'HR Specialist',
    'DevOps Engineer',
    'Product Manager',
    'Data Scientist',
    'Support Executive',
  ];

  const statuses = ['Active', 'Inactive'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://backendattendance-1.onrender.com/api/employees/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('✅ Student added successfully');
        navigate('/manage-employees');
      } else {
        const errorMsg = await response.text();
        alert('❌ Error: ' + errorMsg);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('❌ Server error while adding student');
    }
  };

  return (
    <div className="add-employee-form">
      <h2>Add New Student</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="employeeCode"
          placeholder="Student Code (e.g., EMP001)"
          value={formData.employeeCode}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="mobileNumber"
          placeholder="Mobile Number"
          value={formData.mobileNumber}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="dob"
          placeholder="Date of Birth"
          value={formData.dob}
          onChange={handleChange}
          required
        />
        
        <select
          name="shiftDetails"
          value={formData.shiftDetails}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select Shift</option>
          <option value="9 AM - 6 PM">9 AM - 6 PM</option>
          <option value="8 AM - 5 PM">8 AM - 5 PM</option>
        </select>
       
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select Status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select Role</option>
          {roles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <input
          type="tel"
          name="emergencyContactNumber"
          placeholder="Emergency Contact Number"
          value={formData.emergencyContactNumber}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="emergencyRelation"
          placeholder="Relation to Emergency Contact"
          value={formData.emergencyRelation}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Student</button>
      </form>
    </div>
  );
};

export default AddEmployee;
