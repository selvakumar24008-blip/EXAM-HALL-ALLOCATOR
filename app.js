/**
 * Exam Hall Allocator System — Frontend Application Logic
 * Clean Orange & White Academic Theme (Zero Emojis)
 */

// Application State
let appData = {
  students: [],
  halls: [],
  summary: null
};

// DOM Elements
const statStudents = document.getElementById('stat-students-count');
const statHalls = document.getElementById('stat-halls-count');
const statCapacity = document.getElementById('stat-total-capacity');
const statAllocated = document.getElementById('stat-allocated-count');
const statAvailable = document.getElementById('stat-available-count');
const statUnallocated = document.getElementById('stat-unallocated-count');

const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const toastContainer = document.getElementById('toast-container');

// Forms & Controls
const formAddStudent = document.getElementById('form-add-student');
const formAddHall = document.getElementById('form-add-hall');
const formSearchStudent = document.getElementById('form-search-student');

const btnLoadSample = document.getElementById('btn-load-sample');
const btnRunAllocation = document.getElementById('btn-run-allocation');
const btnQuickAllocate = document.getElementById('btn-quick-allocate');
const btnExportReport = document.getElementById('btn-export-report');
const btnResetData = document.getElementById('btn-reset-data');

// Modal Elements
const modalReset = document.getElementById('modal-reset');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnResetAllocationsOnly = document.getElementById('btn-reset-allocations-only');
const btnResetAll = document.getElementById('btn-reset-all');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadAllData();
});

function setupEventListeners() {
  // Tab Switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(btn.dataset.tab);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Report Sub-Tabs
  const subTabBtns = document.querySelectorAll('.sub-tab-btn');
  subTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      subTabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.report-content-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.subtab);
      if (target) target.classList.add('active');
    });
  });

  // Forms
  if (formAddStudent) formAddStudent.addEventListener('submit', handleAddStudent);
  if (formAddHall) formAddHall.addEventListener('submit', handleAddHall);
  if (formSearchStudent) formSearchStudent.addEventListener('submit', handleSearchStudent);

  // Quick Action Buttons
  if (btnLoadSample) btnLoadSample.addEventListener('click', handleLoadSample);
  if (btnRunAllocation) btnRunAllocation.addEventListener('click', handleAllocateSeats);
  if (btnQuickAllocate) btnQuickAllocate.addEventListener('click', handleAllocateSeats);
  if (btnExportReport) btnExportReport.addEventListener('click', handleExportReport);
  if (btnResetData) btnResetData.addEventListener('click', () => modalReset.style.display = 'flex');

  // Reset Modal
  if (btnCloseModal) btnCloseModal.addEventListener('click', () => modalReset.style.display = 'none');
  if (btnResetAllocationsOnly) btnResetAllocationsOnly.addEventListener('click', () => handleReset('allocations_only'));
  if (btnResetAll) btnResetAll.addEventListener('click', () => handleReset('all'));

  // Filter Table
  const filterInput = document.getElementById('filter-students-input');
  if (filterInput) {
    filterInput.addEventListener('input', (e) => {
      renderStudentsTable(e.target.value.toLowerCase());
    });
  }

  // Print & Download Controls
  const btnPrint = document.getElementById('btn-print-report');
  if (btnPrint) btnPrint.addEventListener('click', () => window.print());

  const btnDownloadTxt = document.getElementById('btn-download-txt');
  if (btnDownloadTxt) btnDownloadTxt.addEventListener('click', handleExportReport);

  // Excel Import Setup
  setupExcelImport();
}

// Staged Excel Import State
let stagedExcelStudents = [];

