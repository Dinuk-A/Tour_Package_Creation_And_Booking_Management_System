package lk.yathratravels.employee;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.security.core.Authentication;

import jakarta.transaction.Transactional;
import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeController;
import lk.yathratravels.privilege.PrivilegeServices;

@RestController
public class EmployeeController {

    @Autowired
    private EmployeeDao employeeDao;

    @Autowired
    private PrivilegeServices privilegeService;

    // display employee UI
    @RequestMapping(value = "/emp", method = RequestMethod.GET)
    public ModelAndView showEmployeeUI() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "EMPLOYEE");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            ModelAndView lost = new ModelAndView();
            lost.setViewName("lost.html");
            return lost;
        } else {
            ModelAndView empView = new ModelAndView();
            empView.setViewName("employee.html");
            empView.addObject("loggedusername", auth.getName());
            empView.addObject("title", "Yathra Employee");
            empView.addObject("moduleName", "Employee Management");
            return empView;
        }
    }

    // get all employee list from DB
    @GetMapping(value = "/emp/all", produces = "application/json")
    public List<Employee> getAllEmployees() {
        return employeeDao.findAll();
    }

    //get employees who dont have an user account
    @GetMapping(value = "/emp/listwithoutuseracc", produces = "application/json")
    public List<Employee> showEmpsWOUserAccs(){
        return employeeDao.getEmpsWithoutAccount();
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
            return "OK";
        } catch (Exception e) {
            return "Error Saving Data: " + e.getMessage();
        }

    }

    // to update an existing employee record
    @PutMapping(value = "/emp")
    @Transactional
    public String updateEmployee(@RequestBody Employee employee) {

        // storing this updating employee record's ID for duplication completions
        Integer idOfUpdatingEmployee = employee.getId();

        // get the existing employee record by his ID(same as this passing ID)
        Employee existingEmployee = employeeDao.getReferenceById(idOfUpdatingEmployee);

        // first check if the employee record exist or not
        // (should be exist except for accidental deletions in db table level)
        if (existingEmployee == null) {
            return "Update Not Completed : Employee Does Not Exists";
        }

        // check duplications with entered nic
        Employee anEmployeeByThisNIC = employeeDao.getEmployeeByNIC(employee.getNic());
        if (anEmployeeByThisNIC != null) {
            if (anEmployeeByThisNIC.getId() != idOfUpdatingEmployee) {
                return "Update Not Completed, This NIC Exists in Another Employee Record Too";
            }
        }

        // check duplications with entered email
        Employee anEmployeeByThisEmail = employeeDao.getEmployeeByEmail(employee.getEmail());
        if (anEmployeeByThisEmail != null) {
            if (anEmployeeByThisEmail.getId() != idOfUpdatingEmployee) {
                return "Update Not Completed, This Email Exists in Another Employee Record Too";
            }
        }

        // check duplications with entered mobile
        Employee anEmployeeByThisMobile = employeeDao.getEmployeeByMobileNum(employee.getMobilenum());
        if (anEmployeeByThisMobile != null) {
            if (anEmployeeByThisMobile.getId() != idOfUpdatingEmployee) {
                return "Update Not Completed, This Mobile Number Exists in Another Employee Record Too";
            }
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
    // @Transactional
    public String deleteEmployee(@RequestBody Employee employee) {

        // get the existing employee record by his ID(same as this passing ID)
        Employee existingEmployee = employeeDao.getReferenceById(employee.getId());

        // first check if the employee record exist or not
        // (should be exist except for previous accidental deletions in db table level)
        if (existingEmployee == null) {
            return "Delete Not Completed : Employee Does Not Exists";
        }

        try {
            //❌ not finished
            existingEmployee.setDeleteddatetime(LocalDateTime.now());
            employeeDao.save(existingEmployee);
            return "OK";
        } catch (Exception e) {
            return "Delete Not Completed " + e.getMessage();
        }

    }

}
