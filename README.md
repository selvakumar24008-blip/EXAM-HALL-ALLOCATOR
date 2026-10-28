# Exam Hall Allocator System — Java Mini Project

**Author:** 2nd-Year B.Tech Information Technology Student  
**Technology:** Core Java (JDK 8+)  
**Interface:** Interactive Console Application  
**Data Storage:** In-Memory (`ArrayList`)  

---

## 📌 Project Overview

The **Exam Hall Allocator System** is a menu-driven Core Java console application developed to automate the manual, time-consuming, and error-prone process of allocating examination halls and seats to college students.

It provides robust input validation, duplicate detection, automated sequential seat generation (e.g., `A-01`, `B-01`), real-time hall capacity tracking, student searches, and detailed reports (both student-wise and hall-wise).

---

## 🌐 Fullstack Web Application & Vercel Deployment

In addition to the Core Java console application, a complete **Full-stack Web Edition** has been built and deployed live to **Vercel** with a serverless Node.js backend and an interactive frontend!

- **Live Production URL:** [https://exam-hall-allocator.vercel.app](https://exam-hall-allocator.vercel.app)
- **Vercel Project Dashboard:** [https://vercel.com/selvakumar24008-1005s-projects/exam-hall-allocator](https://vercel.com/selvakumar24008-1005s-projects/exam-hall-allocator)
- **Local Web Server:** `npm start` or `node server.js` (runs on `http://localhost:3000`)

### Serverless API Endpoints (`api/`):
- `GET /api/students` — Fetch all registered students
- `POST /api/students` — Add single student OR batch import from Excel/CSV (with duplicate detection)
- `GET /api/halls` & `POST /api/halls` — Hall management with capacity validation
- `POST /api/allocate` — Automatic sequential seat allocation engine
- `GET /api/search?regNo=IT101` — Instant student allocation lookup
- `GET /api/reports` — Student-wise & Hall-wise seating reports
- `POST /api/sample-data` — Preload Section 8 test data (`IT101`-`IT105`, `HALL-1`, `HALL-2`)
- `POST /api/reset` — Reset allocations or factory reset
- `GET /api/export` — Plaintext seating report export

### 📊 Excel / CSV Student Import
- Supported formats: `.xlsx`, `.xls`, `.csv`.
- Automatic column header detection (`Register Number` / `Reg No`, `Student Name` / `Name`, `Department` / `Dept`).
- Live spreadsheet preview table showing row validation before committing.
- One-click template download (`sample_students.csv`).
- Automatic duplicate detection (skips existing records and notifies user).

---

## 📂 Project Structure

```text
java mini project/
│
├── Student.java          # Core Java Model: Student details & allocation state
├── ExamHall.java         # Core Java Model: Hall details & capacity metrics
├── Allocator.java        # Core Java Controller: Allocation engine & validation
├── Main.java             # Core Java View: Interactive console menu
│
├── api/                  # Vercel Serverless Backend Functions
│   ├── state.js          # Shared in-memory & file-persisted business logic
│   ├── students.js       # Student API handler
│   ├── halls.js          # Exam halls API handler
│   ├── allocate.js       # Automated seat allocation API
│   ├── search.js         # Student query lookup API
│   ├── reports.js        # Seating reports API
│   ├── sample-data.js    # Demo data loader API
│   ├── reset.js          # Reset handler API
│   └── export.js         # Seating report text exporter
│
├── public/               # Frontend Assets (Vanilla HTML/CSS/JS)
│   ├── index.html        # Academic dashboard UI
│   ├── styles.css        # Modern dark-mode glassmorphic design
│   └── app.js            # Reactive client-side logic & API integration
│
├── server.js             # Local development server (http://localhost:3000)
├── vercel.json           # Vercel production deployment configuration
├── package.json          # Node project manifest
├── PROJECT_REPORT.md     # 19-Section academic mini-project documentation
└── README.md             # Project guide & quickstart
```

---

## 🚀 How to Compile and Run

### Option A: Using Command Prompt or PowerShell

1. Open **Command Prompt** (`cmd`) or **PowerShell**.
2. Navigate to the project directory:
   ```bash
   cd "c:\Users\SELVAKUMAR B\Downloads\java mini project"
   ```
3. Compile all Java source files:
   ```bash
   javac *.java
   ```
4. Run the application:
   ```bash
   java Main
   ```

### Option B: Using Visual Studio Code (VS Code)

1. Open VS Code.
2. Go to **File -> Open Folder...** and select `c:\Users\SELVAKUMAR B\Downloads\java mini project`.
3. Open `Main.java`.
4. Click the **Run** button (▶️) at the top right, or press `F5` / `Ctrl + F5`.
5. Interact with the application in the integrated terminal.

### Option C: Using Eclipse IDE / IntelliJ IDEA

1. Create a new Java Project named `ExamHallAllocator`.
2. Copy the four `.java` files into the `src` folder.
3. Right-click `Main.java` -> **Run As** -> **Java Application**.

---

## 📋 Menu Options Reference

```text
===== EXAM HALL ALLOCATOR =====
1. Add Student                 -> Register a new student (Reg No, Name, Dept)
2. Add Examination Hall        -> Add a hall with maximum seating capacity
3. Allocate Seats Automatically -> Run the sequential seat allocation engine
4. View All Students           -> View complete tabular register of students
5. View Seating Arrangement    -> View Student-wise & Hall-wise seating plans
6. Search Student              -> Look up student allocation by Register Number
7. View Hall Availability      -> Check capacity, occupied & available seats per hall
8. Exit                        -> Safely exit the application
===============================
[Bonus Viva Demo Feature]
9. Load Sample Test Data       -> One-click load for IT101-IT105 & HALL-1, HALL-2
10. Export Seating to File     -> Save report to SeatingReport.txt
```

---

## 🧪 Quick Viva Demonstration Script

1. Start the program: `java Main`.
2. Enter **`9`** to auto-load the 5 standard test students and 2 halls.
3. Enter **`4`** to show that all 5 students are currently **Unallocated**.
4. Enter **`7`** to show that both halls currently have **0 occupied seats**.
5. Enter **`3`** to trigger automatic seat allocation:
   - `IT101` -> `HALL-1` -> `A-01`
   - `IT102` -> `HALL-1` -> `A-02`
   - `IT103` -> `HALL-1` -> `A-03` (HALL-1 full!)
   - `IT104` -> `HALL-2` -> `B-01`
   - `IT105` -> `HALL-2` -> `B-02` (HALL-2 full!)
6. Enter **`5`** to display the two-part report:
   - Report 1: Student-wise table.
   - Report 2: Hall-wise table.
7. Enter **`6`** and search for `IT103` (displays hall and seat `A-03`).
8. Enter **`1`** and try adding `IT101` again (demonstrates duplicate rejection).
9. Enter **`8`** to safely exit.