function setupExcelImport() {
  const btnModeManual = document.getElementById('btn-mode-manual');
  const btnModeExcel = document.getElementById('btn-mode-excel');
  const panelManual = document.getElementById('panel-manual-entry');
  const panelExcel = document.getElementById('panel-excel-import');
  const btnHeaderExcel = document.getElementById('btn-header-excel');

  const dropzone = document.getElementById('excel-dropzone');
  const fileInput = document.getElementById('excel-file-input');
  const btnCancelExcel = document.getElementById('btn-cancel-excel');
  const btnConfirmExcel = document.getElementById('btn-confirm-excel-import');

  // Toggle between Manual and Excel Import
  if (btnModeManual && btnModeExcel) {
    btnModeManual.addEventListener('click', () => {
      btnModeManual.classList.add('active');
      btnModeExcel.classList.remove('active');
      panelManual.style.display = 'block';
      panelExcel.style.display = 'none';
    });

    btnModeExcel.addEventListener('click', () => {
      btnModeExcel.classList.add('active');
      btnModeManual.classList.remove('active');
      panelExcel.style.display = 'block';
      panelManual.style.display = 'none';
    });
  }

  // Header "Import Excel" button shortcut
  if (btnHeaderExcel) {
    btnHeaderExcel.addEventListener('click', () => {
      const tabStudents = document.getElementById('nav-students');
      if (tabStudents) tabStudents.click();
      if (btnModeExcel) btnModeExcel.click();
    });
  }

  // Dropzone Interaction
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleExcelFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleExcelFile(e.target.files[0]);
      }
    });
  }

  // Cancel Excel
  if (btnCancelExcel) {
    btnCancelExcel.addEventListener('click', () => {
      stagedExcelStudents = [];
      if (fileInput) fileInput.value = '';
      document.getElementById('excel-preview-details').style.display = 'none';
      if (dropzone) dropzone.style.display = 'block';
    });
  }

  // Confirm Import
  if (btnConfirmExcel) {
    btnConfirmExcel.addEventListener('click', handleConfirmExcelImport);
  }
}

// Parse uploaded Excel (.xlsx, .xls) or CSV file
function handleExcelFile(file) {
  if (!file) return;

  const fileName = file.name;
  const ext = fileName.split('.').pop().toLowerCase();

  if (!['xlsx', 'xls', 'csv'].includes(ext)) {
    showToast('Please upload an Excel workbook (.xlsx, .xls) or CSV file', 'error');
    return;
  }

  showToast(`Processing ${fileName}...`, 'info');

  const reader = new FileReader();

  if (ext === 'csv') {
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const students = parseCsvText(text);
        displayExcelPreview(fileName, students);
      } catch (err) {
        showToast('Error reading CSV file', 'error');
      }
    };
    reader.readAsText(file);
  } else {
    // XLSX / XLS using SheetJS if loaded, or binary reader
    reader.onload = (e) => {
      try {
        if (typeof XLSX !== 'undefined') {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          const students = normalizeImportRows(rawRows);
          displayExcelPreview(fileName, students);
        } else {
          showToast('SheetJS parser loading. Please use CSV or wait a moment...', 'error');
        }
      } catch (err) {
        console.error('Excel parse error:', err);
        showToast('Failed to parse Excel file. Please ensure valid format.', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  }
}

// Normalize column headers to RegNo, Name, Department
function normalizeImportRows(rawRows) {
  return rawRows.map(row => {
    let regNo = '';
    let name = '';
    let department = '';

    for (const key of Object.keys(row)) {
      const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const val = String(row[key]).trim();

      if (cleanKey.includes('reg') || cleanKey.includes('roll') || cleanKey.includes('id')) {
        regNo = val;
      } else if (cleanKey.includes('name') || cleanKey.includes('student')) {
        name = val;
      } else if (cleanKey.includes('dept') || cleanKey.includes('branch') || cleanKey.includes('department')) {
        department = val;
      }
    }

    return { regNo, name, department };
  }).filter(s => s.regNo || s.name || s.department);
}

// Lightweight native CSV parser
function parseCsvText(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headerLine = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    let regNo = '';
    let name = '';
    let department = '';

    headerLine.forEach((h, idx) => {
      const val = values[idx] || '';
      if (h.includes('reg') || h.includes('roll') || h.includes('id')) {
        regNo = val;
      } else if (h.includes('name') || h.includes('student')) {
        name = val;
      } else if (h.includes('dept') || h.includes('branch') || h.includes('department')) {
        department = val;
      }
    });

    if (regNo || name || department) {
      rows.push({ regNo, name, department });
    }
  }

  return rows;
}

// Display Preview of parsed students
function displayExcelPreview(fileName, students) {
  if (students.length === 0) {
    showToast('No valid student rows found in file', 'error');
    return;
  }

  stagedExcelStudents = students;

  const dropzone = document.getElementById('excel-dropzone');
  const previewBox = document.getElementById('excel-preview-details');
  const filenameEl = document.getElementById('preview-filename');
  const countEl = document.getElementById('preview-row-count');
  const tbody = document.getElementById('tbody-excel-preview');

  if (dropzone) dropzone.style.display = 'none';
  if (previewBox) previewBox.style.display = 'block';

  if (filenameEl) filenameEl.textContent = fileName;
  if (countEl) countEl.textContent = `${students.length} Student(s) Found`;

  if (tbody) {
    tbody.innerHTML = students.slice(0, 50).map(s => `
      <tr>
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--primary);">${s.regNo || '<span class="status-unallocated">Missing</span>'}</td>
        <td style="font-weight: 600;">${s.name || '<span class="status-unallocated">Missing</span>'}</td>
        <td><span class="dept-pill">${s.department || 'N/A'}</span></td>
      </tr>
    `).join('');

    if (students.length > 50) {
      tbody.innerHTML += `
        <tr>
          <td colspan="3" style="text-align: center; color: var(--text-muted); font-size: 0.75rem;">
            ...and ${students.length - 50} more student(s)
          </td>
        </tr>
      `;
    }
  }

  showToast(`Parsed ${students.length} student records from sheet!`, 'success');
}

// Confirm and send batch students to API
async function handleConfirmExcelImport() {
  if (stagedExcelStudents.length === 0) {
    showToast('No student records to import', 'error');
    return;
  }

  const btnConfirm = document.getElementById('btn-confirm-excel-import');
  if (btnConfirm) {
    btnConfirm.disabled = true;
    btnConfirm.textContent = 'Importing...';
  }

  try {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: stagedExcelStudents })
    });

    const data = await res.json();

    if (data.success) {
      showToast(data.message, 'success');
      // Reset staging
      stagedExcelStudents = [];
      const fileInput = document.getElementById('excel-file-input');
      if (fileInput) fileInput.value = '';
      document.getElementById('excel-preview-details').style.display = 'none';
      document.getElementById('excel-dropzone').style.display = 'block';

      // Refresh data
      await loadAllData();
    } else {
      showToast(data.message || 'Import failed', 'error');
    }
  } catch (err) {
    showToast('Network error during Excel import', 'error');
  } finally {
    if (btnConfirm) {
      btnConfirm.disabled = false;
      btnConfirm.textContent = 'Confirm & Import';
    }
  }
}


