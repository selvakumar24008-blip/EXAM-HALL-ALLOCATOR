import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;

public class Allocator {
    private ArrayList<Student> studentList;
    private ArrayList<ExamHall> hallList;

    public Allocator() {
        this.studentList = new ArrayList<Student>();
        this.hallList = new ArrayList<ExamHall>();
    }

    // --- Helper Validation Methods ---

    /**
     * Finds a student by register number.
     *
     * @param regNo Register number to search
     * @return Student object if found, null otherwise
     */
    public Student findStudent(String regNo) {
        if (regNo == null)
            return null;
        for (Student s : studentList) {
            if (s.getRegNo().equalsIgnoreCase(regNo.trim())) {
                return s;
            }
        }
        return null;
    }

    /**
     * Finds an exam hall by hall number.
     *
     * @param hallNo Hall number to search
     * @return ExamHall object if found, null otherwise
     */
    public ExamHall findHall(String hallNo) {
        if (hallNo == null)
            return null;
        for (ExamHall h : hallList) {
            if (h.getHallNo().equalsIgnoreCase(hallNo.trim())) {
                return h;
            }
        }
        return null;
    }

    // --- Functional Option 1: Add Student ---

    /**
     * Adds a new student after validating register number, name, and duplicates.
     */
    public boolean addStudent(String regNo, String name, String dept) {
        // Validate empty or null inputs
        if (regNo == null || regNo.trim().isEmpty()) {
            System.out.println("[ERROR] Register number cannot be empty!");
            return false;
        }
        if (name == null || name.trim().isEmpty()) {
            System.out.println("[ERROR] Student name cannot be empty!");
            return false;
        }
        if (dept == null || dept.trim().isEmpty()) {
            System.out.println("[ERROR] Department cannot be empty!");
            return false;
        }

        // Validate duplicate register number
        if (findStudent(regNo) != null) {
            System.out.println("[ERROR] Student with Register Number '" + regNo.trim() + "' already exists!");
            return false;
        }

        // Create and store new student
        Student newStudent = new Student(regNo, name, dept);
        studentList.add(newStudent);
        System.out.println(
                "[SUCCESS] Student '" + newStudent.getName() + "' (" + newStudent.getRegNo() + ") added successfully.");
        return true;
    }

    // --- Functional Option 2: Add Examination Hall ---

    /**
     * Adds a new examination hall after validating hall number and positive
     * capacity.
     */
    public boolean addHall(String hallNo, int capacity) {
        // Validate empty hall number
        if (hallNo == null || hallNo.trim().isEmpty()) {
            System.out.println("[ERROR] Hall number cannot be empty!");
            return false;
        }

        // Validate positive capacity
        if (capacity <= 0) {
            System.out.println("[ERROR] Hall capacity must be a positive integer greater than zero!");
            return false;
        }

        // Validate duplicate hall number
        if (findHall(hallNo) != null) {
            System.out.println("[ERROR] Examination Hall '" + hallNo.trim().toUpperCase() + "' already exists!");
            return false;
        }

        // Create and store new hall
        ExamHall newHall = new ExamHall(hallNo, capacity);
        hallList.add(newHall);
        System.out.println(
                "[SUCCESS] Hall '" + newHall.getHallNo() + "' with capacity " + capacity + " added successfully.");
        return true;
    }

    // --- Functional Option 3: Automatic Seat Allocation ---

    /**
     * Automatically assigns registered students to available examination halls.
     * Follows sequential hall-by-hall filling with prefix-based seat numbers (e.g.,
     * A-01, B-01).
     */
    public void allocateSeats() {
        if (studentList.isEmpty()) {
            System.out.println("[WARNING] No students registered in the system. Please add students first!");
            return;
        }

        if (hallList.isEmpty()) {
            System.out.println("[WARNING] No examination halls available. Please add halls first!");
            return;
        }

        // Reset all previous allocations to guarantee a clean, sequential distribution
        for (ExamHall hall : hallList) {
            hall.clearAllocations();
        }
        for (Student student : studentList) {
            student.resetAllocation();
        }

        System.out.println("\n--------------------------------------------------");
        System.out.println("       AUTOMATIC SEAT ALLOCATION IN PROGRESS      ");
        System.out.println("--------------------------------------------------");

        int currentHallIndex = 0;
        int allocatedCount = 0;
        int totalCapacity = 0;

        for (ExamHall h : hallList) {
            totalCapacity += h.getCapacity();
        }

        // Sequential allocation loop
        for (Student student : studentList) {
            // Find next hall that has vacant seats
            while (currentHallIndex < hallList.size() && hallList.get(currentHallIndex).isFull()) {
                currentHallIndex++;
            }

            // If all halls are completely filled
            if (currentHallIndex >= hallList.size()) {
                break;
            }

            ExamHall currentHall = hallList.get(currentHallIndex);
            // Generate seat label: e.g. Hall 0 -> 'A', Hall 1 -> 'B', etc.
            char hallLetter = (char) ('A' + (currentHallIndex % 26));
            int nextSeatIndex = currentHall.getOccupiedSeats() + 1;
            String seatNumber = String.format("%c-%02d", hallLetter, nextSeatIndex);

            // Assign student
            currentHall.assignStudent(student, seatNumber);
            allocatedCount++;
        }

        // Display Allocation Summary
        System.out.println("\n===== ALLOCATION SUMMARY =====");
        System.out.println("Total Students Registered : " + studentList.size());
        System.out.println("Total Examination Capacity: " + totalCapacity);
        System.out.println("Students Allocated        : " + allocatedCount);

        int unallocatedCount = studentList.size() - allocatedCount;
        System.out.println("Unallocated Students      : " + unallocatedCount);

        // Report unallocated students if capacity is insufficient
        if (unallocatedCount > 0) {
            System.out
                    .println("\n[ALERT] Insufficient Seating Capacity! The following students could not be allocated:");
            for (Student s : studentList) {
                if (!s.isAllocated()) {
                    System.out.println("   - Reg No: " + s.getRegNo() + " | Name: " + s.getName() + " | Dept: "
                            + s.getDepartment());
                }
            }
        } else {
            System.out.println("\n[SUCCESS] All students successfully allocated to examination halls!");
        }
    }

