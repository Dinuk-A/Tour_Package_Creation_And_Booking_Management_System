package lk.yathratravels.common;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.yathratravels.employee.EmployeeDao;
import lk.yathratravels.user.Role;
import lk.yathratravels.user.RoleDao;
import lk.yathratravels.user.User;
import lk.yathratravels.user.UserDao;

import java.util.Base64;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
public class CommonMethods {

    @Autowired
    private EmployeeDao employeeDao;

    @Autowired
    private RoleDao roleDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    // to create the first user by running this URL
    @GetMapping(value = "/createadmin")
    public String createFirstUserAcc() {

        User sysAdmin = new User();
        sysAdmin.setUsername("Admin");
        sysAdmin.setWork_email("admin101@yathra.com");
        sysAdmin.setPassword(bCryptPasswordEncoder.encode("12345"));
        sysAdmin.setAcc_status(true);
        sysAdmin.setAddeddatetime(LocalDateTime.now());

        sysAdmin.setEmployee_id(employeeDao.getReferenceById(1));

        Set<Role> roles = new HashSet<Role>();
        roles.add(roleDao.getReferenceById(5));
        sysAdmin.setRoles(roles);

        userDao.save(sysAdmin);

        return "<script>window.location.replace('http://localhost:8081/login');</script>";

    }

    // UI for login page
    @GetMapping(value = "/login")
    public ModelAndView loginUI() {
        ModelAndView loginView = new ModelAndView();
        loginView.setViewName("login.html");
        return loginView;
    }

    // UI for dashboard
    @GetMapping(value = "/dashboard")
    public ModelAndView dashboardUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        ModelAndView dbView = new ModelAndView();
        dbView.setViewName("dashboard.html");
        dbView.addObject("loggedUserUN", auth.getName());

        User loggedUser = userDao.getUserByUsername(auth.getName());

        dbView.addObject("title", "Yathra Dashboard");

        // get email
        dbView.addObject("loggedUserCompanyEmail", loggedUser.getWork_email());

        // get designation (only one value)
        dbView.addObject("loggeduserdesignation", loggedUser.getEmployee_id().getDesignation_id().getName());

        // get all the roles as a custom array
        List<String> roleNames = loggedUser.getRoles()
                .stream()
                .map(Role::getName)
                .collect(Collectors.toList());
        dbView.addObject("loggeduserroles", roleNames);

        // roles godak thiyana nisa list eke palawni eka witharay enne 💥💥💥
        // dbView.addObject("loggeduserrole",
        // loggedUser.getRoles().iterator().next().getName());

        // set the photo to display 💥💥💥
        // byte[] photoBytes = loggedUser.getEmployee_id().getEmp_photo();
        // String base64Photo = "";
        //
        // if (photoBytes != null) {
        // base64Photo = Base64.getEncoder().encodeToString(photoBytes);
        // }
        //
        // dbView.addObject("loggeduserphoto", base64Photo);

        return dbView;
    }

    // UI for error page
    @GetMapping(value = "/error")
    public ModelAndView errorUi() {
        ModelAndView errorView = new ModelAndView();
        errorView.setViewName("error.html");
        return errorView;
    }

    // UI for lost page
    @GetMapping(value = "/lost")
    public ModelAndView lostUI() {
        ModelAndView lostView = new ModelAndView();
        lostView.setViewName("lost.html");
        return lostView;
    }

    // UI for testing frontend features
    @GetMapping(value = "/test")
    public ModelAndView testUI() {
        ModelAndView testView = new ModelAndView();
        testView.setViewName("test.html");
        return testView;
    }

}
