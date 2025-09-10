import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ManageEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchEmployees = () => {
        axios.get('http://localhost:8080/api/employees')
            .then(response => setEmployees(response.data))
            .catch(error => {
                console.error('Error fetching employees:', error);
                // You can add mock data here for testing if the backend is down
            });
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (location.state?.updated) {
            fetchEmployees();
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const formatShift = (shiftDetails) => {
        if (!shiftDetails) return '-';
        if (typeof shiftDetails === 'string') return shiftDetails;
        const { shiftName, startTime, endTime } = shiftDetails;
        return `${shiftName} (${startTime} - ${endTime})`;
    };
    
    // Download and Delete functions remain the same
    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(employees.map(emp => ({ ID: emp.id, EmployeeCode: emp.employeeCode, Name: emp.name, Username: emp.username, Email: emp.email, Mobile: emp.mobileNumber, DOB: emp.dob, JoiningDate: emp.joiningDate, Shift: formatShift(emp.shiftDetails), Salary: emp.salary, Status: emp.status, Role: emp.role, EmergencyContact: emp.emergencyContactNumber, EmergencyRelation: emp.emergencyRelation })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
        XLSX.writeFile(workbook, 'employees.xlsx');
    };
    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text('Employee List', 14, 10);
        autoTable(doc, { head: [['ID', 'Code', 'Name', 'Username', 'Email', 'Mobile', 'DOB', 'Joining', 'Shift', 'Salary', 'Status', 'Role', 'Emergency Contact', 'Relation']], body: employees.map(emp => [emp.id, emp.employeeCode, emp.name, emp.username, emp.email, emp.mobileNumber, emp.dob, emp.joiningDate, formatShift(emp.shiftDetails), emp.salary, emp.status, emp.role, emp.emergencyContactNumber, emp.emergencyRelation]), startY: 20 });
        doc.save('employees.pdf');
    };
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try { await axios.delete(`http://localhost:8080/api/employees/${id}`); fetchEmployees(); }
            catch (error) { console.error('Error deleting employee:', error); alert('Failed to delete employee.'); }
        }
    };

    const filteredEmployees = employees.filter(emp => Object.values(emp).some(value => String(value).toLowerCase().includes(search.toLowerCase())));
    const handleKnowMore = (employee) => { setSelectedEmployee(employee); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedEmployee(null); };

    // --- ALL STYLES ARE CONTAINED HERE ---
    const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
    :root { --blue-accent: #3b82f6; --blue-accent-dark: #2563eb; --slate-light: #e2e8f0; --slate-dark: #1e293b; --slate-darker: #0f172a; --slate-border: #334155; --text-light-accent: #93c5fd; }
    .manage-page-bg { min-height: 100vh; font-family: 'Poppins', sans-serif; background: linear-gradient(135deg, #020617, var(--slate-darker), #1e3a8a); color: var(--slate-light); padding: 2rem; box-sizing: border-box; }
    .manage-container { max-width: 1200px; margin: 0 auto; }
    .manage-header h1 { font-size: 2.5rem; font-weight: 700; color: #f8fafc; text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5); margin-bottom: 2rem; text-align: center; }
    .toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; padding: 1.5rem; background-color: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(var(--blue-accent), 0.3); }
    .search-bar { flex-grow: 1; min-width: 250px; }
    .search-bar input { width: 100%; padding: 10px 15px; font-size: 1rem; background-color: var(--slate-dark); border: 2px solid var(--slate-border); border-radius: 8px; color: var(--slate-light); transition: all 0.2s ease-out; }
    .search-bar input::placeholder { color: #94a3b8; }
    .search-bar input:focus { outline: none; border-color: var(--blue-accent); box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); }
    .toolbar-buttons { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .toolbar-btn { padding: 10px 20px; font-size: 0.9rem; font-weight: 600; color: #fff; background: linear-gradient(to right, var(--blue-accent), #60a5fa); border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2); }
    .toolbar-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3); }
    .table-wrapper { overflow-x: auto; background-color: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.3); padding: 1rem; }
    .students-table { width: 100%; border-collapse: collapse; }
    .students-table thead { background-color: rgba(30, 41, 59, 0.8); }
    .students-table th { padding: 1rem; text-align: left; font-weight: 600; color: var(--text-light-accent); text-transform: uppercase; letter-spacing: 0.5px; font-size: 0.9rem; }
    .students-table tbody tr { border-bottom: 1px solid rgba(59, 130, 246, 0.2); transition: background-color 0.2s ease-in-out; }
    .students-table tbody tr:last-child { border-bottom: none; }
    .students-table tbody tr:hover { background-color: rgba(59, 130, 246, 0.1); }
    .students-table td { padding: 1rem; vertical-align: middle; }
    .status-active { color: #4ade80; font-weight: 600; }
    .status-inactive { color: #f87171; font-weight: 600; }
    .action-buttons button { padding: 6px 12px; margin-right: 5px; border: none; border-radius: 6px; cursor: pointer; color: #0d1117; font-weight: 600; font-size: 0.8rem; transition: transform 0.2s ease; }
    .action-buttons button:hover { transform: scale(1.05); }
    .btn-edit { background-color: #facc15; }
    .btn-delete { background-color: #f87171; color: white; }
    .btn-know-more { background-color: #94a3b8; color: white; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: var(--slate-darker); border: 2px solid var(--blue-accent); border-radius: 16px; padding: 2rem; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    .modal-content h3 { color: #f8fafc; text-align: center; margin-top: 0; margin-bottom: 1.5rem; font-size: 1.5rem; }
    .modal-table { width: 100%; border-collapse: collapse; }
    .modal-table th, .modal-table td { text-align: left; padding: 0.75rem; border-bottom: 1px solid var(--slate-border); }
    .modal-table th { color: var(--text-light-accent); font-weight: 600; width: 40%; }
    .modal-table td { color: var(--slate-light); }
    .modal-content button { display: block; width: 100%; margin-top: 2rem; padding: 12px; font-size: 1rem; font-weight: 600; color: #fff; background: var(--blue-accent); border: none; border-radius: 8px; cursor: pointer; transition: background-color 0.2s ease; }
    .modal-content button:hover { background: var(--blue-accent-dark); }
    
    @media (max-width: 768px) {
        .manage-page-bg { padding: 1rem; }
        .manage-header h1 { font-size: 1.8rem; }
        .toolbar { flex-direction: column; align-items: stretch; padding: 1rem; }
        .students-table thead { display: none; }
        .students-table, .students-table tbody, .students-table tr, .students-table td { display: block; width: 100%; }
        .students-table tr { margin-bottom: 1rem; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 1rem; background-color: var(--slate-dark); }
        .students-table tbody tr:hover { background-color: var(--slate-dark); }
        .students-table td { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.1); text-align: right; }
        .students-table td:last-child { border-bottom: none; }
        .students-table td::before { content: attr(data-label); font-weight: 600; color: var(--text-light-accent); text-align: left; margin-right: 1rem; }
        .action-buttons { flex-wrap: wrap; justify-content: flex-end; }
    }
    `;

    return (
        <>
            <style>{styles}</style>
            <div className="manage-page-bg">
                <div className="manage-container">
                    <div className="manage-header">
                        <h1>Employee Management</h1>
                    </div>

                    <div className="toolbar">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search Student..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="toolbar-buttons">
                            <button className="toolbar-btn" onClick={() => navigate('/add-employee')}>
                                Add Student
                            </button>
                            <button className="toolbar-btn" onClick={downloadExcel}>Download Excel</button>
                            <button className="toolbar-btn" onClick={downloadPDF}>Download PDF</button>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        {filteredEmployees.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '2rem' }}>No employees found.</p>
                        ) : (
                            <table className="students-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Code</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map((emp) => (
                                        <tr key={emp.id}>
                                            <td data-label="ID">{emp.id}</td>
                                            <td data-label="Code">{emp.employeeCode}</td>
                                            <td data-label="Name">{emp.name}</td>
                                            <td data-label="Email">{emp.email}</td>
                                            <td data-label="Status">
                                                <span className={emp.status === 'Active' ? 'status-active' : 'status-inactive'}>
                                                    {emp.status}
                                                </span>
                                            </td>
                                            <td data-label="Actions">
                                                <div className="action-buttons">
                                                    <button className="btn-edit" onClick={() => navigate(`/edit-employee/${emp.id}`)}>Edit</button>
                                                    <button className="btn-delete" onClick={() => handleDelete(emp.id)}>Delete</button>
                                                    <button className="btn-know-more" onClick={() => handleKnowMore(emp)}>Know More</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && selectedEmployee && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Employee Details</h3>
                        <table className="modal-table">
                            <tbody>
                                <tr><th>ID</th><td>{selectedEmployee.id}</td></tr>
                                <tr><th>Student Code</th><td>{selectedEmployee.employeeCode}</td></tr>
                                <tr><th>Name</th><td>{selectedEmployee.name}</td></tr>
                                <tr><th>Username</th><td>{selectedEmployee.username}</td></tr>
                                <tr><th>Email</th><td>{selectedEmployee.email}</td></tr>
                                <tr><th>Mobile</th><td>{selectedEmployee.mobileNumber}</td></tr>
                                <tr><th>DOB</th><td>{selectedEmployee.dob}</td></tr>
            
                                <tr><th>Shift</th><td>{formatShift(selectedEmployee.shiftDetails)}</td></tr>
                               
                                <tr><th>Status</th><td><span className={selectedEmployee.status === 'Active' ? 'status-active' : 'status-inactive'}>{selectedEmployee.status}</span></td></tr>
                                <tr><th>Role</th><td>{selectedEmployee.role}</td></tr>
                                <tr><th>Emergency Contact</th><td>{selectedEmployee.emergencyContactNumber}</td></tr>
                                <tr><th>Relation</th><td>{selectedEmployee.emergencyRelation}</td></tr>
                            </tbody>
                        </table>
                        <button onClick={handleCloseModal}>Close</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageEmployees;