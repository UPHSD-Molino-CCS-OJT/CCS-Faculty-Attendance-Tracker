#!/usr/bin/env node

/**
 * Automated DOCX Content Extractor and Printable Generator (Node.js)
 * Extracts text and images from Word documents and creates printable formats.
 */

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { XMLParser } = require('fast-xml-parser');

class DocxExtractor {
    constructor(docxPath) {
        this.docxPath = docxPath;
        this.outputDir = 'extracted_content';
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
        });
    }

    /**
     * Extract all content from the DOCX file
     */
    extractAll() {
        console.log(`📄 Processing: ${path.basename(this.docxPath)}`);

        // Create output directory
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        // Open the DOCX file as a ZIP
        const zip = new AdmZip(this.docxPath);
        const zipEntries = zip.getEntries();

        // Extract content
        const textContent = this._extractText(zip);
        const headerText = this._extractHeader(zip);
        const images = this._extractImages(zip, zipEntries);

        // Generate report
        this._generateReport(textContent, headerText, images);

        console.log(`✅ Extraction complete! Check the '${this.outputDir}' folder.`);

        return {
            text: textContent,
            header: headerText,
            images: images
        };
    }

    /**
     * Extract main document text
     */
    _extractText(zip) {
        try {
            const docXml = zip.readAsText('word/document.xml');
            const doc = this.parser.parse(docXml);
            
            // Extract all text nodes
            const texts = [];
            this._extractTextRecursive(doc, texts);
            
            return texts.join('\n');
        } catch (error) {
            console.log('  ⚠️  Could not extract document text');
            return '';
        }
    }

    /**
     * Extract header text
     */
    _extractHeader(zip) {
        try {
            const headerXml = zip.readAsText('word/header1.xml');
            const header = this.parser.parse(headerXml);
            
            // Extract all text nodes
            const texts = [];
            this._extractTextRecursive(header, texts);
            
            return texts.join(' ');
        } catch (error) {
            console.log('  ⚠️  Could not extract header text');
            return '';
        }
    }

    /**
     * Recursively extract text from XML object
     */
    _extractTextRecursive(obj, texts) {
        if (!obj) return;

        if (typeof obj === 'object') {
            // Check for text content
            if (obj['w:t'] !== undefined) {
                if (typeof obj['w:t'] === 'string') {
                    texts.push(obj['w:t']);
                } else if (obj['w:t']['#text']) {
                    texts.push(obj['w:t']['#text']);
                }
            }

            // Recursively process all properties
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (Array.isArray(obj[key])) {
                        obj[key].forEach(item => this._extractTextRecursive(item, texts));
                    } else if (typeof obj[key] === 'object') {
                        this._extractTextRecursive(obj[key], texts);
                    }
                }
            }
        }
    }

    /**
     * Extract and save all images
     */
    _extractImages(zip, zipEntries) {
        const images = [];
        const imageDir = path.join(this.outputDir, 'images');

        // Create images directory
        if (!fs.existsSync(imageDir)) {
            fs.mkdirSync(imageDir, { recursive: true });
        }

        // Find all media files
        const mediaEntries = zipEntries.filter(entry => 
            entry.entryName.startsWith('word/media/') && !entry.isDirectory
        );

        mediaEntries.forEach(entry => {
            const fileName = path.basename(entry.entryName);
            const outputPath = path.join(imageDir, fileName);

            // Extract image
            zip.extractEntryTo(entry, imageDir, false, true);

            const stats = fs.statSync(outputPath);
            images.push({
                name: fileName,
                path: outputPath,
                size: stats.size
            });

            console.log(`  📷 Extracted: ${fileName} (${stats.size.toLocaleString()} bytes)`);
        });

        return images;
    }

    /**
     * Generate extraction report
     */
    _generateReport(textContent, headerText, images) {
        const reportPath = path.join(this.outputDir, 'extraction_report.md');
        const now = new Date().toLocaleString();

        let report = `# DOCX Content Extraction Report\n\n`;
        report += `**Document:** ${path.basename(this.docxPath)}\n\n`;
        report += `**Extraction Date:** ${now}\n\n`;
        report += `---\n\n`;

        // Header Section
        report += `## 📑 Header Content\n\n`;
        if (headerText) {
            report += `\`\`\`\n${headerText}\n\`\`\`\n\n`;
        } else {
            report += `*No header content found*\n\n`;
        }

        // Images Section
        report += `## 🖼️ Extracted Images\n\n`;
        if (images.length > 0) {
            report += `**Total Images:** ${images.length}\n\n`;
            images.forEach(img => {
                report += `- **${img.name}** (${img.size.toLocaleString()} bytes)\n`;
                report += `  - Path: \`${img.path}\`\n`;
            });
            report += `\n`;
        } else {
            report += `*No images found*\n\n`;
        }

        // Text Content Section
        report += `## 📝 Document Text Content\n\n`;
        report += `\`\`\`\n`;
        report += textContent.substring(0, 2000);
        if (textContent.length > 2000) {
            report += `\n... (truncated)`;
        }
        report += `\n\`\`\`\n\n`;

        report += `---\n\n`;
        report += `*Report generated by DocxExtractor (Node.js)*\n`;

        fs.writeFileSync(reportPath, report, 'utf8');
        console.log(`  📊 Report saved: ${reportPath}`);
    }

    /**
     * Create printable HTML version with images
     */
    createPrintableHtml() {
        const htmlPath = path.join(this.outputDir, 'printable_attendance.html');

        // Check if images exist
        const imageDir = path.join(this.outputDir, 'images');
        let images = [];
        if (fs.existsSync(imageDir)) {
            images = fs.readdirSync(imageDir)
                .filter(file => /\.(png|jpe?g|gif|svg)$/i.test(file))
                .sort();
        }

        // Faculty list
        const faculty = [
            { no: "1", name: "MARIBEL SANDAGON", designation: "OIC" },
            { no: "2", name: "VAL PATRICK FABREGAS", designation: "FACULTY" },
            { no: "3", name: "ROBERTO MALITAO", designation: "FACULTY" },
            { no: "4", name: "HOMER FAVENIR", designation: "FACULTY" },
            { no: "5", name: "FE ANTONIO", designation: "FACULTY" },
            { no: "6", name: "MARCO ANTONIO SUBION", designation: "FACULTY" },
            { no: "7", name: "LUVIM EUSEBIO", designation: "FACULTY" },
            { no: "8", name: "ROLANDO QUIRONG", designation: "FACULTY" },
            { no: "9", name: "ARNOLD GALVE", designation: "FACULTY" },
            { no: "10", name: "EDWARD CRUZ", designation: "FACULTY" }
        ];

        // Build HTML
        let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>UPHSD CCS - Faculty Attendance Sheet</title>
    <style>
        @media print {
            @page {
                size: A4;
                margin: 1cm;
            }
            body {
                margin: 0;
                padding: 0;
            }
        }
        
        body {
            font-family: Arial, sans-serif;
            max-width: 21cm;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid maroon;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header img {
            max-height: 100px;
            margin: 0 20px;
        }
        
        .logo-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 30px;
        }
        
        .header h1 {
            color: maroon;
            font-family: Impact, sans-serif;
            margin: 10px 0;
        }
        
        .header h2 {
            font-size: 14px;
            font-weight: bold;
            margin: 5px 0;
        }
        
        .document-code {
            font-style: italic;
            font-size: 12px;
            text-align: right;
            margin-top: 10px;
        }
        
        .title {
            text-align: center;
            font-weight: bold;
            font-size: 18px;
            margin: 20px 0;
        }
        
        .date-field {
            font-weight: bold;
            margin-left: 80px;
            margin-bottom: 20px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
        }
        
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        
        td.name {
            text-align: left;
            padding-left: 15px;
        }
        
        .signature-col {
            width: 120px;
        }
        
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
`;

        // Header with images
        html += '    <div class="header">\n';
        if (images.length > 0) {
            html += '        <div class="logo-container">\n';
            images.slice(0, 3).forEach(img => {
                html += `            <img src="images/${img}" alt="Logo">\n`;
            });
            html += '        </div>\n';
        }
        html += '        <h1>UNIVERSITY OF PERPETUAL HELP</h1>\n';
        html += '        <h1>SYSTEM DALTA</h1>\n';
        html += '        <h2>College of Computer Studies</h2>\n';
        html += '        <div class="document-code">UPHMO-CCS-GEN-901/rev0</div>\n';
        html += '    </div>\n\n';

        // Create 6 attendance sheets
        for (let i = 0; i < 6; i++) {
            if (i > 0) {
                html += '    <div class="page-break"></div>\n';
            }

            html += '    <div class="title">FACULTY ATTENDANCE LOG</div>\n';
            html += '    <div class="date-field">DATE: _______________</div>\n\n';

            html += '    <table>\n';
            html += '        <thead>\n';
            html += '            <tr>\n';
            html += '                <th>NO.</th>\n';
            html += '                <th>NAME</th>\n';
            html += '                <th>DESIGNATION</th>\n';
            html += '                <th>TIME IN</th>\n';
            html += '                <th class="signature-col">SIGNATURE</th>\n';
            html += '                <th>TIME OUT</th>\n';
            html += '                <th class="signature-col">SIGNATURE</th>\n';
            html += '            </tr>\n';
            html += '        </thead>\n';
            html += '        <tbody>\n';

            faculty.forEach(member => {
                html += '            <tr>\n';
                html += `                <td>${member.no}</td>\n`;
                html += `                <td class="name">${member.name}</td>\n`;
                html += `                <td>${member.designation}</td>\n`;
                html += '                <td></td>\n';
                html += '                <td class="signature-col"></td>\n';
                html += '                <td></td>\n';
                html += '                <td class="signature-col"></td>\n';
                html += '            </tr>\n';
            });

            html += '        </tbody>\n';
            html += '    </table>\n\n';
        }

        html += '</body>\n</html>';

        fs.writeFileSync(htmlPath, html, 'utf8');
        console.log(`  🖨️  Printable HTML created: ${htmlPath}`);
        console.log(`     Open this file in your browser and print!`);

        return htmlPath;
    }
}

/**
 * Main execution function
 */
function main() {
    console.log('='.repeat(60));
    console.log('📦 DOCX Content Extractor & Printable Generator (Node.js)');
    console.log('='.repeat(60));
    console.log();

    // Find DOCX file in current directory
    const files = fs.readdirSync('.');
    const docxFile = files.find(file => file.toLowerCase().endsWith('.docx'));

    if (!docxFile) {
        console.log('❌ No DOCX files found in the current directory!');
        process.exit(1);
    }

    const extractor = new DocxExtractor(docxFile);

    // Extract all content
    extractor.extractAll();

    // Create printable HTML
    extractor.createPrintableHtml();

    console.log();
    console.log('='.repeat(60));
    console.log('✨ All done! Next steps:');
    console.log('   1. Check the "extracted_content" folder');
    console.log('   2. Open "printable_attendance.html" in your browser');
    console.log('   3. Print using Ctrl+P or File > Print');
    console.log('='.repeat(60));
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = DocxExtractor;
