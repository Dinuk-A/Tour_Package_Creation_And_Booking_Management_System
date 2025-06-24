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

    // get all drivers who are available within the given date range
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
    
    // get all guides who are available within the given date range
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
    

    @Query(value = "select new Employee(e.emp_code, e.fullname) from Employee e where e.id in (select u.employee_id.id from User u where u.id = ?1)")
    Employee getEmployeeInfoByUserId(Integer userId);

}
