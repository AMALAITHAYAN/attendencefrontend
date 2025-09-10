import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// --- 1. Import react-toastify ---
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Helper functions from your original code
const convertTo24Hour = (timeStr) => {
    if (!timeStr) return '';
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = modifier === 'AM' ? '00' : '12';
    else if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
    return `${hours.padStart(2, '0')}:${minutes}`;
};

const predefinedShifts = ['9:00 AM - 6:00 PM', '8:00 AM - 5:00 PM', '8:00 AM - 1:00 PM', '1:00 PM - 5:00 PM', '10:00 AM - 7:00 PM', '12:00 PM - 8:00 PM', '6:00 AM - 2:00 PM', 'Flexible'];

const ShiftSchedule = () => {
    const [shifts, setShifts] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedShift, setSelectedShift] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [foundEmployee, setFoundEmployee] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const fetchShiftsForEmployee = async (employee) => {
        if (!employee) {
            setShifts({});
            return;
        }
        setErrorMsg('');
        try {
            const response = await fetch(`https://backendattendance-1.onrender.com/api/employees/shift/${employee.id}`);
            if (!response.ok) throw new Error('Failed to load shifts');
            const shiftData = await response.json();
            setShifts({ [employee.id]: shiftData.shifts || {} });
        } catch (error) {
            console.error(error);
            setErrorMsg('Failed to load schedule for student');
            setShifts({});
        }
    };
    
    const events =
    foundEmployee && shifts[foundEmployee.id]
      ? Object.entries(shifts[foundEmployee.id]).flatMap(([date, shiftList]) => {
          const list = Array.isArray(shiftList) ? shiftList : [shiftList];
          return list.map((shift, index) => {
            if (typeof shift !== 'string' || shift === 'Flexible') return { id: `${date}-${index}`, title: 'Flexible', start: date, allDay: true };
            const [startStr, endStr] = shift.split(' - ');
            if (!startStr || !endStr) return null;
            const startDateTime = new Date(`${date}T${convertTo24Hour(startStr)}:00`);
            const endDateTime = new Date(`${date}T${convertTo24Hour(endStr)}:00`);
            return { id: `${date}-${index}`, title: shift, start: startDateTime, end: endDateTime, allDay: false };
          });
        }).filter(Boolean)
      : [];
    
    const handleDateClick = (info) => {
        // --- Replaced alert with toast notification ---
        if (!foundEmployee) {
            toast.warn('Please search and select an employee first.');
            return;
        }
        setSelectedDate(info.dateStr);
        setSelectedShift('');
        setShowPopup(true);
    };

    const handleSaveShift = async () => {
        if (!selectedShift || !selectedDate || !foundEmployee) return;
        try {
            const payload = [{ employeeId: foundEmployee.id, date: selectedDate, shift: selectedShift }];
            const response = await fetch('https://backendattendance-1.onrender.com/api/employees/shifts/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error('Failed to save shift');
            await fetchShiftsForEmployee(foundEmployee);
            setShowPopup(false);
            // --- Replaced alert with toast notification ---
            toast.success('Schedule saved successfully!');
        } catch (error) {
            console.error('Error saving shift:', error);
            // --- Replaced alert with toast notification ---
            toast.error('Error saving shift');
        }
    };
    
    const handleSearch = async () => {
        setErrorMsg('');
        if (!searchTerm.trim()) { setFoundEmployee(null); setErrorMsg('Please enter employee ID or name'); return; }
        try {
            const response = await fetch(`https://backendattendance-1.onrender.com/api/employees/shift/${encodeURIComponent(searchTerm)}`);
            if (!response.ok) throw new Error('Employee not found');
            const data = await response.json();
            if (data && data.id) {
                const employee = { id: data.id, name: data.name };
                setFoundEmployee(employee);
                setShifts({ [data.id]: data.shifts || {} });
            } else { setFoundEmployee(null); setErrorMsg('Student not found'); }
        } catch (error) {
            console.error('Search error:', error);
            setFoundEmployee(null);
            setErrorMsg('Employee not found');
        }
    };

    const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
    :root { --blue-accent: #3b82f6; --blue-accent-dark: #2563eb; --slate-light: #e2e8f0; --slate-dark: #1e293b; --slate-darker: #0f172a; --slate-border: #334155; --text-light-accent: #93c5fd; --red-accent: #ef4444; }
    
    .manage-page-bg { min-height: 100vh; font-family: 'Poppins', sans-serif; background: linear-gradient(135deg, #020617, var(--slate-darker), #1e3a8a); color: var(--slate-light); padding: 2rem; box-sizing: border-box; }
    .manage-container { max-width: 1200px; margin: 0 auto; }
    .manage-header h1 { font-size: 2.5rem; font-weight: 700; color: #f8fafc; text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5); margin-bottom: 2rem; text-align: center; }

    .toolbar { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; padding: 1.5rem; background-color: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid var(--slate-border); }
    .search-bar { display: flex; gap: 1rem; width: 100%; }
    .search-bar input { flex-grow: 1; padding: 10px 15px; font-size: 1rem; background-color: var(--slate-dark); border: 2px solid var(--slate-border); border-radius: 8px; color: var(--slate-light); transition: all 0.2s ease-out; }
    .search-bar input:focus { outline: none; border-color: var(--blue-accent); box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); }
    .toolbar-btn { padding: 10px 20px; font-size: 0.9rem; font-weight: 600; color: #fff; background: linear-gradient(to right, var(--blue-accent), #60a5fa); border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; }
    
    .employee-info h3 { color: var(--text-light-accent); margin: 0; }
    .error-message { color: var(--red-accent); font-weight: 600; text-align: center; }

    .calendar-wrapper { background-color: rgba(15, 23, 42, 0.6); border: 1px solid var(--slate-border); border-radius: 12px; padding: 1.5rem; }

    .fc { --fc-bg-event-color: var(--blue-accent); --fc-border-color: var(--slate-border); --fc-page-bg-color: transparent; --fc-neutral-bg-color: transparent; --fc-list-event-dot-width: 10px; --fc-daygrid-event-dot-width: 10px; --fc-button-bg-color: var(--slate-dark); --fc-button-text-color: var(--slate-light); --fc-button-border-color: var(--slate-border); --fc-button-hover-bg-color: var(--slate-border); --fc-button-active-bg-color: var(--blue-accent); --fc-today-bg-color: rgba(59, 130, 246, 0.15); color: var(--slate-light); }
    .fc .fc-col-header-cell-cushion { color: var(--text-light-accent); text-decoration: none; }
    .fc .fc-daygrid-day-number { color: var(--slate-light); text-decoration: none; }
    .fc-event { border: none !important; padding: 4px 6px; }
    .fc-event-main { font-weight: 600; }

    .popup-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .popup { background: var(--slate-darker); border: 2px solid var(--blue-accent); border-radius: 16px; padding: 2rem; max-width: 400px; width: 90%; text-align: center; }
    .popup h3 { color: #f8fafc; margin-top: 0; }
    .popup select { width: 100%; padding: 12px 15px; font-size: 1rem; background-color: var(--slate-dark); border: 2px solid var(--slate-border); border-radius: 8px; color: var(--slate-light); margin: 1rem 0; appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2393c5fd%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E'); background-repeat: no-repeat; background-position: right 15px top 50%; background-size: .65em auto; }
    .popup-buttons { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
    .form-btn { padding: 10px 24px; font-size: 0.9rem; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; }
    .btn-primary { color: #fff; background: var(--blue-accent); }
    .btn-secondary { color: var(--slate-light); background: transparent; border: 2px solid var(--slate-border); }
    .return-btn { margin-top: 2rem; display: block; margin-left: auto; margin-right: auto; }
  `;

  return (
    <>
      <style>{styles}</style>
      {/* --- 2. Add the ToastContainer to your component --- */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="manage-page-bg">
        <div className="manage-container">
          <div className="manage-header">
            <h1>Student Schedule Schedule</h1>
          </div>

          <div className="toolbar">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search student by ID or name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="toolbar-btn" onClick={handleSearch}>Search</button>
            </div>
            {errorMsg && <p className="error-message">{errorMsg}</p>}
            {foundEmployee && (
              <div className="employee-info">
                <h3>Viewing Schedule for: {foundEmployee.name} ({foundEmployee.id})</h3>
              </div>
            )}
          </div>
          
          <div className="calendar-wrapper">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              dateClick={handleDateClick}
              events={events}
              height="70vh"
              contentHeight="auto"
            />
          </div>

          <button className="toolbar-btn return-btn" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </button>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Select Schedule for {selectedDate}</h3>
            <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)}>
              <option value="">-- Select a shift --</option>
              {predefinedShifts.map((shift, idx) => (
                <option key={idx} value={shift}>{shift}</option>
              ))}
            </select>
            <div className="popup-buttons">
              <button className="form-btn btn-secondary" onClick={() => setShowPopup(false)}>Cancel</button>
              <button className="form-btn btn-primary" onClick={handleSaveShift} disabled={!selectedShift}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShiftSchedule;