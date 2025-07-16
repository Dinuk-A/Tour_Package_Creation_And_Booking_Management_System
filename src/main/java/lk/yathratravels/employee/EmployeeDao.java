package lk.yathratravels.employee;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface EmployeeDao extends JpaRepository<Employee, Integer> {

    // create next emp_code
    @Query(value = "select lpad(max(emptbl.emp_code)+1,4,0) as emp_code from newyathra.employee as emptbl;", nativeQuery = true)
    public String getNextEmpCode();

    // get the employee, when NIC is given
    @Query(value = "select e from Employee e where e.nic =?1")
    public Employee getEmployeeByNIC(String nic);

    // get the employee, when email is given
    @Query(value = "select e from Employee e where e.email =?1")
    public Employee getEmployeeByEmail(String email);

    // get the employee, when mobile number is given
    @Query(value = "select e from Employee e where e.mobilenum =?1")
    public Employee getEmployeeByMobileNum(String mobilenum);

    // get employees who dont have an user account (OLD, NOT USED)
    @Query(value = "select e from Employee e where e.id not in (select u.employee_id.id from User u)")
    public List<Employee> getEmpsWithoutAccountOld();

    // get active(non deleted) employees who dont have an user account
    @Query("SELECT e FROM Employee e WHERE (e.deleted_emp = false OR e.deleted_emp IS NULL) AND e.id NOT IN (SELECT u.employee_id.id FROM User u)")
    public List<Employee> getEmpsWithoutAccountAndNotDeleted();

    // ANOTHER WAY
    /*
     * @Query(value = "select e from Employee e where e.email=:email")
     * public Employee getEmpByEmail(@Param("email") String email);
     */

    // get only non deleted emps
    @Query("SELECT e FROM Employee e WHERE e.deleted_emp = false OR e.deleted_emp IS NULL")
    public List<Employee> getNonDeletedEmployees();

    // get all employees except the system admin
    @Query(value = "select emp from Employee emp where emp.designation_id.name <> 'Admin'")
    public List<Employee> getAllEmployeesExceptAdmin();

    // not used
    @Query("SELECT e FROM Employee e WHERE (e.deleted_emp = false OR e.deleted_emp IS NULL) AND e.designation_id.name <> 'Admin'")
    public List<Employee> getAllNonDeletedEmployeesExceptAdmin();

    // get emps to assign to inquiries
    @Query("SELECT e FROM Employee e WHERE (e.deleted_emp = false OR e.deleted_emp IS NULL) AND e.designation_id.name IN ('Manager', 'Assistant Manager', 'Executive')")
    public List<Employee> getNonDeletedManagersAndAssistantsAndExecutives();

    // get all internal drivers who are available within the given date range
    @Query(value = """
                SELECT emp FROM Employee emp
                WHERE emp.designation_id.id = 6
                AND emp.emp_status = 'Working'
                AND emp.id NOT IN (
                    SELECT driver.id FROM Booking b
                    JOIN b.int_drivers driver
                    WHERE
                        (b.startdate BETWEEN ?1 AND ?2 OR b.enddate BETWEEN ?1 AND ?2)
                        AND b.booking_status NOT IN ('Deleted', 'Cancelled')
                )
            """)
    List<Employee> getAvailableDriversList(LocalDate startDate, LocalDate endDate);

    // get all internal guides who are available within the given date range
    @Query(value = """
                SELECT emp FROM Employee emp
                WHERE emp.designation_id.id = 7
                AND emp.emp_status = 'Working'
                AND emp.id NOT IN (
                    SELECT guide.id FROM Booking b
                    JOIN b.int_guides guide
                    WHERE
                        (b.startdate BETWEEN ?1 AND ?2 OR b.enddate BETWEEN ?1 AND ?2)
                        AND b.booking_status NOT IN ('Deleted', 'Cancelled')
                )
            """)
    List<Employee> getAvailableGuidesList(LocalDate startDate, LocalDate endDate);

    // to display in UIs (print,tables, etc)
    // get employee info by USER ID, NOT EMP ID
    @Query(value = "select new Employee(e.emp_code, e.fullname) from Employee e where e.id in (select u.employee_id.id from User u where u.id = ?1)")
    Employee getEmployeeInfoByUserId(Integer userId);

    // get employee info by EMP ID,NOT USER ID
    @Query(value = "select new Employee(e.emp_code, e.fullname) from Employee e where e.id = ?1")
    Employee getEmployeeInfoByEmpId(Integer empID);

    // get all emp's basic info, needed in inquiry assigning table
    @Query(value = "select new Employee(e.id, e.emp_code, e.fullname) from Employee e where  (e.deleted_emp is null or e.deleted_emp = false) and e.emp_status = 'Working' order by e.id")
    List<Employee> getAllEmployeeBasicInfo();

    // to used in inquiry assigning
    @Query(value = """
            SELECT e.id
            FROM newyathra.employee AS e
            LEFT JOIN newyathra.inquiry AS i ON i.assigned_empid = e.id AND i.inq_status = 'Assigned'
            WHERE e.designation_id = 5
              AND e.emp_status = 'Working'
              AND (e.deleted_emp IS NULL OR e.deleted_emp = FALSE)
            GROUP BY e.id
            HAVING COUNT(i.id) < 5
            ORDER BY COUNT(i.id) ASC
            LIMIT 1
            """, nativeQuery = true)
    Integer getLeastBusyAgent();

}
