const fs = require('fs');
const path = require('path');

// Determine file persistence path (/tmp for Vercel serverless environment, local directory otherwise)
const isVercel = Boolean(process.env.VERCEL);
const DATA_FILE = isVercel
  ? path.join('/tmp', 'exam_allocator_state.json')
  : path.join(__dirname, '..', 'data_store.json');

// Default initial state
function getDefaultState() {
  return {
    students: [],
    halls: [],
    lastAllocation: null
  };
}

// In-memory cache
let inMemoryState = null;

function loadState() {
  if (inMemoryState) return inMemoryState;

  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      inMemoryState = JSON.parse(raw);
      return inMemoryState;
    }
  } catch (err) {
    console.error('Error reading state file, using default state:', err);
  }

  inMemoryState = getDefaultState();
  return inMemoryState;
}

function saveState(state) {
  inMemoryState = state;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving state file:', err);
  }
}

// Business Logic Functions matching Java Allocator

function getStudents() {
  const state = loadState();
  return state.students;
}

function getHalls() {
  const state = loadState();
  return state.halls.map(hall => {
    const occupied = hall.allocatedStudents ? hall.allocatedStudents.length : 0;
    const capacity = Number(hall.capacity) || 0;
    return {
      ...hall,
      occupiedSeats: occupied,
      availableSeats: Math.max(0, capacity - occupied),
      isFull: occupied >= capacity
    };
  });
}

function addStudent(regNo, name, department) {
  if (!regNo || !regNo.trim()) {
    return { success: false, message: 'Register number cannot be empty!' };
  }
  if (!name || !name.trim()) {
    return { success: false, message: 'Student name cannot be empty!' };
  }
  if (!department || !department.trim()) {
    return { success: false, message: 'Department cannot be empty!' };
  }

  const cleanRegNo = regNo.trim().toUpperCase();
  const cleanName = name.trim();
  const cleanDept = department.trim().toUpperCase();

  const state = loadState();
  const existing = state.students.find(s => s.regNo.toUpperCase() === cleanRegNo);
  if (existing) {
    return { success: false, message: `Student with Register Number '${cleanRegNo}' already exists!` };
  }

  const newStudent = {
    regNo: cleanRegNo,
    name: cleanName,
    department: cleanDept,
    isAllocated: false,
    allocatedHall: 'Not Assigned',
    seatNumber: 'Not Assigned'
  };

  state.students.push(newStudent);
  saveState(state);
  return { success: true, message: `Student '${cleanName}' (${cleanRegNo}) added successfully.`, student: newStudent };
}

function addStudentsBatch(studentsArray) {
  if (!Array.isArray(studentsArray) || studentsArray.length === 0) {
    return { success: false, message: 'No student records found in the import file!' };
  }

  const state = loadState();
  const existingRegMap = new Set(state.students.map(s => s.regNo.toUpperCase()));
  const batchRegMap = new Set();

  let addedCount = 0;
  let skippedCount = 0;
  const skippedList = [];
  const addedStudents = [];

  for (const s of studentsArray) {
    const rawRegNo = s.regNo || s.registerNumber || s['Register Number'] || s['Reg No'] || s['RegNo'] || s['reg_no'] || '';
    const rawName = s.name || s.studentName || s['Student Name'] || s['Name'] || s['student_name'] || '';
    const rawDept = s.department || s.dept || s['Department'] || s['Dept'] || s['department_name'] || '';

    const cleanRegNo = String(rawRegNo).trim().toUpperCase();
    const cleanName = String(rawName).trim();
    const cleanDept = String(rawDept).trim().toUpperCase();

    if (!cleanRegNo || !cleanName || !cleanDept) {
      skippedCount++;
      skippedList.push({ regNo: cleanRegNo || 'EMPTY', reason: 'Missing required field (Reg No, Name, or Department)' });
      continue;
    }

    if (existingRegMap.has(cleanRegNo) || batchRegMap.has(cleanRegNo)) {
      skippedCount++;
      skippedList.push({ regNo: cleanRegNo, reason: 'Duplicate register number' });
      continue;
    }

    batchRegMap.add(cleanRegNo);
    existingRegMap.add(cleanRegNo);

    const newStudent = {
      regNo: cleanRegNo,
      name: cleanName,
      department: cleanDept,
      isAllocated: false,
      allocatedHall: 'Not Assigned',
      seatNumber: 'Not Assigned'
    };

    state.students.push(newStudent);
    addedStudents.push(newStudent);
    addedCount++;
  }

  if (addedCount > 0) {
    saveState(state);
  }

  return {
    success: true,
    message: `Excel import complete! Successfully added ${addedCount} student(s).${skippedCount > 0 ? ` Skipped ${skippedCount} duplicate/invalid rows.` : ''}`,
    addedCount,
    skippedCount,
    skippedList,
    addedStudents
  };
}

