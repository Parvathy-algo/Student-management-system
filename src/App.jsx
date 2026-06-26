import React, { useState } from 'react';
import './App.css';

function App() {
  // Navigation Routing States: 'home' | 'login' | 'portal'
  const [viewMode, setViewMode] = useState('home'); 
  const [activeDeptHome, setActiveDeptHome] = useState('CSE');
  
  // User Mode Roles: 'admin' | 'student'
  const [userRole, setUserRole] = useState(null);
  const [activeStudentSession, setActiveStudentSession] = useState(null);
  
  // Tab Trackers
  const [adminTab, setAdminTab] = useState('dashboard');
  const [studentTab, setStudentTab] = useState('dashboard');
  
  // Login States
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // Available Departments
  const departments = ['All', 'CS', 'IT', 'EC', 'ME'];

  // Clean, empty state stores ready for your data input
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  
  const [courses, setCourses] = useState([
    { id: 1, name: "DBMS", code: "CS201", credits: 4, faculty: "Anjali Ma'am" },
    { id: 2, name: "OS", code: "CS202", credits: 3, faculty: "Rahul Sir" },
    { id: 3, name: "COA", code: "CS203", credits: 4, faculty: "Nithin Sir" }
  ]);

  const [announcements, setAnnouncements] = useState([
    { id: 1, title: "📅 Semester Exam Schedule", content: "End semester evaluations start on July 10, 2026. Clear your outstanding dues before June 30.", type: "exam" },
    { id: 2, title: "🎉 Monsoon Institutional Holiday", content: "Campus will remain completely non-operational this Friday due to heavy environmental alerts.", type: "holiday" },
    { id: 3, title: "🚀 DBMS Assignment Submission", content: "Upload your normalization database schematics before tomorrow midnight.", type: "deadline" }
  ]);

  // Form Field Dynamic Maps
  const [studentForm, setStudentForm] = useState({ 
    id: null, 
    name: '', 
    department: 'CS', 
    regNumber: '', 
    email: '', 
    phone: '', 
    semester: 'S1', 
    cgpa: '8.0' 
  });
  
  const [courseForm, setCourseForm] = useState({ name: '', code: '', credits: '', faculty: '' });
  const [attendanceForm, setAttendanceForm] = useState({ studentId: '', course: 'DBMS', status: 'Present' });
  const [marksForm, setMarksForm] = useState({ studentId: '', course: 'DBMS', internal: '', assignment: '', exam: '' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', type: 'exam' });

  // Unified Route Identity Authentication Sequence
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    const formattedId = loginId.toUpperCase().trim();

    // Condition A: Administrative Check Bypass
    if (loginId === 'admin' && password === 'admin123') {
      setUserRole('admin');
      setViewMode('portal');
      return;
    }

    // Map configuration keys to data layout prefixes
    const prefixRules = {
      CSE: { prefix: "TJE23CS", mappedDept: "CS" },
      IT: { prefix: "TJE23IT", mappedDept: "IT" },
      ECE: { prefix: "TJE23EC", mappedDept: "EC" }
    };

    const rules = prefixRules[activeDeptHome];

    // Restrict login access if user ID does not match selected department prefix
    if (!formattedId.startsWith(rules.prefix)) {
      setAuthError(`❌ Access denied. You selected ${activeDeptHome} Department. Credentials must start with "${rules.prefix}"`);
      return;
    }

    // Condition B: Verify student database matching credentials
    const authenticatedStudent = students.find(s => {
      const matchId = s.rollNumber.toUpperCase() === formattedId;
      const matchPass = s.password === password;
      const matchDept = s.department.toUpperCase() === rules.mappedDept;
      return matchId && matchPass && matchDept;
    });

    if (authenticatedStudent) {
      setUserRole('student');
      setActiveStudentSession(authenticatedStudent);
      setViewMode('portal');
    } else {
      setAuthError(`❌ Invalid credentials. Profile not found under ${activeDeptHome} database registry.`);
    }
  };

  const handleLogout = () => {
    setLoginId('');
    setPassword('');
    setUserRole(null);
    setActiveStudentSession(null);
    setViewMode('home');
  };

  // State Manipulation Functions (Admin Workspace Actions)
  const handleStudentSubmit = (e) => {
    e.preventDefault();
    
    const deptCode = studentForm.department.toUpperCase();
    const cleanRegNum = studentForm.regNumber.trim();
    const formattedRegNumber = cleanRegNum.length === 2 ? `0${cleanRegNum}` : cleanRegNum;
    const shortNumber = formattedRegNumber.slice(-2); 

    const generatedRoll = `TJE23${deptCode}${formattedRegNumber}`;
    const generatedPassword = `stud${shortNumber}`;

    const completeStudentData = {
      id: studentForm.id !== null ? studentForm.id : Date.now(),
      name: studentForm.name,
      department: studentForm.department,
      rollNumber: generatedRoll,
      password: generatedPassword,
      email: studentForm.email,
      phone: studentForm.phone,
      semester: studentForm.semester,
      cgpa: studentForm.cgpa
    };

    if (studentForm.id !== null) {
      setStudents(prev => prev.map(s => s.id === studentForm.id ? completeStudentData : s));
      if (activeStudentSession && activeStudentSession.id === studentForm.id) {
        setActiveStudentSession(completeStudentData);
      }
    } else {
      setStudents(prev => [...prev, completeStudentData]);
    }
    
    setStudentForm({ id: null, name: '', department: 'CS', regNumber: '', email: '', phone: '', semester: 'S1', cgpa: '8.0' });
  };

  const deleteStudent = (id) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleCourseSubmit = (e) => {
    e.preventDefault();
    setCourses(prev => [...prev, { ...courseForm, id: Date.now() }]);
    setCourseForm({ name: '', code: '', credits: '', faculty: '' });
  };

  const handleAttendanceSubmit = (e) => {
    e.preventDefault();
    setAttendance(prev => [...prev, { ...attendanceForm, id: Date.now(), studentId: Number(attendanceForm.studentId) }]);
    setAttendanceForm({ studentId: '', course: 'DBMS', status: 'Present' });
  };

  const handleMarksSubmit = (e) => {
    e.preventDefault();
    const total = Number(marksForm.internal) + Number(marksForm.assignment) + Number(marksForm.exam);
    let grade = 'F';
    if (total >= 90) grade = 'S';
    else if (total >= 80) grade = 'A';
    else if (total >= 70) grade = 'B';
    else if (total >= 50) grade = 'C';

    setMarks(prev => [...prev, {
      id: Date.now(),
      studentId: Number(marksForm.studentId),
      course: marksForm.course,
      internal: Number(marksForm.internal),
      assignment: Number(marksForm.assignment),
      exam: Number(marksForm.exam),
      totalGrade: grade
    }]);
    setMarksForm({ studentId: '', course: 'DBMS', internal: '', assignment: '', exam: '' });
  };

  const handleAnnouncementSubmit = (e) => {
    e.preventDefault();
    setAnnouncements(prev => [...prev, { ...announcementForm, id: Date.now() }]);
    setAnnouncementForm({ title: '', content: '', type: 'exam' });
  };

  // Metric Math Calculators
  const calculateStudentAttendance = (studentId) => {
    const records = attendance.filter(a => a.studentId === studentId);
    if (!records.length) return 100;
    const present = records.filter(a => a.status === 'Present').length;
    return Math.round((present / records.length) * 100);
  };

  const calculateSubjectAttendance = (studentId, courseName) => {
    const records = attendance.filter(a => a.studentId === studentId && a.course === courseName);
    if (!records.length) return 100;
    const present = records.filter(a => a.status === 'Present').length;
    return Math.round((present / records.length) * 100);
  };

  const filteredStudents = students
    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(s => selectedDepartment === 'All' || s.department === selectedDepartment);

  // ==========================================
  // VIEW INTERFACE 1: DEPARTMENT-CENTRIC HOMEPAGE
  // ==========================================
  if (viewMode === 'home') {
    const departmentConfigs = {
      IdRuleMapping: { CSE: "CS", IT: "IT", ECE: "EC" },
      CSE: {
        fullName: "Computer Science & Engineering",
        icon: "💻",
        subjects: ["DBMS", "Computer Graphics", "Compiler Design", "Data Structures"]
      },
      IT: {
        fullName: "Information Technology",
        icon: "🌐",
        subjects: ["Web Technology", "Cloud Computing", "Information Security", "Software Engineering"]
      },
      ECE: {
        fullName: "Electronics & Communication",
        icon: "📡",
        subjects: ["Digital Signal Processing", "Microprocessors", "Embedded Systems", "VLSI Design"]
      }
    };

    const targetCode = departmentConfigs.IdRuleMapping[activeDeptHome];
    const filteredStudentsHome = students.filter(
      (student) => student.department && student.department.toUpperCase() === targetCode.toUpperCase()
    );

    return (
      <div className="home-page-wrapper">
        <header className="home-top-navbar">
          <div className="home-portal-logo">
            <span className="portal-logo-icon">🎓</span> Acadexa Portal
          </div>
          <button className="btn-portal-login" onClick={() => { setAuthError(''); setViewMode('login'); }}>
            Log in as {activeDeptHome} Member →
          </button>
        </header>

        <div className="home-hero-container">
          <h1 className="home-main-title">Institutional Roster & Curriculum Directory</h1>
          <p className="home-sub-text">
            Select a specific academic department below to inspect active curriculum structures and filter current student rosters instantly.
          </p>
        </div>

        <div className="home-tabs-row">
          {['CSE', 'IT', 'ECE'].map((deptKey) => (
            <button
              key={deptKey}
              className={`home-tab-card ${activeDeptHome === deptKey ? 'active' : ''}`}
              onClick={() => setActiveDeptHome(deptKey)}
            >
              <span className="home-tab-icon">{departmentConfigs[deptKey].icon}</span>
              <div className="home-tab-info">
                <span className="home-tab-title">{deptKey} Department</span>
                <span className="home-tab-subtitle">{departmentConfigs[deptKey].fullName}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="home-workspace-grid">
          <div className="home-display-panel">
            <h3 className="panel-header-title">📚 Active Course Modules ({activeDeptHome})</h3>
            <p className="panel-header-subtitle">Current semester subjects tracked within this branch category:</p>
            <div className="home-subjects-stack">
              {departmentConfigs[activeDeptHome].subjects.map((subject, index) => (
                <div key={index} className="home-subject-item">
                  <span className="subject-bullet">🔹</span> {subject}
                </div>
              ))}
            </div>
          </div>

          <div className="home-display-panel">
            <h3 className="panel-header-title">👥 Registered Students Roster ({filteredStudentsHome.length})</h3>
            <p className="panel-header-subtitle">Enrolled student profiles associated with {activeDeptHome}:</p>
            
            {filteredStudentsHome.length === 0 ? (
              <div className="home-empty-alert">
                No students currently logged under the {activeDeptHome} database segment.
              </div>
            ) : (
              <div className="home-table-container">
                <table className="home-portal-table">
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Student Name</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudentsHome.map((student) => (
                      <tr key={student.id}>
                        <td className="home-td-mono">{student.rollNumber}</td>
                        <td className="home-td-bold">{student.name}</td>
                        <td>
                          <span className={`home-badge-pill ${student.department.toLowerCase()}`}>
                            {student.department.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW INTERFACE 2: DUAL-ROLE LOGIN CARD
  // ==========================================
  if (viewMode === 'login') {
    const placeholderPrefixes = { CSE: "TJE23CS0XX", IT: "TJE23IT0XX", ECE: "TJE23EC0XX" };
    return (
      <div className="login-page-bg">
        <div className="modern-login-card">
          <div className="modern-login-logo">🔒</div>
          <h2 className="modern-login-title">{activeDeptHome} Member Portal</h2>
          <p className="modern-login-subtitle">
            Access strictly monitored. Expected ID range: {placeholderPrefixes[activeDeptHome]}
          </p>
          
          {authError && <div className="modern-alert-error">{authError}</div>}
          
          <form onSubmit={handleLoginSubmit} className="modern-login-form" autoComplete="off">
            <div className="input-container">
              <input 
                className="modern-input-field" 
                type="text" 
                placeholder="Unique ID or Administrative ID" 
                value={loginId} 
                onChange={e => setLoginId(e.target.value)} 
                required 
              />
            </div>
            <div className="input-container">
              <input 
                className="modern-input-field" 
                type="password" 
                placeholder="Account Security Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="modern-btn-submit">Authenticate Verification</button>
          </form>
          
          <button className="modern-btn-back" style={{ marginTop: '24px' }} onClick={() => { setAuthError(''); setViewMode('home'); }}>
            ← Switch Selected Department
          </button>
        </div>
      </div>
    );
  } 

  // ==========================================
  // VIEW INTERFACE 3: SECURE CENTRAL PORTAL WORKSPACE
  // ==========================================
  return (
    <div className="app-wrapper">
      <aside className="sidebar">
        {userRole === 'admin' ? (
          <>
            <div className="brand">🛡️ Admin Dashboard</div>
            <button className={`nav-button ${adminTab === 'dashboard' ? 'active' : ''}`} onClick={() => setAdminTab('dashboard')}>📊 Dashboard Overview</button>
            <button className={`nav-button ${adminTab === 'students' ? 'active' : ''}`} onClick={() => setAdminTab('students')}>👥 Student Control</button>
            <button className={`nav-button ${adminTab === 'courses' ? 'active' : ''}`} onClick={() => setAdminTab('courses')}>📚 Manage Courses</button>
            <button className={`nav-button ${adminTab === 'attendance' ? 'active' : ''}`} onClick={() => setAdminTab('attendance')}>📝 Record Attendance</button>
            <button className={`nav-button ${adminTab === 'marks' ? 'active' : ''}`} onClick={() => setAdminTab('marks')}>🎯 Examination Desk</button>
            <button className={`nav-button ${adminTab === 'announcements' ? 'active' : ''}`} onClick={() => setAdminTab('announcements')}>📢 Send Announcements</button>
          </>
        ) : (
          <>
            <div className="brand">🎓 Student Portal</div>
            <button className={`nav-button ${studentTab === 'dashboard' ? 'active' : ''}`} onClick={() => setStudentTab('dashboard')}>🏠 Dashboard</button>
            <button className={`nav-button ${studentTab === 'profile' ? 'active' : ''}`} onClick={() => setStudentTab('profile')}>👤 My Profile</button>
            <button className={`nav-button ${studentTab === 'courses' ? 'active' : ''}`} onClick={() => setStudentTab('courses')}>📚 My Courses</button>
            <button className={`nav-button ${studentTab === 'attendance' ? 'active' : ''}`} onClick={() => setStudentTab('attendance')}>📅 Attendance</button>
            <button className={`nav-button ${studentTab === 'grades' ? 'active' : ''}`} onClick={() => setStudentTab('grades')}>📝 Grades / Marks</button>
            <button className={`nav-button ${studentTab === 'faculty' ? 'active' : ''}`} onClick={() => setStudentTab('faculty')}>👨‍🏫 Faculty Directory</button>
            <button className={`nav-button ${studentTab === 'announcements' ? 'active' : ''}`} onClick={() => setStudentTab('announcements')}>📢 Notices <span className="badge danger" style={{marginLeft:'auto'}}>{announcements.length}</span></button>
          </>
        )}
        <button className="nav-button logout-btn" onClick={handleLogout}>🚪 Terminate Session</button>
      </aside>

      <main className="main-content">
        {userRole === 'admin' && (
          <div>
            {adminTab === 'dashboard' && (
              <div>
                <h2 className="page-title">Application Overview Metrics</h2>
                <div className="card-grid">
                  <div className="stat-card blue"><span className="card-label">Registered Students</span><span className="card-value blue-text">{students.length}</span></div>
                  <div className="stat-card green"><span className="card-label">Active Subjects</span><span className="card-value green-text">{courses.length}</span></div>
                  <div className="stat-card yellow"><span className="card-label">Bulletins Live</span><span className="card-value yellow-text">{announcements.length}</span></div>
                </div>
              </div>
            )}

            {adminTab === 'students' && (
              <div className="dashboard-section">
                <h3 className="section-title">👥 Student Management Console</h3>
                <form onSubmit={handleStudentSubmit} className="portal-data-form">
                  <div className="form-group">
                    <input className="input-field" type="text" placeholder="Full Name" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} required />
                    <select className="select-field" value={studentForm.department} onChange={e => setStudentForm({...studentForm, department: e.target.value})}>
                      {departments.filter(dept => dept !== 'All').map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                    <input className="input-field" type="text" placeholder="Register Number (e.g., 065 or 65)" value={studentForm.regNumber} onChange={e => setStudentForm({...studentForm, regNumber: e.target.value})} required />
                    <input className="input-field" type="email" placeholder="Email Address" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} required />
                    <input className="input-field" type="text" placeholder="Phone String" value={studentForm.phone} onChange={e => setStudentForm({...studentForm, phone: e.target.value})} required />
                    <input className="input-field" type="text" placeholder="CGPA" value={studentForm.cgpa} onChange={e => setStudentForm({...studentForm, cgpa: e.target.value})} required />
                    <select className="select-field" value={studentForm.semester} onChange={e => setStudentForm({...studentForm, semester: e.target.value})}>
                      {['S1','S2','S3','S4','S5','S6','S7','S8'].map(sem => <option key={sem} value={sem}>{sem}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn-primary portal-form-submit">Auto-Generate & Save Student Credentials</button>
                </form>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <input className="input-field" type="text" placeholder="🔍 Search profiles instantly..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flex: 2 }}/>
                  <select className="select-field" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} style={{ flex: 1 }}>
                    {departments.map(dept => <option key={dept} value={dept}>Department: {dept}</option>)}
                  </select>
                </div>

                <table className="data-table">
                  <thead><tr><th>Generated Username / Roll ID</th><th>Name String</th><th>Contact Specs</th><th>Department</th><th>GPA</th><th>Management Actions</th></tr></thead>
                  <tbody>
                    {filteredStudents.map(s => (
                      <tr key={s.id}>
                        <td><code style={{background: '#1e293b', color: '#60a5fa', padding: '4px 8px', borderRadius: '4px'}}>{s.rollNumber}</code></td>
                        <td><b>{s.name}</b></td>
                        <td>{s.email}<br/><small style={{color:'#64748b'}}>{s.phone}</small></td>
                        <td>{s.department} (Semester {s.semester})</td>
                        <td><b>{s.cgpa}</b></td>
                        <td>
                          <button type="button" className="action-btn-edit" onClick={() => {
                            const extractedReg = s.rollNumber.replace(`TJE23${s.department}`, '');
                            setStudentForm({
                              id: s.id,
                              name: s.name,
                              department: s.department,
                              regNumber: extractedReg,
                              email: s.email,
                              phone: s.phone,
                              semester: s.semester,
                              cgpa: s.cgpa
                            });
                          }}>Modify</button>
                          <button type="button" className="action-btn-delete" style={{marginLeft:'6px'}} onClick={() => deleteStudent(s.id)}>Purge</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {adminTab === 'courses' && (
              <div className="dashboard-section">
                <h3 className="section-title">📚 Register Curricular Courses</h3>
                <form onSubmit={handleCourseSubmit} className="portal-data-form">
                  <div className="form-group">
                    <input className="input-field" type="text" placeholder="Subject Name" value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} required />
                    <input className="input-field" type="text" placeholder="Subject Code" value={courseForm.code} onChange={e => setCourseForm({...courseForm, code: e.target.value})} required />
                    <input className="input-field" type="number" placeholder="Credits Count" value={courseForm.credits} onChange={e => setCourseForm({...courseForm, credits: Number(e.target.value) || ''})} required />
                    <input className="input-field" type="text" placeholder="Assigned Faculty Name" value={courseForm.faculty} onChange={e => setCourseForm({...courseForm, faculty: e.target.value})} required />
                  </div>
                  <button type="submit" className="btn-primary">Register Subject Structure</button>
                </form>
                <table className="data-table" style={{marginTop:'20px'}}>
                  <thead><tr><th>Code</th><th>Subject Name</th><th>Credits</th><th>Assigned Instructor</th></tr></thead>
                  <tbody>
                    {courses.map(c => <tr key={c.id}><td><code>{c.code}</code></td><td><b>{c.name}</b></td><td>{c.credits} Credits</td><td>{c.faculty}</td></tr>)}
                  </tbody>
                </table>
              </div>
            )}

            {adminTab === 'attendance' && (
              <div className="portal-workspace-container">
                <div className="attendance-grid-layout">
                  <div className="attendance-card">
                    <h3 className="card-inner-title">Log Presence Registry</h3>
                    <form onSubmit={handleAttendanceSubmit} className="attendance-vertical-form">
                      <div className="field-element">
                        <label className="element-label">Select Student</label>
                        <select className="select-field" value={attendanceForm.studentId} onChange={e => setAttendanceForm({...attendanceForm, studentId: e.target.value})} required>
                          <option value="">Select profile map...</option>
                          {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
                        </select>
                      </div>
                      <div className="field-element">
                        <label className="element-label">Associated Subject</label>
                        <select className="select-field" value={attendanceForm.course} onChange={e => setAttendanceForm({...attendanceForm, course: e.target.value})}>
                          {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="field-element">
                        <label className="element-label">Presence Status Flag</label>
                        <select className="select-field" value={attendanceForm.status} onChange={e => setAttendanceForm({...attendanceForm, status: e.target.value})}>
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </div>
                      <button type="submit" className="btn-attendance-submit">Commit Log Entry</button>
                    </form>
                  </div>
                  <div className="attendance-card">
                    <h3 className="card-inner-title">System Metrics Record</h3>
                    <div className="metrics-list">
                      {students.map(s => {
                        const rate = calculateStudentAttendance(s.id);
                        return (
                          <div className="metrics-row" key={s.id}>
                            <div className="profile-bold-name">{s.name} ({s.rollNumber})</div>
                            <div className="progress-wrapper">
                              <span className={`percentage-pill ${rate >= 75 ? 'high-rate' : 'low-rate'}`}>{rate}% Metrics</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'marks' && (
              <div className="dashboard-section">
                <h3 className="section-title">🎯 Examination Ledger Desk</h3>
                <form onSubmit={handleMarksSubmit} className="portal-data-form">
                  <div className="form-group">
                    <select className="select-field" value={marksForm.studentId} onChange={e => setMarksForm({...marksForm, studentId: e.target.value})} required>
                      <option value="">Choose Student Target...</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select className="select-field" value={marksForm.course} onChange={e => setMarksForm({...marksForm, course: e.target.value})}>
                      {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <input className="input-field" type="number" placeholder="Internals (Max 20)" max="20" value={marksForm.internal} onChange={e => setMarksForm({...marksForm, internal: e.target.value})} required />
                    <input className="input-field" type="number" placeholder="Assignments (Max 10)" max="10" value={marksForm.assignment} onChange={e => setMarksForm({...marksForm, assignment: e.target.value})} required />
                    <input className="input-field" type="number" placeholder="End Exam (Max 70)" max="70" value={marksForm.exam} onChange={e => setMarksForm({...marksForm, exam: e.target.value})} required />
                  </div>
                  <button type="submit" className="btn-primary">Publish Evaluation Node</button>
                </form>
              </div>
            )}

            {adminTab === 'announcements' && (
              <div className="dashboard-section">
                <h3 className="section-title">📢 Bulletin Announcement System</h3>
                <form onSubmit={handleAnnouncementSubmit} className="portal-data-form">
                  <div className="form-group">
                    <input className="input-field" type="text" placeholder="Notice Header Title" value={announcementForm.title} onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})} required />
                    <select className="select-field" value={announcementForm.type} onChange={e => setAnnouncementForm({...announcementForm, type: e.target.value})}>
                      <option value="exam">Examination Alert</option>
                      <option value="holiday">Holiday Notification</option>
                      <option value="deadline">Assignment Deadline</option>
                    </select>
                  </div>
                  <textarea className="input-field" style={{margin:'12px 0', minHeight:'80px', fontFamily:'inherit'}} placeholder="Write explicit broadcast description notes clearly..." value={announcementForm.content} onChange={e => setAnnouncementForm({...announcementForm, content: e.target.value})} required></textarea>
                  <button type="submit" className="btn-primary">Broadcast News Bulletin</button>
                </form>
              </div>
            )}
          </div>
        )}

        {userRole === 'student' && activeStudentSession && (
          <div>
            {studentTab === 'dashboard' && (
              <div>
                <h2 className="page-title">Welcome back, {activeStudentSession.name}!</h2>
                <div className="card-grid">
                  <div className="stat-card blue"><span className="card-label">Overall Attendance Rate</span><span className="card-value blue-text">{calculateStudentAttendance(activeStudentSession.id)}%</span></div>
                  <div className="stat-card green"><span className="card-label">Cumulative GPA</span><span className="card-value green-text">{activeStudentSession.cgpa}</span></div>
                  <div className="stat-card yellow"><span className="card-label">Current Term Status</span><span className="card-value yellow-text">{activeStudentSession.semester}</span></div>
                </div>
              </div>
            )}

            {studentTab === 'profile' && (
              <div className="dashboard-section">
                <h3 className="section-title">👤 Verified Student Profile Specs</h3>
                <div style={{background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)'}}>
                  <p><b>Full Legal Name:</b> {activeStudentSession.name}</p>
                  <p><b>Academic Roll ID:</b> <code>{activeStudentSession.rollNumber}</code></p>
                  <p><b>Registered Email:</b> {activeStudentSession.email}</p>
                  <p><b>Phone Record:</b> {activeStudentSession.phone}</p>
                  <p><b>Department Focus:</b> {activeStudentSession.department}</p>
                  <p><b>Current Semester:</b> {activeStudentSession.semester}</p>
                </div>
              </div>
            )}

            {studentTab === 'courses' && (
              <div className="dashboard-section">
                <h3 className="section-title">📚 Enrolled Course Modules</h3>
                <table className="data-table">
                  <thead><tr><th>Code</th><th>Course Description Title</th><th>Credits</th><th>Instructor</th></tr></thead>
                  <tbody>
                    {courses.map(c => <tr key={c.id}><td><code>{c.code}</code></td><td><b>{c.name}</b></td><td>{c.credits} Credits</td><td>{c.faculty}</td></tr>)}
                  </tbody>
                </table>
              </div>
            )}

            {studentTab === 'attendance' && (
              <div className="dashboard-section">
                <h3 className="section-title">📅 Subject Wise Attendance Metrics</h3>
                <table className="data-table">
                  <thead><tr><th>Course Name</th><th>Presence Rate Status</th></tr></thead>
                  <tbody>
                    {courses.map(c => (
                      <tr key={c.id}>
                        <td><b>{c.name}</b></td>
                        <td><b>{calculateSubjectAttendance(activeStudentSession.id, c.name)}%</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {studentTab === 'grades' && (
              <div className="dashboard-section">
                <h3 className="section-title">📝 Published Term Grade Ledger</h3>
                <table className="data-table">
                  <thead><tr><th>Course Title</th><th>Internals</th><th>Assignments</th><th>Exam Score</th><th>Final Grade Element</th></tr></thead>
                  <tbody>
                    {marks.filter(m => m.studentId === activeStudentSession.id).map(m => (
                      <tr key={m.id}>
                        <td><b>{m.course}</b></td>
                        <td>{m.internal} / 20</td>
                        <td>{m.assignment} / 10</td>
                        <td>{m.exam} / 70</td>
                        <td><code style={{color:'#34d399', fontSize:'16px'}}>{m.totalGrade}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {studentTab === 'faculty' && (
              <div className="dashboard-section">
                <h3 className="section-title">👨‍🏫 Academic Faculty Advisory</h3>
                <table className="data-table">
                  <thead><tr><th>Faculty Member Name</th><th>Assigned Core Specialty</th></tr></thead>
                  <tbody>
                    {courses.map(c => <tr key={c.id}><td><b>{c.faculty}</b></td><td>{c.name} Frameworks</td></tr>)}
                  </tbody>
                </table>
              </div>
            )}

            {studentTab === 'announcements' && (
              <div className="dashboard-section">
                <h3 className="section-title">📢 Active Institution Notice Bulletins</h3>
                <div style={{display:'flex', flexDirection:'column', gap: '16px'}}>
                  {announcements.map(a => (
                    <div key={a.id} className={`announcement-item ${a.type}`} style={{padding:'20px', borderRadius:'8px', background:'rgba(255,255,255,0.02)', borderLeft:'4px solid #3b82f6'}}>
                      <h4 style={{margin:'0 0 6px 0', fontSize:'16px'}}>{a.title}</h4>
                      <p style={{margin:0, color:'#94a3b8', fontSize:'14px', lineHeight:'1.5'}}>{a.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;