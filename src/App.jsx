import React, { useState, useEffect } from 'react';
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

  // ==========================================
  // PERSISTENT DATA INITIALIZATION (localStorage)
  // ==========================================
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('acadexa_students');
    return saved ? JSON.parse(saved) : [];
  });

  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('acadexa_attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [marks, setMarks] = useState(() => {
    const saved = localStorage.getItem('acadexa_marks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('acadexa_courses');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "IEFT", code: "HUT300", credits: 3, faculty: "Gana Miss" },
      { id: 2, name: "CGIP", code: "CST304", credits: 4, faculty: "Sneha Miss" },
      { id: 3, name: "Compiler Design", code: "CST301", credits: 4, faculty: "Lidhi Miss" }
    ];
  });

  // Stores global classes conducted per unique course name
  const [globalClassesConducted, setGlobalClassesConducted] = useState(() => {
    const saved = localStorage.getItem('acadexa_global_conducted');
    return saved ? JSON.parse(saved) : { "IEFT": 30, "CGIP": 45, "Compiler Design": 40 };
  });

  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem('acadexa_announcements');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: "📅 Semester Exam Schedule", content: "End semester evaluations start on July 10, 2026. Clear your outstanding dues before June 30.", type: "exam" },
      { id: 2, title: "🎉 Monsoon Institutional Holiday", content: "Campus will remain completely non-operational this Friday due to heavy environmental alerts.", type: "holiday" },
      { id: 3, title: "🚀 DBMS Assignment Submission", content: "Upload your normalization database schematics before tomorrow midnight.", type: "deadline" }
    ];
  });

  // ==========================================
  // SYNC STATE TO LOCAL STORAGE ON CHANGE
  // ==========================================
  useEffect(() => {
    localStorage.setItem('acadexa_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('acadexa_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('acadexa_marks', JSON.stringify(marks));
  }, [marks]);

  useEffect(() => {
    localStorage.setItem('acadexa_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('acadexa_global_conducted', JSON.stringify(globalClassesConducted));
  }, [globalClassesConducted]);

  useEffect(() => {
    localStorage.setItem('acadexa_announcements', JSON.stringify(announcements));
  }, [announcements]);

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

  // Form for updates to global metrics values
  const [globalConductedForm, setGlobalConductedForm] = useState({
    course: 'IEFT',
    totalConducted: ''
  });
  
  const [marksForm, setMarksForm] = useState({ studentId: '', course: 'IEFT', internal: '', assignment: '', exam: '' });

  // Unified Route Identity Authentication Sequence
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    const formattedId = loginId.toUpperCase().trim();

    if (loginId === 'admin' && password === 'admin123') {
      setUserRole('admin');
      setViewMode('portal');
      return;
    }

    const prefixRules = {
      XYZ: { prefix: "TJE23", mappedDept: "All" }, 
      CSE: { prefix: "TJE23CS", mappedDept: "CS" },
      IT: { prefix: "TJE23IT", mappedDept: "IT" },
      ECE: { prefix: "TJE23EC", mappedDept: "EC" }
    };

    const rules = prefixRules[activeDeptHome] || prefixRules.XYZ;

    if (!formattedId.startsWith(rules.prefix)) {
      setAuthError(`❌ Access denied. You selected ${activeDeptHome} Department. Credentials must start with "${rules.prefix}"`);
      return;
    }

    const authenticatedStudent = students.find(s => {
      const matchId = s.rollNumber.toUpperCase() === formattedId;
      const matchPass = s.password === password;
      const matchDept = rules.mappedDept === "All" ? true : s.department.toUpperCase() === rules.mappedDept;
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
    if (!globalClassesConducted[courseForm.name]) {
      setGlobalClassesConducted(prev => ({ ...prev, [courseForm.name]: 30 }));
    }
    setCourseForm({ name: '', code: '', credits: '', faculty: '' });
  };

  const handleGlobalConductedSubmit = (e) => {
    e.preventDefault();
    const val = Number(globalConductedForm.totalConducted);
    if (val <= 0) return;
    
    setGlobalClassesConducted(prev => ({
      ...prev,
      [globalConductedForm.course]: val
    }));
    alert(`✅ Global baseline classes for ${globalConductedForm.course} changed to ${val}!`);
    setGlobalConductedForm({ course: 'IEFT', totalConducted: '' });
  };

  // INLINE EXCEL SHEET UPDATE HANDLER FUNCTION
  const handleExcelCellChange = (studentId, courseName, enteredValue) => {
    const attendedCount = Number(enteredValue);
    const maximumCap = globalClassesConducted[courseName] || 0;

    if (attendedCount > maximumCap) {
      alert(`⚠️ Action Blocked: Values cannot cross the maximum baseline value (${maximumCap}) configured for ${courseName}.`);
      return;
    }

    setAttendance(prev => {
      const matchIndex = prev.findIndex(item => item.studentId === studentId && item.course === courseName);
      
      if (matchIndex !== -1) {
        const revisedArray = [...prev];
        revisedArray[matchIndex] = { ...revisedArray[matchIndex], attendedClasses: attendedCount };
        return revisedArray;
      } else {
        return [...prev, { id: Date.now() + Math.random(), studentId, course: courseName, attendedClasses: attendedCount }];
      }
    });
  };

  // EXAMINATION DATA SUBMISSION HANDLER
  const handleMarksSubmit = (e) => {
    e.preventDefault();
    
    const internalVal = Number(marksForm.internal);
    const assignmentVal = Number(marksForm.assignment);
    const examVal = Number(marksForm.exam);

    if (internalVal > 50 || assignmentVal > 10 || examVal > 40) {
      alert("⚠️ Action Blocked: Scores exceed permissible thresholds! (Max limits: Internals 50, Assignment 10, End Sem 40)");
      return;
    }

    const recordPayload = {
      id: Date.now(),
      studentId: Number(marksForm.studentId) || marksForm.studentId,
      course: marksForm.course,
      internal: internalVal,
      assignment: assignmentVal,
      exam: examVal,
      total: internalVal + assignmentVal + examVal
    };

    setMarks(prev => {
      const matchIndex = prev.findIndex(item => item.studentId === recordPayload.studentId && item.course === recordPayload.course);
      if (matchIndex !== -1) {
        const revisedArray = [...prev];
        revisedArray[matchIndex] = recordPayload;
        return revisedArray;
      }
      return [...prev, recordPayload];
    });

    alert("🎯 Evaluation marks saved into profile database matrix!");
    setMarksForm({ studentId: '', course: 'IEFT', internal: '', assignment: '', exam: '' });
  };

  const calculateStudentAttendance = (studentId) => {
    const studentLogs = attendance.filter(a => a.studentId === studentId);
    if (!studentLogs.length) return 0;
    
    let totalConductedAccumulator = 0;
    let totalAttendedAccumulator = 0;

    studentLogs.forEach(log => {
      const globalConducted = globalClassesConducted[log.course] || 0;
      totalConductedAccumulator += globalConducted;
      totalAttendedAccumulator += log.attendedClasses;
    });
    
    if (totalConductedAccumulator === 0) return 0;
    return Math.round((totalAttendedAccumulator / totalConductedAccumulator) * 100);
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
      CSE: { fullName: "Computer Science & Engineering", icon: "💻", subjects: ["DBMS", "Computer Graphics", "Compiler Design", "Data Structures"] },
      IT: { fullName: "Information Technology", icon: "🌐", subjects: ["Web Technology", "Cloud Computing", "Information Security", "Software Engineering"] },
      ECE: { fullName: "Electronics & Communication", icon: "📡", subjects: ["Digital Signal Processing", "Microprocessors", "Embedded Systems", "VLSI Design"] }
    };

    const targetCode = departmentConfigs.IdRuleMapping[activeDeptHome] || "CS";
    const filteredStudentsHome = students.filter(student => student.department && student.department.toUpperCase() === targetCode.toUpperCase());

    return (
      <div className="home-page-wrapper">
        <header className="home-top-navbar">
          <div className="home-portal-logo"><span className="portal-logo-icon">🎓</span> Acadexa Portal</div>
          <button className="btn-portal-login" onClick={() => { setAuthError(''); setViewMode('login'); }}>Log in as {activeDeptHome} Member →</button>
        </header>
        <div className="home-hero-container">
          <h1 className="home-main-title">Academic Management System</h1>
          <p className="home-sub-text">A unified platform for managing academic records, departments, and course tracks.</p>
        </div>
        <div className="home-tabs-row">
          {['CSE', 'IT', 'ECE'].map((deptKey) => (
            <button key={deptKey} className={`home-tab-card ${activeDeptHome === deptKey ? 'active' : ''}`} onClick={() => setActiveDeptHome(deptKey)}>
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
            <div className="home-subjects-stack">
              {departmentConfigs[activeDeptHome]?.subjects.map((subject, index) => (
                <div key={index} className="home-subject-item"><span className="subject-bullet">🔹</span> {subject}</div>
              ))}
            </div>
          </div>
          <div className="home-display-panel">
            <h3 className="panel-header-title">👥 Registered Students Roster ({filteredStudentsHome.length})</h3>
            {filteredStudentsHome.length === 0 ? <div className="home-empty-alert">No records logged.</div> : (
              <div className="home-table-container">
                <table className="home-portal-table">
                  <thead><tr><th>Roll Number</th><th>Student Name</th><th>Department</th></tr></thead>
                  <tbody>
                    {filteredStudentsHome.map((student) => (
                      <tr key={student.id}><td className="home-td-mono">{student.rollNumber}</td><td className="home-td-bold">{student.name}</td><td><span className={`home-badge-pill ${student.department.toLowerCase()}`}>{student.department.toUpperCase()}</span></td></tr>
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
    return (
      <div className="login-page-bg">
        <div className="modern-login-card">
          <div className="modern-login-logo">🔒</div>
          <h2 className="modern-login-title">{activeDeptHome} Member Portal</h2>
          {authError && <div className="modern-alert-error">{authError}</div>}
          <form onSubmit={handleLoginSubmit} className="modern-login-form">
            <input className="modern-input-field" type="text" placeholder="Unique ID or Administrative ID" value={loginId} onChange={e => setLoginId(e.target.value)} required />
            <input className="modern-input-field" type="password" placeholder="Account Security Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" className="modern-btn-submit">Authenticate</button>
          </form>
          <button className="modern-btn-back" style={{ marginTop: '24px' }} onClick={() => setViewMode('home')}>← Switch Department</button>
        </div>
      </div>
    );
  } 

  // ==========================================
  // VIEW INTERFACE 3: PORTAL WORKSPACE
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
          </>
        ) : (
          <>
            <div className="brand">🎓 Student Portal</div>
            <button className={`nav-button ${studentTab === 'dashboard' ? 'active' : ''}`} onClick={() => setStudentTab('dashboard')}>🏠 Dashboard</button>
            <button className={`nav-button ${studentTab === 'profile' ? 'active' : ''}`} onClick={() => setStudentTab('profile')}>👤 My Profile</button>
            <button className={`nav-button ${studentTab === 'courses' ? 'active' : ''}`} onClick={() => setStudentTab('courses')}>📚 My Courses</button>
            <button className={`nav-button ${studentTab === 'attendance' ? 'active' : ''}`} onClick={() => setStudentTab('attendance')}>📅 Attendance</button>
            <button className={`nav-button ${studentTab === 'grades' ? 'active' : ''}`} onClick={() => setStudentTab('grades')}>📝 Grades / Marks</button>
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
                    <input className="input-field" type="text" placeholder="Register Number" value={studentForm.regNumber} onChange={e => setStudentForm({...studentForm, regNumber: e.target.value})} required />
                    <input className="input-field" type="email" placeholder="Email Address" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} required />
                    <input className="input-field" type="text" placeholder="Phone String" value={studentForm.phone} onChange={e => setStudentForm({...studentForm, phone: e.target.value})} required />
                    <input className="input-field" type="text" placeholder="CGPA" value={studentForm.cgpa} onChange={e => setStudentForm({...studentForm, cgpa: e.target.value})} required />
                    <select className="select-field" value={studentForm.semester} onChange={e => setStudentForm({...studentForm, semester: e.target.value})}>
                      {['S1','S2','S3','S4','S5','S6','S7','S8'].map(sem => <option key={sem} value={sem}>{sem}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn-primary">Save Student Credentials</button>
                </form>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <input className="input-field" type="text" placeholder="🔍 Search profiles instantly..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flex: 2 }}/>
                  <select className="select-field" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} style={{ flex: 1 }}>
                    {departments.map(dept => <option key={dept} value={dept}>Department: {dept}</option>)}
                  </select>
                </div>

                <table className="data-table">
                  <thead><tr><th>Username / Roll ID</th><th>Name String</th><th>Department</th><th>GPA</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredStudents.map(s => (
                      <tr key={s.id}>
                        <td><code>{s.rollNumber}</code></td>
                        <td><b>{s.name}</b></td>
                        <td>{s.department} (Semester {s.semester})</td>
                        <td><b>{s.cgpa}</b></td>
                        <td><button type="button" className="action-btn-delete" onClick={() => deleteStudent(s.id)}>Purge</button></td>
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
                  <thead><tr><th>Code</th><th>Subject Name</th><th>Official Department Conducted Classes Baseline</th><th>Assigned Instructor</th></tr></thead>
                  <tbody>
                    {courses.map(c => (
                      <tr key={c.id}>
                        <td><code>{c.code}</code></td>
                        <td><b>{c.name}</b></td>
                        <td><mark style={{background:'#fef08a', padding:'2px 6px', borderRadius:'4px', fontWeight:'bold'}}>{globalClassesConducted[c.name] || 0} Sessions</mark></td>
                        <td>{c.faculty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {adminTab === 'attendance' && (
              <div style={{ maxWidth: '100%', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '14px 20px', borderRadius: '8px', marginBottom: '20px' }}>
                  <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>📊 Live Spreadsheet Matrix Editor</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>Filter Scope:</span>
                    <select value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: '#fff', fontSize: '13px', fontWeight: 'bold' }}>
                      {departments.map(dept => <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : `${dept} Department`}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid #2563eb', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '13px', fontWeight: '700' }}>⚙️ Step 1: Establish Official Total Classes Conducted (Universal Baseline Limit)</h4>
                  <form onSubmit={handleGlobalConductedSubmit} style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ width: '200px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>Subject Course</label>
                      <select value={globalConductedForm.course} onChange={e => setGlobalConductedForm({ ...globalConductedForm, course: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff' }}>
                        {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div style={{ width: '180px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>Total Conducted Classes</label>
                      <input type="number" min="1" placeholder="e.g. 45" value={globalConductedForm.totalConducted} onChange={e => setGlobalConductedForm({ ...globalConductedForm, totalConducted: e.target.value })} style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                    </div>
                    <button type="submit" style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>Apply Baseline</button>
                  </form>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '13px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9' }}>
                          <th style={{ border: '1px solid #cbd5e1', padding: '10px 14px', position: 'sticky', left: 0, backgroundColor: '#f1f5f9', zIndex: 2, fontWeight: '700', color: '#334155', minWidth: '160px' }}>Student Name</th>
                          <th style={{ border: '1px solid #cbd5e1', padding: '10px 14px', fontWeight: '700', color: '#334155' }}>Roll Identifier</th>
                          <th style={{ border: '1px solid #cbd5e1', padding: '10px 14px', fontWeight: '700', color: '#334155' }}>Dept</th>
                          
                          {courses.map(c => {
                            const currentMax = globalClassesConducted[c.name] || 0;
                            return (
                              <th key={c.id} style={{ border: '1px solid #cbd5e1', padding: '10px 14px', textAlign: 'center', fontWeight: '700', color: '#334155', minWidth: '130px' }}>
                                <div>📘 {c.name}</div>
                                <div style={{ fontSize: '10px', fontWeight: 'normal', color: '#64748b', marginTop: '2px' }}>Total Baseline: <b>{currentMax}</b></div>
                              </th>
                            );
                          })}
                          <th style={{ border: '1px solid #cbd5e1', padding: '10px 14px', textAlign: 'center', background: '#e2e8f0', fontWeight: '700', color: '#334155', width: '100px' }}>Total Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={4 + courses.length} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontStyle: 'italic' }}>
                              No student profiles registered under this filter category.
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((s, index) => {
                            const overallPercentage = calculateStudentAttendance(s.id);
                            
                            return (
                              <tr key={s.id} style={{ background: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                <td style={{ border: '1px solid #cbd5e1', padding: '10px 14px', position: 'sticky', left: 0, backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc', fontWeight: '600', color: '#0f172a' }}>
                                  {s.name}
                                </td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '10px 14px' }}><code>{s.rollNumber}</code></td>
                                <td style={{ border: '1px solid #cbd5e1', padding: '10px 14px', fontWeight: 'bold', color: '#475569' }}>{s.department}</td>
                                
                                {courses.map(c => {
                                  const matchesRecord = attendance.find(a => a.studentId === s.id && a.course === c.name);
                                  const attendedValue = matchesRecord ? matchesRecord.attendedClasses : 0;
                                  const baselineLimit = globalClassesConducted[c.name] || 0;

                                  return (
                                    <td key={c.id} style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>
                                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        <input 
                                          type="number" 
                                          min="0" 
                                          max={baselineLimit}
                                          value={attendedValue}
                                          style={{ width: '55px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', fontFamily: 'monospace', fontSize: '13px' }}
                                          onChange={(e) => handleExcelCellChange(s.id, c.name, e.target.value)}
                                        />
                                        <span style={{ color: '#94a3b8', fontSize: '11px' }}>/ {baselineLimit}</span>
                                      </div>
                                    </td>
                                  );
                                })}

                                <td style={{ border: '1px solid #cbd5e1', padding: '10px 14px', textAlign: 'center' }}>
                                  <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', background: overallPercentage >= 75 ? '#dcfce7' : '#fee2e2', color: overallPercentage >= 75 ? '#15803d' : '#b91c1c' }}>
                                    {overallPercentage}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'marks' && (
              <div className="dashboard-section">
                <h3 className="section-title">🎯 Examination Record Entry Desk</h3>
                
                {/* Dynamic Marksheet Submission Form */}
                <form onSubmit={handleMarksSubmit} className="portal-data-form" style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>Select Target Student Profile</label>
                      <select className="select-field" style={{ width: '100%' }} value={marksForm.studentId} onChange={e => setMarksForm({...marksForm, studentId: e.target.value})} required>
                        <option value="">Select Profile...</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>Subject Course Module</label>
                      <select className="select-field" style={{ width: '100%' }} value={marksForm.course} onChange={e => setMarksForm({...marksForm, course: e.target.value})}>
                        {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>Internal Score (Max 50)</label>
                      <input className="input-field" style={{ width: '100%' }} type="number" min="0" max="50" placeholder="e.g. 42" value={marksForm.internal} onChange={e => setMarksForm({...marksForm, internal: e.target.value})} required />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>Assignment (Max 10)</label>
                      <input className="input-field" style={{ width: '100%' }} type="number" min="0" max="10" placeholder="e.g. 9" value={marksForm.assignment} onChange={e => setMarksForm({...marksForm, assignment: e.target.value})} required />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>End Sem Marks (Max 40)</label>
                      <input className="input-field" style={{ width: '100%' }} type="number" min="0" max="40" placeholder="e.g. 35" value={marksForm.exam} onChange={e => setMarksForm({...marksForm, exam: e.target.value})} required />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ cursor: 'pointer' }}>Register Grade Report</button>
                </form>

                {/* Live Grade Ledger Summary Table */}
                <h4 style={{ margin: '24px 0 12px 0', color: '#334155' }}>📋 Grade Ledger Book Registry</h4>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student Identity</th>
                      <th>Subject Course</th>
                      <th>Internal (50)</th>
                      <th>Assignment (10)</th>
                      <th>Exam (40)</th>
                      <th>Aggregate Grade Score (100)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontStyle: 'italic' }}>
                          No evaluations or marksheets logged inside application database storage yet.
                        </td>
                      </tr>
                    ) : (
                      marks.map(m => {
                        const correspondingStudent = students.find(s => s.id === Number(m.studentId) || s.id === m.studentId);
                        return (
                          <tr key={m.id}>
                            <td>
                              <strong>{correspondingStudent ? correspondingStudent.name : 'Unknown Profile'}</strong>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{correspondingStudent?.rollNumber}</div>
                            </td>
                            <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{m.course}</code></td>
                            <td>{m.internal}</td>
                            <td>{m.assignment}</td>
                            <td>{m.exam}</td>
                            <td>
                              <span style={{ fontWeight: 'bold', color: m.total >= 40 ? '#16a34a' : '#dc2626' }}>
                                {m.total} / 100
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;