function addHall(hallNo, capacity) {
  if (!hallNo || !hallNo.trim()) {
    return { success: false, message: 'Hall number cannot be empty!' };
  }

  const numCap = parseInt(capacity, 10);
  if (isNaN(numCap) || numCap <= 0) {
    return { success: false, message: 'Hall capacity must be a positive integer greater than zero!' };
  }

  const cleanHallNo = hallNo.trim().toUpperCase();
  const state = loadState();
  const existing = state.halls.find(h => h.hallNo.toUpperCase() === cleanHallNo);
  if (existing) {
    return { success: false, message: `Examination Hall '${cleanHallNo}' already exists!` };
  }

  const newHall = {
    hallNo: cleanHallNo,
    capacity: numCap,
    allocatedStudents: []
  };

  state.halls.push(newHall);
  saveState(state);
  return { success: true, message: `Hall '${cleanHallNo}' with capacity ${numCap} added successfully.`, hall: newHall };
}

function allocateSeats() {
  const state = loadState();

  if (!state.students || state.students.length === 0) {
    return { success: false, message: 'No students registered in the system. Please add students first!' };
  }

  if (!state.halls || state.halls.length === 0) {
    return { success: false, message: 'No examination halls available. Please add halls first!' };
  }

  // Clear previous allocations for fresh sequential seating
  state.halls.forEach(hall => {
    hall.allocatedStudents = [];
  });
  state.students.forEach(student => {
    student.isAllocated = false;
    student.allocatedHall = 'Not Assigned';
    student.seatNumber = 'Not Assigned';
  });

  let currentHallIndex = 0;
  let allocatedCount = 0;
  let totalCapacity = 0;

  state.halls.forEach(h => {
    totalCapacity += Number(h.capacity);
  });

  for (let i = 0; i < state.students.length; i++) {
    const student = state.students[i];

    // Find next hall with available seats
    while (
      currentHallIndex < state.halls.length &&
      state.halls[currentHallIndex].allocatedStudents.length >= state.halls[currentHallIndex].capacity
    ) {
      currentHallIndex++;
    }

    if (currentHallIndex >= state.halls.length) {
      break; // All halls full
    }

    const currentHall = state.halls[currentHallIndex];
    const hallLetter = String.fromCharCode(65 + (currentHallIndex % 26)); // 'A', 'B', etc.
    const nextSeatIndex = currentHall.allocatedStudents.length + 1;
    const seatNumber = `${hallLetter}-${String(nextSeatIndex).padStart(2, '0')}`;

    student.isAllocated = true;
    student.allocatedHall = currentHall.hallNo;
    student.seatNumber = seatNumber;

    currentHall.allocatedStudents.push({
      regNo: student.regNo,
      name: student.name,
      department: student.department,
      seatNumber: seatNumber
    });

    allocatedCount++;
  }

  const unallocatedStudents = state.students.filter(s => !s.isAllocated);
  const unallocatedCount = unallocatedStudents.length;

  const summary = {
    totalStudents: state.students.length,
    totalCapacity: totalCapacity,
    allocatedCount: allocatedCount,
    unallocatedCount: unallocatedCount,
    unallocatedStudents: unallocatedStudents
  };

  state.lastAllocation = {
    timestamp: new Date().toISOString(),
    summary
  };

  saveState(state);

  return {
    success: true,
    message: unallocatedCount === 0
      ? 'All students successfully allocated to examination halls!'
      : `Allocation complete. ${allocatedCount} students allocated, ${unallocatedCount} unallocated due to insufficient capacity.`,
    summary
  };
}

