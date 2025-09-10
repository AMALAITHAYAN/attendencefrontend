import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AddEmployee.css';

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeCode: '',
    name: '',
    username: '',
    email: '',
    mobileNumber: '',
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

  const shifts = ['9 AM - 6 PM', '8 AM - 5 PM'];
  const statuses = ['Active', 'Inactive'];

  useEffect(() => {
    fetch(`http://localhost:8080/api/employees/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setFormData({
          employeeCode: data.employeeCode || '',
          name: data.name || '',
          username: data.username || '',
          email: data.email || '',
          mobileNumber: data.mobileNumber || '',
          dob: data.dob || '',
          joiningDate: data.joiningDate || '',
          shiftDetails: data.shiftDetails || '',
          salary: data.salary || '',
          status: data.status || '',
          role: data.role || '',
          password: '',
          emergencyContactNumber: data.emergencyContactNumber || '',
          emergencyRelation: data.emergencyRelation || '',
        });
      })
      .catch((err) => {
        console.error('Error fetching employee:', err);
        alert('Failed to fetch employee data');
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...formData };
    if (!payload.password) delete payload.password;

    try {
      const response = await fetch(`http://localhost:8080/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Employee updated successfully');
        navigate('/manage-employees', { state: { updated: true } });
      } else {
        const errorText = await response.text();
        alert('Error updating employee: ' + errorText);
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Server error while updating employee');
    }
  };

  return (
    <div className="add-employee-form">
      <h2>Edit Employee</h2>
      <form onSubmit={handleSubmit}>
        <input name="employeeCode" value={formData.employeeCode} onChange={handleChange} placeholder="Employee Code" required />
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
        <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />
        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
        <input name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleChange} placeholder="Mobile Number" required />
        <input name="dob" type="date" value={formData.dob} onChange={handleChange} placeholder="Date of Birth" required />
        <input name="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} placeholder="Joining Date" required />
        
        <select name="shiftDetails" value={formData.shiftDetails} onChange={handleChange} required>
          <option value="" disabled>Select Shift</option>
          {shifts.map((shift) => (
            <option key={shift} value={shift}>{shift}</option>
          ))}
        </select>

        <input name="salary" type="number" value={formData.salary} onChange={handleChange} placeholder="Salary" required />

        <select name="status" value={formData.status} onChange={handleChange} required>
          <option value="" disabled>Select Status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select name="role" value={formData.role} onChange={handleChange} required>
          <option value="" disabled>Select Role</option>
          {roles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        <input
          name="emergencyContactNumber"
          type="tel"
          value={formData.emergencyContactNumber}
          onChange={handleChange}
          placeholder="Emergency Contact Number"
          required
        />

        <input
          name="emergencyRelation"
          value={formData.emergencyRelation}
          onChange={handleChange}
          placeholder="Emergency Contact Relation (e.g. Father, Friend)"
          required
        />

        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="New Password (leave blank to keep current)"
        />

        <button type="submit">Update Employee</button>
      </form>
    </div>
  );
};

export default EditEmployee;