    // --- Functional Option 4: View All Students ---

    /**
     * Displays all registered students in a formatted tabular layout.
     */
    public void viewAllStudents() {
        if (studentList.isEmpty()) {
            System.out.println("[INFO] No students have been registered yet.");
            return;
        }

        System.out.println(
                "\n==========================================================================================");
        System.out
                .println("                                REGISTERED STUDENTS LIST                                  ");
        System.out
                .println("==========================================================================================");
        System.out.printf("%-12s | %-20s | %-12s | %-14s | %-12s | %-10s%n",
                "Reg No", "Student Name", "Department", "Status", "Hall No", "Seat No");
        System.out
                .println("------------------------------------------------------------------------------------------");

        for (Student s : studentList) {
            System.out.printf("%-12s | %-20s | %-12s | %-14s | %-12s | %-10s%n",
                    s.getRegNo(),
                    s.getName(),
                    s.getDepartment(),
                    (s.isAllocated() ? "Allocated" : "Unallocated"),
                    s.getAllocatedHall(),
                    s.getSeatNumber());
        }
        System.out
                .println("==========================================================================================");
        System.out.println("Total Registered Students: " + studentList.size());
    }

    // --- Functional Option 5: View Seating Arrangement ---

    /**
     * Displays complete seating reports: both student-wise and hall-wise views.
     */
    public void viewSeatingArrangement() {
        boolean hasAllocatedStudents = false;
        for (Student s : studentList) {
            if (s.isAllocated()) {
                hasAllocatedStudents = true;
                break;
            }
        }

        if (!hasAllocatedStudents) {
            System.out
                    .println("[INFO] No seats have been allocated yet. Please choose Option 3 (Allocate Seats) first.");
            return;
        }

        // 1. Student-wise Seating Report
        System.out.println(
                "\n==========================================================================================");
        System.out
                .println("                        REPORT 1: STUDENT-WISE SEATING ARRANGEMENT                        ");
        System.out
                .println("==========================================================================================");
        System.out.printf("%-12s | %-20s | %-12s | %-12s | %-10s%n",
                "Reg No", "Student Name", "Department", "Hall No", "Seat No");
        System.out
                .println("------------------------------------------------------------------------------------------");

        for (Student s : studentList) {
            if (s.isAllocated()) {
                System.out.printf("%-12s | %-20s | %-12s | %-12s | %-10s%n",
                        s.getRegNo(), s.getName(), s.getDepartment(), s.getAllocatedHall(), s.getSeatNumber());
            }
        }
        System.out
                .println("------------------------------------------------------------------------------------------");

        // 2. Hall-wise Seating Report
        System.out.println(
                "\n==========================================================================================");
        System.out
                .println("                         REPORT 2: HALL-WISE SEATING ARRANGEMENT                          ");
        System.out
                .println("==========================================================================================");

        for (ExamHall hall : hallList) {
            System.out.println("\n>>> EXAMINATION HALL: " + hall.getHallNo() + " (Capacity: " + hall.getCapacity()
                    + ", Occupied: " + hall.getOccupiedSeats() + ")");
            if (hall.getAllocatedStudents().isEmpty()) {
                System.out.println("    [No students allocated to this hall]");
            } else {
                System.out.printf("    %-10s | %-12s | %-20s | %-10s%n", "Seat No", "Reg No", "Student Name", "Dept");
                System.out.println("    ------------------------------------------------------------");
                for (Student s : hall.getAllocatedStudents()) {
                    System.out.printf("    %-10s | %-12s | %-20s | %-10s%n",
                            s.getSeatNumber(), s.getRegNo(), s.getName(), s.getDepartment());
                }
            }
        }
        System.out
                .println("==========================================================================================");
    }

