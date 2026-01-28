// Admin state
let isAdminLoggedIn = false;
let adminCredentials = {
    username: atob('YWRtaW4='),
    password: atob('YWRtaW4xMjM=') 
};

// Load admin credentials from localStorage
function loadAdminCredentials() {
    const saved = localStorage.getItem('adminCredentials');
    if (saved) {
        adminCredentials = JSON.parse(saved);
    }
}

// Save admin credentials
function saveAdminCredentials() {
    localStorage.setItem('adminCredentials', JSON.stringify(adminCredentials));
}

// Faculty data
let faculty = [
    { id: 1, name: "MARIBEL SANDAGON", designation: "OIC" },
    { id: 2, name: "VAL PATRICK FABREGAS", designation: "FACULTY" },
    { id: 3, name: "ROBERTO MALITAO", designation: "FACULTY" },
    { id: 4, name: "HOMER FAVENIR", designation: "FACULTY" },
    { id: 5, name: "FE ANTONIO", designation: "FACULTY" },
    { id: 6, name: "MARCO ANTONIO SUBION", designation: "FACULTY" },
    { id: 7, name: "LUVIM EUSEBIO", designation: "FACULTY" },
    { id: 8, name: "ROLANDO QUIRONG", designation: "FACULTY" },
    { id: 9, name: "ARNOLD GALVE", designation: "FACULTY" },
    { id: 10, name: "EDWARD CRUZ", designation: "FACULTY" }
];

let selectedTeacher = null;
let attendanceRecords = [];
let confirmResolve = null;
let selectedFacultyId = null;
let currentTimePickerType = null; // 'in' or 'out'

// Initialize time picker dropdowns
function initTimePicker() {
    // Populate minutes and seconds (00-59)
    const minuteSelect = document.getElementById('minuteSelect');
    const secondSelect = document.getElementById('secondSelect');
    
    for (let i = 0; i < 60; i++) {
        const value = i.toString().padStart(2, '0');
        
        const minuteOption = document.createElement('option');
        minuteOption.value = value;
        minuteOption.textContent = value;
        minuteSelect.appendChild(minuteOption);
        
        const secondOption = document.createElement('option');
        secondOption.value = value;
        secondOption.textContent = value;
        secondSelect.appendChild(secondOption);
    }
}

// Load faculty from localStorage
function loadFaculty() {
    const saved = localStorage.getItem('facultyList');
    if (saved) {
        faculty = JSON.parse(saved);
    }
}

// Save faculty to localStorage
function saveFacultyList() {
    localStorage.setItem('facultyList', JSON.stringify(faculty));
}

// Load saved records from localStorage
function loadRecords() {
    const saved = localStorage.getItem('attendanceRecords_' + getTodayDate());
    if (saved) {
        attendanceRecords = JSON.parse(saved);
    }
}

// Save records to localStorage
function saveRecords() {
    const today = getTodayDate();
    localStorage.setItem('attendanceRecords_' + today, JSON.stringify(attendanceRecords));
    
    // Also save to database (historical records)
    saveToDatabase(today, attendanceRecords);
}

// Save to database (localStorage-based historical archive)
function saveToDatabase(date, records) {
    let database = localStorage.getItem('attendanceDatabase');
    if (!database) {
        database = {};
    } else {
        database = JSON.parse(database);
    }
    
    database[date] = {
        date: date,
        records: records,
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('attendanceDatabase', JSON.stringify(database));
}

// Get all database records
function getAllDatabaseRecords() {
    const database = localStorage.getItem('attendanceDatabase');
    return database ? JSON.parse(database) : {};
}

// Get records for specific date from database
function getRecordsFromDatabase(date) {
    const database = getAllDatabaseRecords();
    return database[date] || null;
}

// Get today's date in YYYY-MM-DD format
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Format time to 12-hour format
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
    });
}

// Initialize the page
function init() {
    loadAdminCredentials();
    loadFaculty();
    loadRecords();
    displayDate();
    renderTeacherGrid();
    updateAttendanceTable();
    initTimePicker();
}

