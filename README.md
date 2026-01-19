# DOCX Content Extractor & Printable Generator

## Overview
This tool **automatically extracts images, text, and header content** from Word documents (`.docx`) and creates **printable HTML** versions with embedded images.

## Features
- ✅ **Automatic image extraction** from headers and body
- ✅ **Text extraction** from document and headers
- ✅ **Printable HTML generation** with professional formatting
- ✅ **Print-ready attendance sheets** (6 sheets per document)
- ✅ **Comprehensive extraction report** in Markdown format

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Extractor
```bash
node extract_docx_content.js
# or
npm start
```

### 3. Check the Output
The script creates an `extracted_content` folder with:
- **images/** - All extracted images (PNG, JPEG, etc.)
- **extraction_report.md** - Detailed extraction report
- **printable_attendance.html** - Ready-to-print HTML file

### 3. Print the Attendance Sheet
1. Open `extracted_content/printable_attendance.html` in your browser
2. Press **Ctrl+P** (or **Cmd+P** on Mac)
3. Select your printer and print!

## What Gets Extracted?

### From the DOCX file:
- **Header Images**: University logo, department emblems, etc.
- **Header Text**: Document codes, titles, department names
- **Document Text**: All faculty names, designations, and content
- **Media Files**: All embedded images in original quality

## Images Extracted

From **ATTENDANCE-SHEET-CCS-2026.docx**:
- `image1.png` (27,336 bytes) - Document code image
- `image2.png` (30,799 bytes) - Text graphic
- `image3.jpeg` (157,586 bytes) - **UPHSD Logo**

## Printable HTML Features

The generated HTML includes:
- ✅ Professional header with all images
- ✅ University branding (UPHSD logo, colors)
- ✅ Document code: `UPHMO-CCS-GEN-901/rev0`
- ✅ 6 identical attendance sheets
- ✅ Proper table formatting
- ✅ Print-optimized CSS (A4 size, proper margins)

## Faculty Members Listed

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

## Requirements

- Node.js 14+ and npm
- Dependencies:
  - `adm-zip` - For extracting ZIP/DOCX files
  - `fast-xml-parser` - For parsing XML content

## How It Works

1. **Unzips the DOCX** (it's actually a ZIP archive!)
2. **Parses XML files** (`document.xml`, `header1.xml`)
3. **Extracts images** from `word/media/` folder
4. **Generates HTML** with embedded images
5. **Creates a report** with all extracted content

## Usage Examples

### Basic Usage:
```javascript
const DocxExtractor = require('./extract_docx_content');

const extractor = new DocxExtractor("your-document.docx");
extractor.extractAll();
extractor.createPrintableHtml();
```

### Extract Images Only:
```javascript
const extractor = new DocxExtractor("document.docx");
const zip = new AdmZip("document.docx");
const images = extractor._extractImages(zip, zip.getEntries());
```

## Customization

You can customize the HTML output by editing the `create_printable_html()` method:
- Change colors (currently maroon for UPHSD branding)
- Adjust table formatting
- Modify page size (default: A4)
- Add/remove header sections

## File Structure

```
ATTENDANCE-SHEET-CCS/
├── extract_docx_content.js          # Node.js extraction script
├── package.json                      # Node.js dependencies
├── node_modules/                     # Node.js packages (after npm install)
├── ATTENDANCE-SHEET-CCS-2026.docx   # Original document
├── README.md                         # This file
└── extracted_content/                # Generated output
    ├── images/                       # Extracted images
    │   ├── image1.png
    │   ├── image2.png
    │   └── image3.jpeg
    ├── extraction_report.md          # Detailed report
    └── printable_attendance.html     # Print-ready file
```

## Troubleshooting

**No images extracted?**
- Check if the DOCX file has images in the header
- Verify the file is a valid `.docx` (not `.doc`)

**HTML doesn't look right?**
- Try opening in a different browser (Chrome, Firefox, Edge)
- Check if images are in the `extracted_content/images/` folder

**Print margins are off?**
- Adjust `@page` settings in the HTML file's `<style>` section
- Use your browser's print preview to check

## Notes

- The script automatically finds the first `.docx` file in the current directory
- Images maintain their original quality
- The HTML file is self-contained (images are referenced relatively)
- Works on Windows, Mac, and Linux

## For UPHSD CCS Faculty

This tool was created for the **College of Computer Studies** at the **University of Perpetual Help System DALTA - Molino Campus** to streamline the attendance logging process.

---

**Created by:** UPHSD Molino CCS OJT Team Batch 2 - Lloyd Alvin Degaños
**Date:** January 19, 2026  
**Version:** 1.0