    // --- Functional Option 6: Search Student ---

    /**
     * Searches for a student by register number and displays their allocation
     * status.
     */
    public void searchStudent(String regNo) {
        if (regNo == null || regNo.trim().isEmpty()) {
            System.out.println("[ERROR] Search register number cannot be empty!");
            return;
        }

        Student student = findStudent(regNo);
        if (student == null) {
            System.out.println(
                    "[RESULT] Student with Register Number '" + regNo.trim() + "' does not exist in the system.");
            return;
        }

        System.out.println("\n----------------- STUDENT DETAILS -----------------");
        System.out.println("Register Number  : " + student.getRegNo());
        System.out.println("Student Name     : " + student.getName());
        System.out.println("Department       : " + student.getDepartment());
        System.out.println("Allocation Status: " + (student.isAllocated() ? "ALLOCATED" : "NOT ALLOCATED"));
        System.out.println("Examination Hall : " + student.getAllocatedHall());
        System.out.println("Assigned Seat No : " + student.getSeatNumber());
        System.out.println("---------------------------------------------------");
    }

    // --- Functional Option 7: View Hall Availability ---

    /**
     * Displays capacity, occupied seats, remaining seats, and seated students for
     * all halls.
     */
    public void viewHallAvailability() {
        if (hallList.isEmpty()) {
            System.out.println("[INFO] No examination halls registered yet.");
            return;
        }

        System.out.println("\n==================================================");
        System.out.println("            EXAM HALL AVAILABILITY REPORT         ");
        System.out.println("==================================================");

        int totalHalls = hallList.size();
        int totalCapacity = 0;
        int totalOccupied = 0;

        for (ExamHall hall : hallList) {
            hall.printHallStatus();
            totalCapacity += hall.getCapacity();
            totalOccupied += hall.getOccupiedSeats();
        }

        System.out.println("----------------------------------------");
        System.out.println("Total Registered Halls : " + totalHalls);
        System.out.println("Total Combined Capacity: " + totalCapacity);
        System.out.println("Total Occupied Seats   : " + totalOccupied);
        System.out.println("Total Remaining Seats  : " + (totalCapacity - totalOccupied));
        System.out.println("==================================================");
    }

    // --- Optional Feature: Export Seating Report to Text File ---

    /**
     * Saves the current seating report to a readable text file.
     *
     * @param fileName File path/name (e.g., "SeatingArrangementReport.txt")
     */
    public boolean exportSeatingReportToFile(String fileName) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(fileName))) {
            writer.println(
                    "==========================================================================================");
            writer.println(
                    "                           EXAM HALL SEATING ARRANGEMENT REPORT                           ");
            writer.println(
                    "==========================================================================================");
            writer.printf("%-12s | %-20s | %-12s | %-12s | %-10s%n",
                    "Reg No", "Student Name", "Department", "Hall No", "Seat No");
            writer.println(
                    "------------------------------------------------------------------------------------------");

            for (Student s : studentList) {
                if (s.isAllocated()) {
                    writer.printf("%-12s | %-20s | %-12s | %-12s | %-10s%n",
                            s.getRegNo(), s.getName(), s.getDepartment(), s.getAllocatedHall(), s.getSeatNumber());
                }
            }
            writer.println(
                    "==========================================================================================");
            writer.println("Generated successfully by Exam Hall Allocator System.");
            System.out.println("[SUCCESS] Seating arrangement exported to file: " + fileName);
            return true;
        } catch (IOException e) {
            System.out.println("[ERROR] Failed to export report to file: " + e.getMessage());
            return false;
        }
    }

    // --- Utility: Load Sample Test Data ---

    /**
     * Preloads standard test data matching Section 8 of the project requirements:
     * Students: IT101 to IT105
     * Halls: HALL-1 (Cap 3), HALL-2 (Cap 2)
     */
    public void loadSampleData() {
        // Clear existing data
        studentList.clear();
        hallList.clear();

        // Add 5 Sample Students
        studentList.add(new Student("IT101", "Student A", "IT"));
        studentList.add(new Student("IT102", "Student B", "IT"));
        studentList.add(new Student("IT103", "Student C", "IT"));
        studentList.add(new Student("IT104", "Student D", "CSE"));
        studentList.add(new Student("IT105", "Student E", "CSE"));

        // Add 2 Sample Halls
        hallList.add(new ExamHall("HALL-1", 3));
        hallList.add(new ExamHall("HALL-2", 2));

        System.out.println("[SUCCESS] Sample test data loaded successfully!");
        System.out.println("   - 5 Students loaded: IT101, IT102, IT103, IT104, IT105");
        System.out.println("   - 2 Halls loaded: HALL-1 (Capacity 3), HALL-2 (Capacity 2)");
    }

    // --- Getters for counts ---
    public int getStudentCount() {
        return studentList.size();
    }

    public int getHallCount() {
        return hallList.size();
    }
}
