import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Keep this import

const localizer = momentLocalizer(moment);

const ShiftCalendarView = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safely get user from localStorage only on the client side
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    setUser(loggedInUser);
  }, []);

  useEffect(() => {
    const fetchShiftData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://backendattendance-1.onrender.com/api/employees/shift/${user?.id}`);
        if (!response.ok) throw new Error('Failed to fetch shifts');
        const data = await response.json();

        const formattedEvents = data.shifts.map((shift) => ({
          title: `${shift.shiftType.toUpperCase()} SHIFT`,
          start: new Date(shift.startTime),
          end: new Date(shift.endTime),
          allDay: false,
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching shift data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchShiftData();
    } else {
      setLoading(false); // If no user, stop loading
    }
  }, [user]);

  const handleSelectEvent = (event) => setSelectedEvent(event);
  const closeModal = () => setSelectedEvent(null);

  // --- ALL STYLES ARE CONTAINED HERE ---
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
    :root { --blue-accent: #3b82f6; --blue-accent-dark: #2563eb; --slate-light: #e2e8f0; --slate-dark: #1e293b; --slate-darker: #0f172a; --slate-border: #334155; --text-light-accent: #93c5fd; }
    
    .manage-page-bg { min-height: 100vh; font-family: 'Poppins', sans-serif; background: linear-gradient(135deg, #020617, var(--slate-darker), #1e3a8a); color: var(--slate-light); padding: 2rem; box-sizing: border-box; }
    .manage-container { max-width: 1200px; margin: 0 auto; }
    .manage-header h1 { font-size: 2.5rem; font-weight: 700; color: #f8fafc; text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5); margin-bottom: 2rem; text-align: center; }

    .loader-container { display: flex; justify-content: center; align-items: center; height: 500px; }
    .loader { width: 48px; height: 48px; border: 5px solid #FFF; border-bottom-color: var(--blue-accent); border-radius: 50%; display: inline-block; box-sizing: border-box; animation: rotation 1s linear infinite; }
    @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .calendar-container { background-color: rgba(15, 23, 42, 0.6); border: 1px solid var(--slate-border); border-radius: 12px; padding: 1.5rem; backdrop-filter: blur(10px); }
    
    /* --- React Big Calendar Style Overrides --- */
    .rbc-calendar { color: var(--slate-light); }
    .rbc-toolbar { margin-bottom: 1.5rem; text-transform: uppercase; font-weight: 600; }
    .rbc-toolbar .rbc-toolbar-label { color: #f8fafc; font-size: 1.5em; }
    .rbc-btn-group button { color: var(--slate-light); background: transparent; border: 1px solid var(--slate-border); transition: all 0.2s ease; }
    .rbc-btn-group button:hover { background: var(--slate-dark); border-color: var(--blue-accent); }
    .rbc-btn-group button.rbc-active, .rbc-btn-group button.rbc-active:hover { background-color: var(--blue-accent); border-color: var(--blue-accent); color: white; box-shadow: none; }
    .rbc-header { color: var(--text-light-accent); border: none; padding: 0.75rem 0; }
    .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border: 1px solid var(--slate-border); }
    .rbc-day-bg { border-left: 1px solid var(--slate-border); }
    .rbc-day-bg.rbc-today { background-color: rgba(59, 130, 246, 0.1); }
    .rbc-month-row { border: none; }
    .rbc-event { background-color: var(--blue-accent); border: 1px solid var(--blue-accent-dark); border-radius: 6px; padding: 4px 8px; font-size: 0.9em; }
    .rbc-show-more { color: var(--text-light-accent); }
    .rbc-off-range-bg { background-color: rgba(0,0,0,0.2); }
    
    /* --- Modal Styles --- */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: var(--slate-darker); border: 2px solid var(--blue-accent); border-radius: 16px; padding: 2rem; max-width: 500px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    .modal-content h3 { color: #f8fafc; margin-top: 0; }
    .modal-content p { margin: 0.5rem 0; }
    .modal-content button { display: block; width: 100%; margin-top: 2rem; padding: 12px; font-size: 1rem; font-weight: 600; color: #fff; background: var(--blue-accent); border: none; border-radius: 8px; cursor: pointer; transition: background-color 0.2s ease; }
    .modal-content button:hover { background: var(--blue-accent-dark); }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="manage-page-bg">
        <div className="manage-container">
          <header className="manage-header">
            <h1>{user?.name ? `${user.name}'s Schedule Calendar` : 'Shift Calendar'}</h1>
          </header>

          {loading ? (
            <div className="loader-container"><span className="loader"></span></div>
          ) : (
            <div className="calendar-container">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '70vh' }}
                views={['month', 'week', 'day']}
                onSelectEvent={handleSelectEvent}
              />
            </div>
          )}
        </div>

        {selectedEvent && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>{selectedEvent.title}</h3>
              <p><strong>Start:</strong> {moment(selectedEvent.start).format('MMMM Do YYYY, h:mm A')}</p>
              <p><strong>End:</strong> {moment(selectedEvent.end).format('MMMM Do YYYY, h:mm A')}</p>
              <button onClick={closeModal}>Close</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ShiftCalendarView;