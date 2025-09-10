// src/components/EmployeeList.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './Employee.css';

const EmployeeList = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([
    { id: 1, name: 'John Doe', role: 'Software Engineer', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', role: 'HR Manager', email: 'jane@example.com' },
  ]);

  const handleDelete = (id) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
  };

  return (
    <div className="employee-container">
      <h2>Employee Management</h2>
      <button onClick={() => navigate('/add')}>Add Employee</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.role}</td>
              <td>{emp.email}</td>
              <td>
                <button onClick={() => navigate(`/edit/${emp.id}`)}>Edit</button>
                <button onClick={() => handleDelete(emp.id)} className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;
