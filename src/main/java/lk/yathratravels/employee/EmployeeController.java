package lk.yathratravels.employee;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
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

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "EMPLOYEE");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<Employee>();
        }

        return employeeDao.findAll(Sort.by(Direction.DESC, "id"));
    }

    // get only non deleted emps set
    @GetMapping(value = "/emp/active", produces = "application/json")
    public List<Employee> getActiveEmployees() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "EMPLOYEE");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<Employee>();
        }

        return employeeDao.getNonDeletedEmployees();
    }

    // get active employees who are managers, assistants and executives
    @GetMapping(value = "/emp/active/inqoperators", produces = "application/json")
    public List<Employee> getActiveSeniorEmployees() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "EMPLOYEE");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<Employee>();
        }

        return employeeDao.getNonDeletedManagersAndAssistantsAndExecutives();
    }

    // emp list except admin
    @GetMapping(value = "/emp/exceptadmin", produces = "application/json")
    public List<Employee> returnEmpListExceptAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "EMPLOYEE");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<Employee>();
        }

        return employeeDao.getAllEmployeesExceptAdmin();

    }

    // get active employees who dont have an user account + not deleted
    @GetMapping(value = "/emp/listwithoutuseracc", produces = "application/json")
    public List<Employee> showEmpsWOUserAccs() {
        return employeeDao.getEmpsWithoutAccountAndNotDeleted();
    }

    // get emp code and fullname of the employee by his user ID
    @GetMapping(value = "/empinfo/byuserid", params = { "userid" }, produces = "application/json")
    public Employee getEmployeeByUser(@RequestParam("userid") Integer userId) {
        return employeeDao.getEmployeeInfoByUserId(userId);
    }

    // get emp code and fullname of the employee by his EMP ID
    @GetMapping(value = "/empinfo/byempid", params = { "empId" }, produces = "application/json")
    public Employee getEmployeeByEmpId(@RequestParam("empId") Integer empId) {
        return employeeDao.getEmployeeInfoByEmpId(empId);
    }

    // get employee basics
    @GetMapping("/emp/allbasic")
    public List<Employee> getAllBasicEmployeeInfo() {
        return employeeDao.getAllEmployeeBasicInfo();
    }

    // get all drivers who are available within the given date range
    @GetMapping(value = "emp/availabledriversbydates/{startDate}/{endDate}", produces = "application/JSON")
    public List<Employee> getAvailableDrivers(@PathVariable("startDate") String startDate,
            @PathVariable("endDate") String endDate) {

        return employeeDao.getAvailableDriversList(LocalDate.parse(startDate), LocalDate.parse(endDate));
    }

    // get all guides who are available within the given date range
    @GetMapping(value = "emp/availableguidesbydates/{startDate}/{endDate}", produces = "application/JSON")
    public List<Employee> getAvailableGuides(@PathVariable("startDate") String startDate,
            @PathVariable("endDate") String endDate) {

        return employeeDao.getAvailableGuidesList(LocalDate.parse(startDate), LocalDate.parse(endDate));
    }

    // save employee record on DB
    @PostMapping(value = "/emp")
    @Transactional
    public String saveEmployee(@RequestBody Employee employee) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "EMPLOYEE");

        if (!privilegeLevelForLoggedUser.getPrvinsert()) {
            return "Employee Save Not Completed; You Dont Have Permission";
        }

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
                employee.setEmp_code("0001");
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
                newUserAcc.setNote("Automatically Created By The System");

                // not yet activated
                newUserAcc.setAcc_status(true);

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

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "EMPLOYEE");

        if (!privilegeLevelForLoggedUser.getPrvupdate()) {
            return "Employee Update Not Completed; You Dont Have Permission";
        }

        // storing this updating employee record's ID for duplication completions
        Integer idOfUpdatingEmployee = employee.getId();

        // get the existing employee record by his ID(same as this passing ID)
        Employee existingEmployee = employeeDao.getReferenceById(idOfUpdatingEmployee);

        // first check if the employee record exist or not
        // (should be exist except for accidental deletions in db table level)
        if (existingEmployee == null) {
            return "Update Not Completed : Employee Does Not Exists";
        }

        /*
         * Optional<Employee> optionalEmployee =
         * employeeDao.findById(idOfUpdatingEmployee);
         * 
         * if (optionalEmployee.isEmpty()) {
         * return "Update Not Completed : Employee Does Not Exist";
         * }
         * 
         * Employee existingEmployee = optionalEmployee.get();
         * 
         */

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
                if (employee.getEmp_status().equals("Resigned")) {

                    // || employee.getDeleted_emp() was also inside above 2nd if

                    User relatedUserAcc = userDao.getUserByEmployeeID(employee.getId());
                    if (relatedUserAcc != null) {
                        relatedUserAcc.setAcc_status(false);
                        userDao.save(relatedUserAcc);
                    }
                }

                // this if was outside the scope of main if
                if (employee.getEmp_status().equals("Working")) {

                    User relatedUserAcc = userDao.getUserByEmployeeID(employee.getId());
                    if (relatedUserAcc != null) {
                        relatedUserAcc.setAcc_status(true);
                        userDao.save(relatedUserAcc);
                    }
                }
            }

            // original
            // if (!employee.getDeleted_emp()) {
            //
            // User relatedUserAcc = userDao.getUserByEmployeeID(employee.getId());
            // if (relatedUserAcc != null) {
            // relatedUserAcc.setAcc_status(true);
            // userDao.save(relatedUserAcc);
            // }
            // }

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

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "EMPLOYEE");

        if (!privilegeLevelForLoggedUser.getPrvdelete()) {
            return "Employee Delete Not Completed; You Dont Have Permission";
        }

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
