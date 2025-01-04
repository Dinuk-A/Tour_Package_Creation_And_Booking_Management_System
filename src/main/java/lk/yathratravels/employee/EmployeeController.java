package lk.yathratravels.employee;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import jakarta.transaction.Transactional;

@RestController
public class EmployeeController {

    @Autowired
    private EmployeeDao employeeDao;

    // display employee UI
    @RequestMapping(value = "/emp", method = RequestMethod.GET)
    public ModelAndView showEmployeeUI() {

        ModelAndView empView = new ModelAndView();
        empView.setViewName("employee.html");
        empView.addObject("title", "Yathra Employee");
        return empView;

    }

    // get all employee list from DB
    @GetMapping(value = "/emp/all", produces = "application/json")
    public List<Employee> getAllEmployees() {
        return employeeDao.findAll();
    }

    // save employee record on DB
    @PostMapping(value = "/emp")
    @Transactional
    public String saveEmployee(@RequestBody Employee employee) {

        // check duplications with entered nic
        if (employeeDao.getEmployeeByNIC(employee.getNic()) != null) {
            return "An Employee Record With This NIC Already Exists";
        }

        // check duplications with entered email
        if (employeeDao.getEmployeeByEmail(employee.getEmail()) != null) {
            return "An Employee Record With This Email Already Exists";
        }

        // check duplications with entered mobile
        if (employeeDao.getEmployeeByMobileNum(employee.getMobilenum()) != null) {
            return "An Employee Record With This Mobile Number Already Exists";
        }

        try {

            // generate emp_code
            String nextEmpCode = employeeDao.getNextEmpCode();

            if (nextEmpCode.equals(null) || nextEmpCode.equals("")) {
                employee.setEmp_code("00001");
            } else {
                employee.setEmp_code(nextEmpCode);
            }

            // alt === get max emp code from db here. conver to int , + 1

            employee.setAddeddatetime(LocalDateTime.now());
            employeeDao.save(employee);
            return "1";
        } catch (Exception e) {
            return "Error Saving Data: " + e.getMessage();
        }

    }

    // to update an existing employee record
    @PutMapping(value = "/emp")
    @Transactional
    public String updateEmployee(@RequestBody Employee employee) {

        // get the existing employee record by his ID(same as this passing ID)
        Employee existingEmployee = employeeDao.getReferenceById(employee.getId());

        // first check if the employee record exist or not
        // (should be exist except for accidental deletions in db table level)
        if (existingEmployee == null) {
            return "Update Not Completed : Employee Does Not Exists";
        }

        // storing this updating employee record's ID for duplication completions
        Integer idOfUpdatingEmployee = employee.getId();

        // check duplications with entered nic
        Employee anEmployeeByThisNIC = employeeDao.getEmployeeByNIC(employee.getNic());

        if (anEmployeeByThisNIC != null && anEmployeeByThisNIC.getId() != idOfUpdatingEmployee) {
            return "Update Not Completed, This NIC Exists in Another Employee Record Too";
        }

        // check duplications with entered email
        Employee anEmployeeByThisEmail = employeeDao.getEmployeeByEmail(employee.getEmail());

        if (anEmployeeByThisEmail != null && anEmployeeByThisEmail.getId() != employee.getId()) {
            return "Update Not Completed, This Email Exists in Another Employee Record Too";
        }

        // check duplications with entered mobile
        Employee anEmployeeByThisMobile = employeeDao.getEmployeeByMobileNum(employee.getMobilenum());

        if (anEmployeeByThisMobile != null && anEmployeeByThisEmail.getId() != employee.getId()) {
            return "Update Not Completed, This Mobile Number Exists in Another Employee Record Too";
        }

        try {
            employee.setLastmodifieddatetime(LocalDateTime.now());

            // if status is 0 (resigned) , user account 1th inactive karanna one

            // if status is 1, user acc eka active wenna one

            employeeDao.save(employee);
            return "OK";

        } catch (Exception e) {
            return "Update Not Completed Because :" + e.getMessage();
        }

    }

    // to delete an employee record
    @DeleteMapping(value = "/emp")
    @Transactional
    public String deleteEmployee(@RequestBody Employee employee) {

        // get the existing employee record by his ID(same as this passing ID)
        Employee existingEmployee = employeeDao.getReferenceById(employee.getId());

        // first check if the employee record exist or not
        // (should be exist except for previous accidental deletions in db table level)
        if (existingEmployee == null) {
            return "Delete Not Completed : Employee Does Not Exists";
        }

        try {
            existingEmployee.setEmp_isdeleted(true);
            existingEmployee.setDeleteddatetime(LocalDateTime.now());
            employeeDao.save(existingEmployee);
            return "OK";
        } catch (Exception e) {
            return "Delete Not Completed " + e.getMessage();
        }

    }

}
