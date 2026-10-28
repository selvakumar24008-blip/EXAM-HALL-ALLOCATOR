/**
 * Project: Exam Hall Allocator System
 * File: Student.java
 * Description: Represents an individual student with academic details
 *              and seat allocation status.
 * Author: 2nd-Year B.Tech IT Student
 */
public class Student {
    // Private attributes (Encapsulation)
    private String regNo;
    private String name;
    private String department;
    private boolean isAllocated;
    private String allocatedHall;
    private String seatNumber;

    /**
     * Parameterized Constructor to initialize a new student.
     * Initially, the student is not allocated to any hall or seat.
     *
     * @param regNo      Student register number (e.g., "IT101")
     * @param name       Student full name (e.g., "Student A")
     * @param department Department name (e.g., "IT", "CSE")
     */
    public Student(String regNo, String name, String department) {
        this.regNo = regNo.trim();
        this.name = name.trim();
        this.department = department.trim().toUpperCase();
        this.isAllocated = false;
        this.allocatedHall = "Not Assigned";
        this.seatNumber = "Not Assigned";
    }

    // --- Getter Methods ---

    public String getRegNo() {
        return regNo;
    }

    public String getName() {
        return name;
    }

    public String getDepartment() {
        return department;
    }

    public boolean isAllocated() {
        return isAllocated;
    }

    public String getAllocatedHall() {
        return allocatedHall;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    // --- Allocation Control Methods ---

    /**
     * Assigns a hall and seat number to this student.
     *
     * @param hallNo Examination hall number
     * @param seat   Sequential seat code (e.g., "A-01")
     */
    public void allocateSeat(String hallNo, String seat) {
        this.allocatedHall = hallNo;
        this.seatNumber = seat;
        this.isAllocated = true;
    }

    /**
     * Resets the allocation status back to unassigned.
     */
    public void resetAllocation() {
        this.allocatedHall = "Not Assigned";
        this.seatNumber = "Not Assigned";
        this.isAllocated = false;
    }

    /**
     * Returns a formatted string representation of the student.
     */
    @Override
    public String toString() {
        return String.format("%-10s | %-18s | %-8s | %-12s | %-10s | %-8s",
                regNo, name, department,
                (isAllocated ? "Allocated" : "Unallocated"),
                allocatedHall, seatNumber);
    }
}
