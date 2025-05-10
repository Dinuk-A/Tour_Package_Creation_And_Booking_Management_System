package lk.yathratravels.employee;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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

}
