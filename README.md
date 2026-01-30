# CCS Faculty Attendance Tracker

## Overview
A **Progressive Web App (PWA)** for tracking faculty attendance at UPHSD College of Computer Studies. Features real-time time tracking, admin management, and offline support.

## Features
- ✅ **Faculty Time In/Out** with confirmation dialogs
- ✅ **Real-time Clock** display
- ✅ **Admin Panel** for managing faculty and attendance records
- ✅ **Print-ready** attendance sheets with UPHSD branding
- ✅ **Progressive Web App** - installable on desktop/mobile
- ✅ **Offline Support** - works without internet
- ✅ **Local Storage** - data persists across sessions

---

## 🚀 Quick Start

### Option 1: Simple (No PWA features)
Just double-click `attendance_tracker.html` to open in browser.

### Option 2: With PWA Features (Recommended)

#### Using Python:
```bash
cd "c:\Users\ferre\Desktop\OJT Systems\CCS-Faculty-Attendance-Tracker"
python -m http.server 8000
```
Then open: **http://localhost:8000/attendance_tracker.html**

#### Using Node.js:
```bash
cd "c:\Users\ferre\Desktop\OJT Systems\CCS-Faculty-Attendance-Tracker"
npx serve .
```
Then open the URL shown in the terminal (e.g., http://localhost:3000/attendance_tracker.html)

---

## 📱 Installing as PWA

1. Start the server (see above)
2. Open the URL in **Chrome** or **Edge**
3. Look for the **install icon** (⊕) in the address bar
4. Click **"Install"** or go to Menu → **"Install CCS Faculty Attendance Tracker"**

The app will:
- Appear on your desktop/home screen
- Run in standalone mode (no browser UI)
- Work offline after first load

---

## 🔐 Admin Login

- **Username:** `admin`
- **Password:** `admin123`

Admin features:
- Edit/delete attendance records
- Manage faculty members
- Import DOCX layouts
- Change admin credentials

---

## 📋 How to Use

1. **Select a faculty member** from the grid
2. Click **⏰ TIME IN** when they arrive
3. Click **🏁 TIME OUT** when they leave
4. Click **🖨️ PRINT** to generate printable attendance sheet

---

## 📁 Project Structure

```
CCS-Faculty-Attendance-Tracker/
├── attendance_tracker.html    # Main application
├── app.js                     # Application logic
├── styles.css                 # Styling
├── manifest.json              # PWA manifest
├── sw.js                      # Service Worker (offline support)
├── icons/                     # App icons for PWA
├── generate-icons.html        # Tool to generate app icons
├── extract_docx_content.js    # DOCX extractor utility
├── package.json               # Node.js dependencies
└── extracted_content/         # Extracted images and reports
    └── images/
```

---

## 🎨 Generate PWA Icons

1. Open `generate-icons.html` in your browser
2. Click **"Generate & Download All Icons"**
3. Save all icons to the `icons/` folder

---

## Faculty Members

1. **MARIBEL SANDAGON** - OIC (Officer-in-Charge)
2. **VAL PATRICK FABREGAS** - FACULTY
3. **ROBERTO MALITAO** - FACULTY
4. **HOMER FAVENIR** - FACULTY
5. **FE ANTONIO** - FACULTY
6. **MARCO ANTONIO SUBION** - FACULTY
7. **LUVIM EUSEBIO** - FACULTY
8. **ROLANDO QUIRONG** - FACULTY
9. **ARNOLD GALVE** - FACULTY
10. **EDWARD CRUZ** - FACULTY

---

## Requirements

- Modern web browser (Chrome, Edge, Firefox)
- For PWA: Python 3.x OR Node.js

---

## DOCX Extractor (Optional)

To extract content from Word documents:

### Install Dependencies
```bash
npm install
```

### Run the Extractor
```bash
node extract_docx_content.js
```

This creates an `extracted_content` folder with:
- **images/** - All extracted images
- **extraction_report.md** - Detailed extraction report
- **printable_attendance.html** - Ready-to-print HTML file

---

## Troubleshooting

**Server won't start?**
- Make sure no other servers are using the same port
- Try a different port: `python -m http.server 5000`

**PWA install button not showing?**
- Make sure you're using Chrome or Edge
- Must be served via HTTP (not file://)
- Generate icons first using `generate-icons.html`

**Data not saving?**
- The app uses localStorage - don't clear browser data
- Data is stored per-domain (localhost vs file://)

---

## For UPHSD CCS Faculty

This tool was created for the **College of Computer Studies** at the **University of Perpetual Help System DALTA - Molino Campus** to streamline the attendance logging process.

---

**Created by:** UPHSD Molino CCS OJT Team Batch 2 - Lloyd Alvin Degaños  
**Date:** January 2026  
**Version:** 2.0 (PWA)
