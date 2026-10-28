import java.util.ArrayList;

/**
 * Project: Exam Hall Allocator System
 * File: ExamHall.java
 * Description: Represents an examination hall with its seating capacity
 *              and list of assigned students.
 * Author: 2nd-Year B.Tech IT Student
 */
public class ExamHall {
    // Private attributes (Encapsulation)
    private String hallNo;
    private int capacity;
    private ArrayList<Student> allocatedStudents;

    /**
     * Parameterized Constructor to initialize an examination hall.
     *
     * @param hallNo   Unique hall identifier (e.g., "HALL-1")
     * @param capacity Maximum seating capacity (must be positive integer)
     */
    public ExamHall(String hallNo, int capacity) {
        this.hallNo = hallNo.trim().toUpperCase();
        this.capacity = capacity;
        this.allocatedStudents = new ArrayList<Student>();
    }

    // --- Getter Methods ---

    public String getHallNo() {
        return hallNo;
    }

    public int getCapacity() {
        return capacity;
    }

    public ArrayList<Student> getAllocatedStudents() {
        return allocatedStudents;
    }

    /**
     * Returns the count of occupied seats in this hall.
     */
    public int getOccupiedSeats() {
        return allocatedStudents.size();
    }

    /**
     * Returns the count of remaining available seats in this hall.
     */
    public int getAvailableSeats() {
        return capacity - allocatedStudents.size();
    }

    /**
     * Checks if the hall has reached its maximum seating capacity.
     */
    public boolean isFull() {
        return getOccupiedSeats() >= capacity;
    }

    /**
     * Assigns a student to this hall and records the seat number.
     *
     * @param student The student being allocated
     * @param seatNo  Sequential seat identifier (e.g., "A-01")
     * @return true if student was successfully seated, false if hall is full
     */
    public boolean assignStudent(Student student, String seatNo) {
        if (isFull()) {
            return false;
        }
        student.allocateSeat(this.hallNo, seatNo);
        allocatedStudents.add(student);
        return true;
    }

    /**
     * Clears all student allocations from this hall.
     */
    public void clearAllocations() {
        for (Student s : allocatedStudents) {
            s.resetAllocation();
        }
        allocatedStudents.clear();
    }

    /**
     * Displays current availability metrics for this hall.
     */
    public void printHallStatus() {
        System.out.println("----------------------------------------");
        System.out.println("Hall: " + hallNo);
        System.out.println("Total Capacity: " + capacity);
        System.out.println("Occupied Seats: " + getOccupiedSeats());
        System.out.println("Available Seats: " + getAvailableSeats());
        System.out.print("Assigned Students: ");
        if (allocatedStudents.isEmpty()) {
            System.out.println("None");
        } else {
            System.out.println();
            for (Student s : allocatedStudents) {
                System.out.println("   -> " + s.getRegNo() + " (" + s.getName() + ") - Seat: " + s.getSeatNumber());
            }
        }
    }
}