// Open time picker
function openTimePicker(type) {
    currentTimePickerType = type;
    const title = type === 'in' ? 'Set Time In' : 'Set Time Out';
    document.getElementById('timePickerTitle').textContent = title;
    
    // Get current time or set to now
    const currentTime = type === 'in' 
        ? document.getElementById('editTimeIn').value 
        : document.getElementById('editTimeOut').value;
    
    if (currentTime) {
        // Parse existing time
        const match = currentTime.match(/^(\d{1,2}):(\d{2}):(\d{2}) (AM|PM)$/);
        if (match) {
            document.getElementById('hourSelect').value = match[1].padStart(2, '0');
            document.getElementById('minuteSelect').value = match[2];
            document.getElementById('secondSelect').value = match[3];
            document.getElementById('periodSelect').value = match[4];
        }
    } else {
        // Set to current time
        const now = new Date();
        let hours = now.getHours();
        const period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        
        document.getElementById('hourSelect').value = hours.toString().padStart(2, '0');
        document.getElementById('minuteSelect').value = now.getMinutes().toString().padStart(2, '0');
        document.getElementById('secondSelect').value = now.getSeconds().toString().padStart(2, '0');
        document.getElementById('periodSelect').value = period;
    }
    
    document.getElementById('timePickerModal').style.display = 'block';
}

// Close time picker
function closeTimePicker() {
    document.getElementById('timePickerModal').style.display = 'none';
    currentTimePickerType = null;
}

// Set time from picker
function setTime() {
    const hour = document.getElementById('hourSelect').value;
    const minute = document.getElementById('minuteSelect').value;
    const second = document.getElementById('secondSelect').value;
    const period = document.getElementById('periodSelect').value;
    
    const timeString = `${hour}:${minute}:${second} ${period}`;
    
    if (currentTimePickerType === 'in') {
        document.getElementById('editTimeIn').value = timeString;
        document.getElementById('displayTimeIn').textContent = timeString;
    } else {
        document.getElementById('editTimeOut').value = timeString;
        document.getElementById('displayTimeOut').textContent = timeString;
    }
    
    closeTimePicker();
}

// Clear time
function clearTime() {
    if (currentTimePickerType === 'in') {
        document.getElementById('editTimeIn').value = '';
        document.getElementById('displayTimeIn').textContent = 'Not set';
    } else {
        document.getElementById('editTimeOut').value = '';
        document.getElementById('displayTimeOut').textContent = 'Not set';
    }
    closeTimePicker();
}

// Show login modal
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Modern confirmation modal
function showConfirmModal(title, data, isTimeOut = false) {
    return new Promise((resolve) => {
        confirmResolve = resolve;
        
        document.getElementById('confirmTitle').textContent = title;
        
        let bodyHTML = '';
        for (let key in data) {
            bodyHTML += `
                <div class="confirm-info-row">
                    <span class="confirm-info-label">${key}:</span>
                    <span class="confirm-info-value">${data[key]}</span>
                </div>
            `;
        }
        
        document.getElementById('confirmBody').innerHTML = bodyHTML;
        
        const confirmBtn = document.getElementById('confirmButton');
        confirmBtn.className = isTimeOut ? 'confirm-btn confirm-btn-timeout' : 'confirm-btn confirm-btn-confirm';
        confirmBtn.textContent = isTimeOut ? 'Time Out' : 'Time In';
        
        document.getElementById('confirmModal').style.display = 'block';
    });
}

function closeConfirmModal(result) {
    document.getElementById('confirmModal').style.display = 'none';
    if (confirmResolve) {
        confirmResolve(result);
        confirmResolve = null;
    }
}

// Admin login
function adminLogin(event) {
    event.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    if (username === adminCredentials.username && password === adminCredentials.password) {
        isAdminLoggedIn = true;
        closeModal('loginModal');
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('adminBtn').textContent = '✓ Admin Mode';
        document.getElementById('adminBtn').style.background = '#28a745';
        document.getElementById('adminLogoutBtn').style.display = 'block';
        showAlert('Admin login successful!', 'success');
        updateAdminPanels();
    } else {
        showAlert('Invalid username or password!', 'warning');
    }
    return false;
}

// Admin logout
function adminLogout() {
    if (!confirm('Are you sure you want to logout from admin panel?')) return;
    
    isAdminLoggedIn = false;
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminBtn').textContent = '🔐 Admin Login';
    document.getElementById('adminBtn').style.background = '#343a40';
    document.getElementById('adminLogoutBtn').style.display = 'none';
    showAlert('Logged out successfully!', 'success');
}

// Show admin tab
function showAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('admin' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
    updateAdminPanels();
}

// Update admin panels
function updateAdminPanels() {
    updateAdminAttendanceList();
    updateAdminFacultyList();
}

// Update admin attendance list
function updateAdminAttendanceList() {
    const container = document.getElementById('adminAttendanceList');
    container.innerHTML = '';

    if (attendanceRecords.length === 0) {
        container.innerHTML = '<p>No attendance records for today.</p>';
        return;
    }

    attendanceRecords.forEach(record => {
        const div = document.createElement('div');
        div.className = 'faculty-item';
        div.innerHTML = `
            <div class="faculty-info">
                <strong>${record.name}</strong> (${record.designation})<br>
                <small>Time In: ${record.timeIn || 'N/A'} | Time Out: ${record.timeOut || 'N/A'}</small>
            </div>
            <div class="faculty-actions">
                <button class="btn-edit" onclick="editAttendance(${record.id})">Edit</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// Edit attendance
function editAttendance(id) {
    const record = attendanceRecords.find(r => r.id === id);
    if (!record) return;

    document.getElementById('editAttendanceId').value = id;
    
    // Populate faculty dropdown
    const nameSelect = document.getElementById('editAttendanceName');
    nameSelect.innerHTML = '<option value="">-- Select Faculty Member --</option>';
    faculty.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = `${member.name} (${member.designation})`;
        if (member.id === record.id) {
            option.selected = true;
        }
        nameSelect.appendChild(option);
    });
    
    // Set time values
    document.getElementById('editTimeIn').value = record.timeIn || '';
    document.getElementById('editTimeOut').value = record.timeOut || '';
    
    // Update display
    document.getElementById('displayTimeIn').textContent = record.timeIn || 'Not set';
    document.getElementById('displayTimeOut').textContent = record.timeOut || 'Not set';
    
    document.getElementById('editAttendanceModal').style.display = 'block';
}

// Save attendance
function saveAttendance(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById('editAttendanceId').value);
    const newFacultyId = parseInt(document.getElementById('editAttendanceName').value);
    const timeIn = document.getElementById('editTimeIn').value.trim();
    const timeOut = document.getElementById('editTimeOut').value.trim();

    if (!newFacultyId) {
        showAlert('Please select a faculty member!', 'warning');
        return false;
    }

    const index = attendanceRecords.findIndex(r => r.id === id);
    if (index >= 0) {
        // If faculty changed, update the record with new faculty info
        if (newFacultyId !== id) {
            const newFaculty = faculty.find(f => f.id === newFacultyId);
            if (!newFaculty) {
                showAlert('Selected faculty not found!', 'warning');
                return false;
            }
            
            // Check if new faculty already has a record
            const existingRecord = attendanceRecords.find(r => r.id === newFacultyId);
            if (existingRecord) {
                showAlert('The selected faculty already has an attendance record today!', 'warning');
                return false;
            }
            
            // Transfer to new faculty
            attendanceRecords[index].id = newFacultyId;
            attendanceRecords[index].name = newFaculty.name;
            attendanceRecords[index].designation = newFaculty.designation;
        }
        
        attendanceRecords[index].timeIn = timeIn;
        attendanceRecords[index].timeOut = timeOut;
        
        saveRecords();
        updateAttendanceTable();
        updateAdminAttendanceList();
        closeModal('editAttendanceModal');
        showAlert('Attendance updated successfully!', 'success');
    }
    return false;
}

// Update admin faculty list (dropdown)
function updateAdminFacultyList() {
    const selector = document.getElementById('facultySelector');
    selector.innerHTML = '<option value="">-- Select a Faculty Member --</option>';

    faculty.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = `${member.name} (${member.designation})`;
        selector.appendChild(option);
    });
    
    // Hide selected faculty info
    document.getElementById('selectedFacultyInfo').style.display = 'none';
    selectedFacultyId = null;
}

// Select faculty from dropdown
function selectFacultyFromDropdown() {
    const selector = document.getElementById('facultySelector');
    const id = parseInt(selector.value);
    
    if (!id) {
        document.getElementById('selectedFacultyInfo').style.display = 'none';
        selectedFacultyId = null;
        return;
    }
    
    const member = faculty.find(f => f.id === id);
    if (!member) return;
    
    selectedFacultyId = id;
    document.getElementById('selectedFacultyDetails').innerHTML = `
        <strong>${member.name}</strong><br>
        <small>${member.designation}</small>
    `;
    document.getElementById('selectedFacultyInfo').style.display = 'block';
}

// Edit selected faculty
function editSelectedFaculty() {
    if (!selectedFacultyId) return;
    editFacultyMember(selectedFacultyId);
}

// Delete selected faculty
function deleteSelectedFaculty() {
    if (!selectedFacultyId) return;
    deleteFacultyMember(selectedFacultyId);
}

// Add new faculty
function addNewFaculty() {
    document.getElementById('editFacultyId').value = '';
    document.getElementById('editFacultyName').value = '';
    document.getElementById('editFacultyDesignation').value = 'FACULTY';
    document.getElementById('editFacultyModal').style.display = 'block';
}

// Edit faculty member
function editFacultyMember(id) {
    const member = faculty.find(f => f.id === id);
    if (!member) return;

    document.getElementById('editFacultyId').value = id;
    document.getElementById('editFacultyName').value = member.name;
    document.getElementById('editFacultyDesignation').value = member.designation;
    document.getElementById('editFacultyModal').style.display = 'block';
}

// Save faculty
function saveFacultyMember(event) {
    event.preventDefault();
    const id = document.getElementById('editFacultyId').value;
    const name = document.getElementById('editFacultyName').value.toUpperCase();
    const designation = document.getElementById('editFacultyDesignation').value;

    if (id) {
        // Edit existing
        const index = faculty.findIndex(f => f.id === parseInt(id));
        if (index >= 0) {
            faculty[index].name = name;
            faculty[index].designation = designation;
        }
    } else {
        // Add new
        const newId = faculty.length > 0 ? Math.max(...faculty.map(f => f.id)) + 1 : 1;
        faculty.push({ id: newId, name, designation });
    }

    saveFacultyList();
    renderTeacherGrid();
    updateAdminFacultyList();
    closeModal('editFacultyModal');
    showAlert(id ? 'Faculty updated!' : 'Faculty added!', 'success');
    return false;
}

// Delete faculty member
function deleteFacultyMember(id) {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;

    faculty = faculty.filter(f => f.id !== id);
    saveFacultyList();
    renderTeacherGrid();
    updateAdminFacultyList();
    showAlert('Faculty deleted!', 'success');
}

// Change admin credentials
function changeAdminCredentials(event) {
    event.preventDefault();
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showAlert('Passwords do not match!', 'warning');
        return false;
    }

    adminCredentials.username = newUsername;
    adminCredentials.password = newPassword;
    saveAdminCredentials();

    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';

    showAlert('Admin credentials updated successfully!', 'success');
    return false;
}

// Display current date
function displayDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('dateDisplay').textContent = today.toLocaleDateString('en-US', options);
}

// Render teacher selection grid
function renderTeacherGrid() {
    const grid = document.getElementById('teacherGrid');
    grid.innerHTML = '';

    faculty.forEach(teacher => {
        const btn = document.createElement('div');
        btn.className = 'teacher-btn';
        btn.onclick = () => selectTeacher(teacher);
        btn.innerHTML = `
            <div class="teacher-name">${teacher.name}</div>
            <div class="teacher-designation">${teacher.designation}</div>
        `;
        grid.appendChild(btn);
    });
}

// Select a teacher
function selectTeacher(teacher) {
    selectedTeacher = teacher;
    
    // Update UI
    document.querySelectorAll('.teacher-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.closest('.teacher-btn').classList.add('selected');

    // Check if teacher already has records today
    const existingRecord = attendanceRecords.find(r => r.id === teacher.id);
    
    document.getElementById('timeInBtn').disabled = existingRecord && existingRecord.timeIn;
    document.getElementById('timeOutBtn').disabled = !existingRecord || !existingRecord.timeIn || existingRecord.timeOut;

    showAlert(`Selected: ${teacher.name}`, 'success');
}

// Time In
async function timeIn() {
    if (!selectedTeacher) {
        showAlert('Please select a teacher first!', 'warning');
        return;
    }

    const now = new Date();
    const timeStr = formatTime(now);
    const existingIndex = attendanceRecords.findIndex(r => r.id === selectedTeacher.id);

    if (existingIndex >= 0) {
        showAlert('This teacher already timed in today!', 'warning');
        return;
    }

    // Modern confirmation dialog
    const confirmed = await showConfirmModal('⏰ Confirm Time In', {
        'Name': selectedTeacher.name,
        'Designation': selectedTeacher.designation,
        'Time': timeStr
    }, false);

    if (!confirmed) return;

    attendanceRecords.push({
        id: selectedTeacher.id,
        name: selectedTeacher.name,
        designation: selectedTeacher.designation,
        timeIn: timeStr,
        timeOut: null
    });

    saveRecords();
    updateAttendanceTable();
    
    document.getElementById('timeInBtn').disabled = true;
    document.getElementById('timeOutBtn').disabled = false;

    showAlert(`✅ ${selectedTeacher.name} timed in at ${timeStr}`, 'success');
}

// Time Out
async function timeOut() {
    if (!selectedTeacher) {
        showAlert('Please select a teacher first!', 'warning');
        return;
    }

    const now = new Date();
    const timeStr = formatTime(now);
    const existingIndex = attendanceRecords.findIndex(r => r.id === selectedTeacher.id);

    if (existingIndex < 0) {
        showAlert('This teacher has not timed in yet!', 'warning');
        return;
    }

    if (attendanceRecords[existingIndex].timeOut) {
        showAlert('This teacher already timed out today!', 'warning');
        return;
    }

    // Modern confirmation dialog
    const confirmed = await showConfirmModal('🏁 Confirm Time Out', {
        'Name': selectedTeacher.name,
        'Designation': selectedTeacher.designation,
        'Time In': attendanceRecords[existingIndex].timeIn,
        'Time Out': timeStr
    }, true);

    if (!confirmed) return;

    attendanceRecords[existingIndex].timeOut = timeStr;

    saveRecords();
    updateAttendanceTable();
    
    document.getElementById('timeOutBtn').disabled = true;

    showAlert(`✅ ${selectedTeacher.name} timed out at ${timeStr}`, 'success');
}

// Update attendance table
function updateAttendanceTable() {
    const tbody = document.getElementById('attendanceBody');
    tbody.innerHTML = '';

    if (attendanceRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px; color: #999;">No attendance records yet. Select a teacher and click Time In to start.</td></tr>';
        return;
    }

    attendanceRecords.forEach((record, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${record.name}</strong></td>
            <td>${record.designation}</td>
            <td>${record.timeIn ? `<span class="time-badge time-in-badge">${record.timeIn}</span>` : '-'}</td>
            <td>${record.timeOut ? `<span class="time-badge time-out-badge">${record.timeOut}</span>` : '-'}</td>
            <td class="${record.timeOut ? 'status-done' : 'status-active'}">
                ${record.timeOut ? '✓ Completed' : '⏱️ Active'}
            </td>
        `;
    });
}

