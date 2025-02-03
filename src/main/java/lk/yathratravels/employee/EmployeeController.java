package lk.yathratravels.employee;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.Role;
import lk.yathratravels.user.RoleDao;
import lk.yathratravels.user.User;
import lk.yathratravels.user.UserDao;

@RestController
public class EmployeeController {

    @Autowired
    private EmployeeDao employeeDao;

    @Autowired
    private PrivilegeServices privilegeService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private RoleDao roleDao;

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
            empView.addObject("loggedUserUN", auth.getName());
            empView.addObject("title", "Yathra Employee");
            empView.addObject("moduleName", "Employee Management");

            User loggedUser = userDao.getUserByUsername(auth.getName());
            empView.addObject("loggedUserCompanyEmail", loggedUser.getWork_email());

            return empView;
        }
    }

    // get all employee list from DB
    @GetMapping(value = "/emp/all", produces = "application/json")
    public List<Employee> getAllEmployees() {
        return employeeDao.findAll();
    }

    // get employees who dont have an user account
    @GetMapping(value = "/emp/listwithoutuseracc", produces = "application/json")
    public List<Employee> showEmpsWOUserAccs() {
        return employeeDao.getEmpsWithoutAccount();
    }

    // save employee record on DB
    @PostMapping(value = "/emp")
    @Transactional
    public String saveEmployee(@RequestBody Employee employee) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

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
            employee.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());

            Employee savedEmployee = employeeDao.save(employee);

            // same time create a new user acc for that emp
            if (employee.getDesignation_id().getNeeduseracc()) {
                User newUserAcc = new User();
                newUserAcc.setUsername(employee.getEmp_code());
                newUserAcc.setPassword(bCryptPasswordEncoder.encode(employee.getNic()));

                // unique email for each user
                String fullname = employee.getFullname();
                String convertedFullname = fullname.replaceAll("\\s", "").toLowerCase();
                String empCode = employee.getEmp_code();
                final String DOMAIN = "@yathratravels.lk";
                String craftedEmail = convertedFullname + empCode + DOMAIN;

                newUserAcc.setWork_email(craftedEmail);

                Set<Role> userRoles = new HashSet<>();
                Role role = roleDao.getRoleByName(employee.getDesignation_id().getName());
                userRoles.add(role);
                newUserAcc.setRoles(userRoles);

                newUserAcc.setEmployee_id(savedEmployee);
                newUserAcc.setAddeddatetime(LocalDateTime.now());
                newUserAcc.setNote("Automatically Created By The System, Will Activate After Manager's Supervision");

                // not yet activated
                newUserAcc.setAcc_status(false);

                userDao.save(newUserAcc);

            }

            return "OK";
        } catch (Exception e) {
            return "Error Saving Employee: " + e.getMessage();
        }

    }

    // to update an existing employee record
    @PutMapping(value = "/emp")
    @Transactional
    public String updateEmployee(@RequestBody Employee employee) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

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
            employee.setLastmodifieduserid(userDao.getUserByUsername(auth.getName()).getId());

            employeeDao.save(employee);

            if (employee.getDesignation_id().getNeeduseracc()) {
                if (employee.getEmp_status().equals("Resigned") || employee.getDeleted_emp()) {

                    User relatedUserAcc = userDao.getUserByEmployeeID(employee.getId());
                    if (relatedUserAcc != null) {
                        relatedUserAcc.setAcc_status(false);
                        userDao.save(relatedUserAcc);
                    }
                }
            }

            if (!employee.getDeleted_emp()) {
                User relatedUserAcc = userDao.getUserByEmployeeID(employee.getId());
                if (relatedUserAcc != null) {
                    relatedUserAcc.setAcc_status(true);
                    userDao.save(relatedUserAcc);
                }
            }

            return "OK";

        } catch (Exception e) {
            return "Update Not Completed Because :" + e.getMessage();
        }

    }

    // to delete an employee record
    // 💥💥💥 not finished
    @DeleteMapping(value = "/emp")
    // @Transactional
    public String deleteEmployee(@RequestBody Employee employee) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // get the existing employee record by his ID(same as this passing ID)
        Employee existingEmployee = employeeDao.getReferenceById(employee.getId());

        // first check if the employee record exist or not
        // (should be exist except for previous accidental deletions in db table level)
        if (existingEmployee == null) {
            return "Delete Not Completed : Employee Does Not Exists";
        }

        try {
            existingEmployee.setDeleteddatetime(LocalDateTime.now());
            existingEmployee.setDeleted_emp(true);
            employee.setDeleteduserid(userDao.getUserByUsername(auth.getName()).getId());
            employeeDao.save(existingEmployee);

            User relatedUserAcc = userDao.getUserByEmployeeID(employee.getId());
            if (relatedUserAcc != null) {
                relatedUserAcc.setAcc_status(false);
                relatedUserAcc.setNote("Account disabled due to Employee record is deleted");
                userDao.save(relatedUserAcc);
            }

            return "OK";
        } catch (Exception e) {
            return "Delete Not Completed " + e.getMessage();
        }

    }

}