// Data Fetching
async function loadAllData() {
  try {
    const [resStudents, resHalls] = await Promise.all([
      fetch('/api/students'),
      fetch('/api/halls')
    ]);

    const dataStudents = await resStudents.json();
    const dataHalls = await resHalls.json();

    if (dataStudents.success) appData.students = dataStudents.students || [];
    if (dataHalls.success) appData.halls = dataHalls.halls || [];

    updateStats();
    renderHallVisualizer();
    renderStudentsTable();
    renderHallsAvailability();
    renderReports();
  } catch (err) {
    console.error('Failed to load data:', err);
    showToast('Failed to connect to backend API', 'error');
  }
}

// Update Dashboard Metric Cards
function updateStats() {
  const students = appData.students;
  const halls = appData.halls;

  const totalStudents = students.length;
  const totalHalls = halls.length;
  const totalCapacity = halls.reduce((sum, h) => sum + (Number(h.capacity) || 0), 0);
  const totalAllocated = students.filter(s => s.isAllocated).length;
  const availableSeats = Math.max(0, totalCapacity - totalAllocated);
  const unallocatedCount = students.filter(s => !s.isAllocated).length;

  statStudents.textContent = totalStudents;
  statHalls.textContent = totalHalls;
  statCapacity.textContent = totalCapacity;
  statAllocated.textContent = totalAllocated;
  statAvailable.textContent = availableSeats;
  statUnallocated.textContent = unallocatedCount;

  // Unallocated warning border
  const unallocatedCard = document.getElementById('card-unallocated');
  if (unallocatedCount > 0 && totalAllocated > 0) {
    unallocatedCard.style.borderColor = 'var(--rose)';
  } else {
    unallocatedCard.style.borderColor = 'var(--border-subtle)';
  }
}