// Show alert message
function showAlert(message, type, clearPrevious = false) {
    const container = document.getElementById('alertContainer');
    
    // Clear previous alerts if requested (useful for selection messages)
    if (clearPrevious || message.startsWith('Selected:')) {
        const existingAlerts = container.querySelectorAll('.alert');
        existingAlerts.forEach(alert => {
            if (alert.textContent.startsWith('Selected:')) {
                alert.remove();
            }
        });
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    container.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Clear all records
function clearAllRecords() {
    if (confirm('Are you sure you want to clear all attendance records for today? This cannot be undone!')) {
        attendanceRecords = [];
        saveRecords();
        updateAttendanceTable();
        selectedTeacher = null;
        document.querySelectorAll('.teacher-btn').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('timeInBtn').disabled = true;
        document.getElementById('timeOutBtn').disabled = true;
        showAlert('All records cleared!', 'success');
    }
}

// Print document
function printDocument() {
    // Update print section with current data
    updatePrintSection();
    window.print();
}

// Update print section with attendance data
function updatePrintSection() {
    // Set print date
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('printDate').textContent = `DATE: ${dateStr}`;

    // Populate print table
    const printBody = document.getElementById('printTableBody');
    printBody.innerHTML = '';

    faculty.forEach(teacher => {
        const record = attendanceRecords.find(r => r.id === teacher.id);
        const row = printBody.insertRow();
        row.innerHTML = `
            <td>${teacher.id}</td>
            <td class="name">${teacher.name}</td>
            <td>${teacher.designation}</td>
            <td>${record && record.timeIn ? record.timeIn : ''}</td>
            <td class="signature-col"></td>
            <td>${record && record.timeOut ? record.timeOut : ''}</td>
            <td class="signature-col"></td>
        `;
    });
}

// Import DOCX Layout
async function importDocxLayout() {
    const fileInput = document.getElementById('docxFileInput');
    const statusDiv = document.getElementById('importStatus');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        showAlert('Please select a DOCX file first!', 'warning');
        return;
    }
    
    const file = fileInput.files[0];
    
    if (!file.name.endsWith('.docx')) {
        showAlert('Please select a valid DOCX file!', 'warning');
        return;
    }
    
    statusDiv.style.display = 'block';
    statusDiv.style.background = '#fff3cd';
    statusDiv.style.border = '2px solid #ffc107';
    statusDiv.innerHTML = '⏳ Reading DOCX file...';
    
    try {
        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        
        // Use JSZip to extract DOCX content (DOCX is a ZIP file)
        const JSZip = window.JSZip;
        if (!JSZip) {
            throw new Error('JSZip library not loaded. Please include it in your HTML.');
        }
        
        const zip = await JSZip.loadAsync(arrayBuffer);
        
        // Extract document.xml which contains the main content
        const docXml = await zip.file('word/document.xml').async('text');
        
        // Parse the XML to extract formatting information
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(docXml, 'text/xml');
        
        // Extract table structure
        const tables = xmlDoc.getElementsByTagName('w:tbl');
        
        if (tables.length === 0) {
            statusDiv.style.background = '#f8d7da';
            statusDiv.style.border = '2px solid #dc3545';
            statusDiv.innerHTML = '❌ No tables found in DOCX file. Please upload a file with a table structure.';
            return;
        }
        
        // Extract header/footer info
        const headers = await extractHeadersFooters(zip);
        
        // Apply the extracted format
        applyDocxFormat(xmlDoc, headers);
        
        statusDiv.style.background = '#d4edda';
        statusDiv.style.border = '2px solid #28a745';
        statusDiv.innerHTML = '✅ Layout imported successfully! The format has been applied to your attendance sheet.';
        
        showAlert('Layout imported successfully!', 'success');
        
    } catch (error) {
        console.error('Error importing DOCX:', error);
        statusDiv.style.background = '#f8d7da';
        statusDiv.style.border = '2px solid #dc3545';
        statusDiv.innerHTML = `❌ Error: ${error.message}<br><br>Note: This feature requires the JSZip library. Please add this to your HTML:<br><code>&lt;script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"&gt;&lt;/script&gt;</code>`;
    }
}

// Extract headers and footers from DOCX
async function extractHeadersFooters(zip) {
    const headers = {
        header: null,
        footer: null
    };
    
    try {
        // Check for header
        const headerFile = zip.file('word/header1.xml');
        if (headerFile) {
            headers.header = await headerFile.async('text');
        }
        
        // Check for footer
        const footerFile = zip.file('word/footer1.xml');
        if (footerFile) {
            headers.footer = await footerFile.async('text');
        }
    } catch (error) {
        console.log('No headers/footers found:', error);
    }
    
    return headers;
}

// Apply extracted DOCX format to the attendance sheet
function applyDocxFormat(xmlDoc, headers) {
    // Extract title from document
    const paragraphs = xmlDoc.getElementsByTagName('w:p');
    let title = '';
    
    for (let i = 0; i < Math.min(5, paragraphs.length); i++) {
        const textNodes = paragraphs[i].getElementsByTagName('w:t');
        if (textNodes.length > 0) {
            const text = textNodes[0].textContent.trim();
            if (text && text.length > 5) {
                title = text;
                break;
            }
        }
    }
    
    if (title) {
        const printTitle = document.querySelector('.print-title');
        if (printTitle) {
            printTitle.textContent = title;
        }
    }
    
    // Extract table headers (column names)
    const tables = xmlDoc.getElementsByTagName('w:tbl');
    if (tables.length > 0) {
        const firstTable = tables[0];
        const rows = firstTable.getElementsByTagName('w:tr');
        
        if (rows.length > 0) {
            const headerRow = rows[0];
            const cells = headerRow.getElementsByTagName('w:tc');
            const columnNames = [];
            
            for (let cell of cells) {
                const textNodes = cell.getElementsByTagName('w:t');
                if (textNodes.length > 0) {
                    columnNames.push(textNodes[0].textContent.trim());
                }
            }
            
            // Update print table headers if found
            if (columnNames.length > 0) {
                const printTable = document.querySelector('.print-table thead tr');
                if (printTable) {
                    console.log('Found column names:', columnNames);
                    // You can dynamically update headers here if needed
                }
            }
        }
    }
    
    // Save imported layout info to localStorage
    localStorage.setItem('importedLayout', JSON.stringify({
        title: title,
        importedAt: new Date().toISOString()
    }));
}

// Initialize on page load
window.onload = init;
