import java.util.Scanner;

/**
 * Project: Exam Hall Allocator System
 * File: Main.java
 * Description: Console-based interactive user interface with a menu-driven
 *              loop handling user inputs, validation, and calling Allocator services.
 * Author: 2nd-Year B.Tech IT Student
 */
public class Main {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Allocator allocator = new Allocator();
        boolean running = true;

        System.out.println("==================================================");
        System.out.println("   WELCOME TO EXAM HALL ALLOCATOR SYSTEM (v1.0)   ");
        System.out.println("      Developed for College Exam Administration    ");
        System.out.println("==================================================");

        while (running) {
            printMenu();
            System.out.print("Enter your choice: ");
            String choiceInput = scanner.nextLine().trim();

            int choice;
            try {
                choice = Integer.parseInt(choiceInput);
            } catch (NumberFormatException e) {
                System.out.println("\n[ERROR] Invalid choice! Please enter a number between 1 and 8.\n");
                continue;
            }

            switch (choice) {
                case 1:
                    handleAddStudent(scanner, allocator);
                    break;

                case 2:
                    handleAddHall(scanner, allocator);
                    break;

                case 3:
                    handleAllocateSeats(allocator);
                    break;

                case 4:
                    allocator.viewAllStudents();
                    break;

                case 5:
                    allocator.viewSeatingArrangement();
                    break;

                case 6:
                    handleSearchStudent(scanner, allocator);
                    break;

                case 7:
                    allocator.viewHallAvailability();
                    break;

                case 8:
                    running = false;
                    System.out.println("\n==================================================");
                    System.out.println("Thank you for using Exam Hall Allocator System!");
                    System.out.println("System terminated safely. Have a great day.");
                    System.out.println("==================================================");
                    break;

                // Bonus helper option for quick viva demonstration
                case 9:
                    System.out.println("\n[DEMO] Loading standard presentation test data...");
                    allocator.loadSampleData();
                    break;

                case 10:
                    System.out.print("Enter export filename (default: SeatingReport.txt): ");
                    String filename = scanner.nextLine().trim();
                    if (filename.isEmpty()) {
                        filename = "SeatingReport.txt";
                    }
                    allocator.exportSeatingReportToFile(filename);
                    break;

                default:
                    System.out.println("\n[ERROR] Invalid option selected! Please choose between 1 and 8.\n");
                    break;
            }

            // Pause before showing menu again (unless exiting)
            if (running) {
                System.out.println("\nPress [ENTER] to return to the main menu...");
                scanner.nextLine();
            }
        }

        scanner.close();
    }

    /**
     * Displays the main menu according to project requirements.
     */
    private static void printMenu() {
        System.out.println("\n===== EXAM HALL ALLOCATOR =====");
        System.out.println("1. Add Student");
        System.out.println("2. Add Examination Hall");
        System.out.println("3. Allocate Seats Automatically");
        System.out.println("4. View All Students");
        System.out.println("5. View Seating Arrangement");
        System.out.println("6. Search Student");
        System.out.println("7. View Hall Availability");
        System.out.println("8. Exit");
        System.out.println("===============================");
        System.out.println("[Tip: Enter 9 to auto-load sample test data for viva demo]");
    }

    /**
     * Handles user interaction for Option 1: Add Student.
     */
    private static void handleAddStudent(Scanner scanner, Allocator allocator) {
        System.out.println("\n--- [OPTION 1: ADD STUDENT] ---");
        System.out.print("Enter Register Number (e.g., IT101): ");
        String regNo = scanner.nextLine();

        System.out.print("Enter Student Name (e.g., Student A): ");
        String name = scanner.nextLine();

        System.out.print("Enter Department (e.g., IT, CSE, ECE): ");
        String dept = scanner.nextLine();

        allocator.addStudent(regNo, name, dept);
    }

    /**
     * Handles user interaction for Option 2: Add Examination Hall.
     */
    private static void handleAddHall(Scanner scanner, Allocator allocator) {
        System.out.println("\n--- [OPTION 2: ADD EXAMINATION HALL] ---");
        System.out.print("Enter Hall Number (e.g., HALL-1): ");
        String hallNo = scanner.nextLine();

        System.out.print("Enter Maximum Seat Capacity: ");
        String capInput = scanner.nextLine().trim();

        int capacity;
        try {
            capacity = Integer.parseInt(capInput);
        } catch (NumberFormatException e) {
            System.out.println("[ERROR] Invalid capacity! Please enter a valid positive integer number.");
            return;
        }

        allocator.addHall(hallNo, capacity);
    }

    /**
     * Handles user interaction for Option 3: Automatic Seat Allocation.
     */
    private static void handleAllocateSeats(Allocator allocator) {
        allocator.allocateSeats();
    }

    /**
     * Handles user interaction for Option 6: Search Student.
     */
    private static void handleSearchStudent(Scanner scanner, Allocator allocator) {
        System.out.println("\n--- [OPTION 6: SEARCH STUDENT] ---");
        System.out.print("Enter Register Number to Search: ");
        String regNo = scanner.nextLine();
        allocator.searchStudent(regNo);
    }
}
