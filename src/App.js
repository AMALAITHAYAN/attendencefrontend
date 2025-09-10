import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import EmployeeList from './components/EmployeeList';
import EmployeeProfile from './components/EmployeeProfile';
import AddEmployee from './components/AddEmployee';
import AttendanceTracker from './components/AttendanceTracker';
import Reports from './components/Reports';
import EditEmployee from './components/EditEmployee';
import ManageEmployees from './components/ManageEmployees';
import ShiftSchedule from './components/ShiftSchedule';
import ShiftCalendarView from './components/ShiftCalendarView';

import AdminQRCode from './components/AdminQRCode';
import EmployeeQRScanner from './components/EmployeeQRScanner';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
          <Route path="/shift-schedule" element={<ShiftSchedule />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} /> {/* Employee */}
          <Route path="/employee-profile" element={<EmployeeProfile />} />
          <Route path="/employee-shift-calendar" element={<ShiftCalendarView />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/add" element={<AddEmployee />} />
        <Route path="/edit-employee/:id" element={<EditEmployee />} />
        <Route path="/edit/:id" element={<EditEmployee />} />
        <Route path="/manage-employees" element={<ManageEmployees />} />
        <Route path="/add-employee" element={<AddEmployee />} />
        <Route path="/attendance" element={<AttendanceTracker />} />
        <Route path="/reports" element={<Reports />} />   

          <Route path="/admin-qr" element={<AdminQRCode />} />
          <Route path="/scan-qr" element={<EmployeeQRScanner />} />
      </Routes>
    </Router>
  );
}

export default App;
