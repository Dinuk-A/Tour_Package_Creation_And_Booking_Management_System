package lk.yathratravels.dayplan;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.yathratravels.employee.Employee;
import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.User;
import lk.yathratravels.user.UserDao;

@RestController
public class DayPlanController {
    @Autowired
    private PrivilegeServices privilegeService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private DayPlanDao daoDP;

    // display dayplan UI
    @RequestMapping(value = "/dayplan", method = RequestMethod.GET)
    public ModelAndView showDayPlanUI() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "DAYPLAN");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {

            ModelAndView lost = new ModelAndView();
            lost.setViewName("lost.html");
            return lost;

        } else {

            ModelAndView dpView = new ModelAndView();
            dpView.setViewName("dayplan.html");
            dpView.addObject("loggedUserUN", auth.getName());
            dpView.addObject("title", "Yathra Day Plan");
            dpView.addObject("moduleName", "Day Plan Builder");

            User loggedUser = userDao.getUserByUsername(auth.getName());
            dpView.addObject("loggedUserCompanyEmail", loggedUser.getWork_email());

            return dpView;
        }
    }

     // get all dayplan list from DB
    @GetMapping(value = "/dayplan/all", produces = "application/json")
    public List<DayPlan> getAllDayPlans() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "DAYPLAN");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<DayPlan>();
        }

        return daoDP.findAll(Sort.by(Direction.DESC, "id"));
    }

    @PostMapping(value = "/dayplan")
    public String saveDayPlan(@RequestBody DayPlan dp) {
        try {
            daoDP.save(dp);
            return "OK";
        } catch (Exception e) {
            return "save not completed : " + e.getMessage();
        }
    }
}