function searchStudent(regNo) {
  if (!regNo || !regNo.trim()) {
    return { success: false, message: 'Search register number cannot be empty!' };
  }
  const cleanRegNo = regNo.trim().toUpperCase();
  const state = loadState();
  const student = state.students.find(s => s.regNo.toUpperCase() === cleanRegNo);

  if (!student) {
    return { success: false, message: `Student with Register Number '${cleanRegNo}' does not exist in the system.` };
  }

  return { success: true, student };
}

function loadSampleData() {
  const state = getDefaultState();

  state.students = [
    { regNo: 'IT101', name: 'Student A', department: 'IT', isAllocated: false, allocatedHall: 'Not Assigned', seatNumber: 'Not Assigned' },
    { regNo: 'IT102', name: 'Student B', department: 'IT', isAllocated: false, allocatedHall: 'Not Assigned', seatNumber: 'Not Assigned' },
    { regNo: 'IT103', name: 'Student C', department: 'IT', isAllocated: false, allocatedHall: 'Not Assigned', seatNumber: 'Not Assigned' },
    { regNo: 'IT104', name: 'Student D', department: 'CSE', isAllocated: false, allocatedHall: 'Not Assigned', seatNumber: 'Not Assigned' },
    { regNo: 'IT105', name: 'Student E', department: 'CSE', isAllocated: false, allocatedHall: 'Not Assigned', seatNumber: 'Not Assigned' }
  ];

  state.halls = [
    { hallNo: 'HALL-1', capacity: 3, allocatedStudents: [] },
    { hallNo: 'HALL-2', capacity: 2, allocatedStudents: [] }
  ];

  saveState(state);
  return {
    success: true,
    message: 'Sample test data loaded successfully! (5 Students: IT101-IT105, 2 Halls: HALL-1, HALL-2)'
  };
}

function resetAll() {
  saveState(getDefaultState());
  return { success: true, message: 'All student and hall data reset successfully.' };
}

function resetAllocations() {
  const state = loadState();
  state.halls.forEach(h => h.allocatedStudents = []);
  state.students.forEach(s => {
    s.isAllocated = false;
    s.allocatedHall = 'Not Assigned';
    s.seatNumber = 'Not Assigned';
  });
  state.lastAllocation = null;
  saveState(state);
  return { success: true, message: 'Seating allocations reset successfully. Student and hall records retained.' };
}

function exportReportText() {
  const state = loadState();
  let text = '==========================================================================================\n';
  text += '                           EXAM HALL SEATING ARRANGEMENT REPORT                           \n';
  text += '==========================================================================================\n';
  text += 'Reg No       | Student Name         | Department   | Hall No      | Seat No   \n';
  text += '------------------------------------------------------------------------------------------\n';

  const allocated = state.students.filter(s => s.isAllocated);
  if (allocated.length === 0) {
    text += 'No students currently allocated.\n';
  } else {
    allocated.forEach(s => {
      text += `${s.regNo.padEnd(12)} | ${s.name.padEnd(20)} | ${s.department.padEnd(12)} | ${s.allocatedHall.padEnd(12)} | ${s.seatNumber.padEnd(10)}\n`;
    });
  }
  text += '==========================================================================================\n';
  text += `Generated on: ${new Date().toLocaleString()}\n`;
  text += 'Exam Hall Allocator System (Vercel Serverless Edition)\n';
  return text;
}

module.exports = {
  getStudents,
  getHalls,
  addStudent,
  addStudentsBatch,
  addHall,
  allocateSeats,
  searchStudent,
  loadSampleData,
  resetAll,
  resetAllocations,
  exportReportText,
  loadState
};