// Option 1: Add Student
async function handleAddStudent(e) {
  e.preventDefault();
  const regNo = document.getElementById('input-student-reg').value.trim();
  const name = document.getElementById('input-student-name').value.trim();
  const department = document.getElementById('input-student-dept').value;

  try {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regNo, name, department })
    });

    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      formAddStudent.reset();
      await loadAllData();
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('Network error while adding student', 'error');
  }
}

// Option 2: Add Hall
async function handleAddHall(e) {
  e.preventDefault();
  const hallNo = document.getElementById('input-hall-no').value.trim();
  const capacity = document.getElementById('input-hall-capacity').value.trim();

  try {
    const res = await fetch('/api/halls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hallNo, capacity })
    });

    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      formAddHall.reset();
      await loadAllData();
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('Network error while adding hall', 'error');
  }
}

// Option 3: Run Automatic Allocation Engine
async function handleAllocateSeats() {
  try {
    showToast('Executing automated seat allocation...', 'info');
    const res = await fetch('/api/allocate', { method: 'POST' });
    const data = await res.json();

    if (data.success) {
      showToast(data.message, 'success');
      await loadAllData();

      const alertBox = document.getElementById('allocation-alert-box');
      const alertContent = document.getElementById('allocation-alert-content');

      if (data.summary && data.summary.unallocatedCount > 0) {
        alertBox.style.display = 'block';
        alertContent.innerHTML = `
          <strong>${data.summary.unallocatedCount} student(s) could not be seated!</strong><br>
          Unallocated: ${data.summary.unallocatedStudents.map(s => `${s.regNo} (${s.name})`).join(', ')}
        `;
      } else {
        alertBox.style.display = 'none';
      }
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('Failed to run allocation engine', 'error');
  }
}

// Option 6: Search Student
async function handleSearchStudent(e) {
  e.preventDefault();
  const regNo = document.getElementById('input-search-reg').value.trim();
  const resultBox = document.getElementById('search-result-container');

  try {
    const res = await fetch(`/api/search?regNo=${encodeURIComponent(regNo)}`);
    const data = await res.json();

    resultBox.style.display = 'block';
    if (data.success) {
      const s = data.student;
      resultBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem;">
          <h4>Student Record Found</h4>
          <span class="status-badge ${s.isAllocated ? 'status-allocated' : 'status-unallocated'}">
            ${s.isAllocated ? 'ALLOCATED' : 'NOT ALLOCATED'}
          </span>
        </div>
        <div class="result-grid">
          <div class="result-item">
            <span class="result-label">Register Number</span>
            <span class="result-value" style="font-family: var(--font-mono); color: var(--primary);">${s.regNo}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Full Name</span>
            <span class="result-value">${s.name}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Department</span>
            <span class="result-value">${s.department}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Examination Hall</span>
            <span class="result-value" style="color: ${s.isAllocated ? 'var(--primary-dark)' : 'var(--text-muted)'};">${s.allocatedHall}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Assigned Seat</span>
            <span class="result-value">${s.isAllocated ? `<span class="seat-tag">${s.seatNumber}</span>` : 'None'}</span>
          </div>
        </div>
      `;
    } else {
      resultBox.innerHTML = `
        <div style="color: var(--rose); font-weight: 600; padding: 0.5rem 0;">
          Notice: ${data.message}
        </div>
      `;
    }
  } catch (err) {
    showToast('Error searching student', 'error');
  }
}

// Option 9: Load Sample Test Data (Viva Demo)
async function handleLoadSample() {
  try {
    const res = await fetch('/api/sample-data', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      await loadAllData();
    }
  } catch (err) {
    showToast('Failed to load sample data', 'error');
  }
}

// Option 10: Export Seating Report to Text File
function handleExportReport() {
  window.open('/api/export', '_blank');
}

// Reset Options
async function handleReset(mode) {
  try {
    const res = await fetch('/api/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      modalReset.style.display = 'none';
      document.getElementById('allocation-alert-box').style.display = 'none';
      await loadAllData();
    }
  } catch (err) {
    showToast('Reset failed', 'error');
  }
}

// --- Render Visual Seating Matrix ---
function renderHallVisualizer() {
  const container = document.getElementById('hall-visual-container');
  if (!container) return;

  if (appData.halls.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: 12px; border: 1px dashed var(--border-subtle); color: var(--text-muted);">
        No examination halls registered yet. Click <strong>"Add Examination Hall"</strong> or <strong>"Load Sample Data"</strong> to begin.
      </div>
    `;
    return;
  }

  container.innerHTML = appData.halls.map((hall, hallIdx) => {
    const capacity = Number(hall.capacity) || 0;
    const occupied = (hall.allocatedStudents && hall.allocatedStudents.length) || 0;
    const percentage = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
    const hallLetter = String.fromCharCode(65 + (hallIdx % 26));

    // Render individual desk boxes up to capacity
    let desksHtml = '';
    for (let i = 1; i <= capacity; i++) {
      const seatCode = `${hallLetter}-${String(i).padStart(2, '0')}`;
      const student = hall.allocatedStudents && hall.allocatedStudents[i - 1];

      if (student) {
        desksHtml += `
          <div class="desk-box occupied" title="${student.regNo} — ${student.name} (${student.department})">
            <div class="desk-seat-code">${seatCode}</div>
            <div class="desk-student-name">${student.name}</div>
            <div class="desk-reg-no">${student.regNo}</div>
          </div>
        `;
      } else {
        desksHtml += `
          <div class="desk-box vacant" title="Vacant Desk">
            <div class="desk-seat-code" style="color: var(--text-subtle);">${seatCode}</div>
            <div class="desk-student-name" style="color: var(--text-subtle);">Vacant</div>
            <div class="desk-reg-no">—</div>
          </div>
        `;
      }
    }

    return `
      <div class="hall-card-visual">
        <div class="hall-card-top">
          <div class="hall-name">
            <span class="hall-badge">HALL</span> ${hall.hallNo}
          </div>
          <span class="capacity-indicator">${occupied} / ${capacity} Seated (${percentage}%)</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill ${percentage >= 100 ? 'full' : ''}" style="width: ${percentage}%;"></div>
        </div>
        <div class="seats-matrix">
          ${desksHtml}
        </div>
      </div>
    `;
  }).join('');
}

// --- Render Students Table ---
function renderStudentsTable(filterText = '') {
  const tbody = document.getElementById('tbody-students');
  if (!tbody) return;

  let list = appData.students;
  if (filterText) {
    list = list.filter(s =>
      s.regNo.toLowerCase().includes(filterText) ||
      s.name.toLowerCase().includes(filterText) ||
      s.department.toLowerCase().includes(filterText)
    );
  }

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          ${appData.students.length === 0 ? 'No students registered in the system.' : 'No students matching filter.'}
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(s => `
    <tr>
      <td style="font-family: var(--font-mono); font-weight: 600; color: var(--primary);">${s.regNo}</td>
      <td style="font-weight: 600; color: var(--text-main);">${s.name}</td>
      <td><span class="dept-pill">${s.department}</span></td>
      <td>
        <span class="status-badge ${s.isAllocated ? 'status-allocated' : 'status-unallocated'}">
          ${s.isAllocated ? 'Allocated' : 'Unallocated'}
        </span>
      </td>
      <td style="color: ${s.isAllocated ? 'var(--primary-dark)' : 'var(--text-subtle)'}; font-weight: 600;">${s.allocatedHall}</td>
      <td>${s.isAllocated ? `<span class="seat-tag">${s.seatNumber}</span>` : '—'}</td>
    </tr>
  `).join('');
}

// --- Render Hall Availability Dashboard ---
function renderHallsAvailability() {
  const container = document.getElementById('halls-availability-list');
  if (!container) return;

  if (appData.halls.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        No examination halls added yet.
      </div>
    `;
    return;
  }

  container.innerHTML = appData.halls.map(hall => {
    const occupied = hall.occupiedSeats || 0;
    const capacity = Number(hall.capacity) || 0;
    const available = Math.max(0, capacity - occupied);

    let assignedNames = 'None';
    if (hall.allocatedStudents && hall.allocatedStudents.length > 0) {
      assignedNames = hall.allocatedStudents.map(s => `${s.seatNumber}: ${s.name} (${s.regNo})`).join(', ');
    }

    return `
      <div class="hall-avail-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="font-size: 1.05rem; color: var(--text-main); font-weight: 700;">
            <span class="hall-badge">HALL</span> ${hall.hallNo}
          </h4>
          <span class="pill-badge">${occupied >= capacity ? 'FULL' : `${available} SEATS LEFT`}</span>
        </div>
        <div class="avail-stats-row">
          <div class="avail-metric">
            <span class="avail-metric-lbl">Total Capacity</span>
            <span class="avail-metric-val" style="color: var(--primary);">${capacity}</span>
          </div>
          <div class="avail-metric">
            <span class="avail-metric-lbl">Occupied</span>
            <span class="avail-metric-val" style="color: var(--emerald);">${occupied}</span>
          </div>
          <div class="avail-metric">
            <span class="avail-metric-lbl">Available</span>
            <span class="avail-metric-val" style="color: var(--amber);">${available}</span>
          </div>
        </div>
        <div style="margin-top: 0.75rem; font-size: 0.78rem; color: var(--text-muted);">
          <strong>Assigned:</strong> ${assignedNames}
        </div>
      </div>
    `;
  }).join('');
}

// --- Render Seating Reports ---
function renderReports() {
  const tbodyStudentWise = document.getElementById('tbody-report-students');
  const hallWiseContainer = document.getElementById('hallwise-report-container');

  const allocated = appData.students.filter(s => s.isAllocated);

  // Student-Wise Report
  if (tbodyStudentWise) {
    if (allocated.length === 0) {
      tbodyStudentWise.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            No seats have been allocated yet. Click "Allocate Seats" to generate report.
          </td>
        </tr>
      `;
    } else {
      tbodyStudentWise.innerHTML = allocated.map(s => `
        <tr>
          <td style="font-family: var(--font-mono); font-weight: 600; color: var(--primary);">${s.regNo}</td>
          <td style="font-weight: 600;">${s.name}</td>
          <td><span class="dept-pill">${s.department}</span></td>
          <td style="font-weight: 700; color: var(--primary-dark);">${s.allocatedHall}</td>
          <td><span class="seat-tag">${s.seatNumber}</span></td>
        </tr>
      `).join('');
    }
  }

  // Hall-Wise Report
  if (hallWiseContainer) {
    if (appData.halls.length === 0) {
      hallWiseContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No examination halls registered.
        </div>
      `;
    } else {
      hallWiseContainer.innerHTML = appData.halls.map(hall => {
        const students = hall.allocatedStudents || [];
        let rows = '';

        if (students.length === 0) {
          rows = `<tr><td colspan="4" style="text-align: center; padding: 1rem; color: var(--text-muted);">[No students allocated to this hall]</td></tr>`;
        } else {
          rows = students.map(s => `
            <tr>
              <td><span class="seat-tag">${s.seatNumber}</span></td>
              <td style="font-family: var(--font-mono); color: var(--primary); font-weight: 600;">${s.regNo}</td>
              <td style="font-weight: 600;">${s.name}</td>
              <td><span class="dept-pill">${s.department}</span></td>
            </tr>
          `).join('');
        }

        return `
          <div class="hall-door-chart">
            <div class="door-chart-header">
              <div>
                <h4 style="font-size: 1.15rem; color: var(--text-main); font-weight: 700;">
                  EXAMINATION HALL: ${hall.hallNo}
                </h4>
                <span class="subtitle">Capacity: ${hall.capacity} | Seated: ${students.length}</span>
              </div>
              <span class="pill-badge">Notice Board Chart</span>
            </div>
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Seat No</th>
                    <th>Register No</th>
                    <th>Student Name</th>
                    <th>Dept</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

// Toast Notifications (Clean Zero-Emoji)
function showToast(message, type = 'info') {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const label = type === 'success' ? 'SUCCESS' : type === 'error' ? 'ERROR' : 'INFO';
  toast.innerHTML = `<span class="toast-tag toast-${type}">${label}</span> <span class="toast-msg">${message}</span>`;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}
