package lk.yathratravels.activity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.User;
import lk.yathratravels.user.UserDao;

@RestController
public class ActivityController {

    @Autowired
    private ActivityDao activityDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private PrivilegeServices privilegeService;

    // display activity UI
    @RequestMapping(value = "/activity", method = RequestMethod.GET)
    public ModelAndView activityUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "ACTIVITY");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {

            ModelAndView lost = new ModelAndView();
            lost.setViewName("lost.html");
            return lost;

        } else {

            ModelAndView activityView = new ModelAndView();
            activityView.setViewName("activity.html");
            activityView.addObject("loggedUserUN", auth.getName());
            activityView.addObject("title", "Yathra Activity");
            activityView.addObject("moduleName", "Activity Management");

            User loggedUser = userDao.getUserByUsername(auth.getName());
            activityView.addObject("loggedUserCompanyEmail", loggedUser.getWork_email());

            return activityView;
        }
    }

    // get all activity list from DB
    @GetMapping(value = "/activity/all", produces = "application/json")
    public List<Activity> getAllActivities() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "ACTIVITY");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<Activity>();
        }

        return activityDao.findAll(Sort.by(Direction.DESC, "id"));
    }

    // for get activitys based on district >> to day plan creation
    @GetMapping(value = "/activity/bydistrict/{selectedDistrict}", produces = "application/json")
    public List<Activity> getActivityListByDist(@PathVariable Integer selectedDistrict) {
        return activityDao.activityListByDistrict(selectedDistrict);
    }

    // save an activity on db
    @PostMapping(value = "/activity")
    public String saveActivity(@RequestBody Activity act) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "ACTIVITY");

        if (!privilegeLevelForLoggedUser.getPrvinsert()) {
            return "Activity Save Not Completed; You Dont Have Permission";
        }

        try {
            act.setAddeddatetime(LocalDateTime.now());
            act.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());

            activityDao.save(act);

            return "OK";
        } catch (Exception e) {
            return "save not completed : " + e.getMessage();
        }
    }

    // update an activity row
    @PutMapping(value = "/activity")
    public String updateActivity(@RequestBody Activity act) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "ACTIVITY");

        if (!privilegeLevelForLoggedUser.getPrvupdate()) {
            return "Activity Update Not Completed; You Dont Have Permission";
        }

        try {
            act.setLastmodifieddatetime(LocalDateTime.now());
            act.setLastmodifieduserid(userDao.getUserByUsername(auth.getName()).getId());

            activityDao.save(act);
            return "OK";
        } catch (Exception e) {
            return "Update Not Completed ; " + e.getMessage();
        }
    }

    // delete an activity record
    @DeleteMapping(value = "/activity")
    public String deleteActivity(@RequestBody Activity act) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "ACTIVITY");

        if (!privilegeLevelForLoggedUser.getPrvdelete()) {
            return "Activity Delete Not Completed; You Dont Have Permission";
        }

        // check existence
        Activity existAct = activityDao.getReferenceById(act.getId());
        if (existAct == null) {
            return "Record Not Found";
        }
        try {
            existAct.setDeleted_act(true);
            existAct.setDeleteddatetime(LocalDateTime.now());
            existAct.setDeleteduserid(userDao.getUserByUsername(auth.getName()).getId());

            activityDao.save(existAct);

            return "OK";

        } catch (Exception e) {
            return "Delete Not Completed : " + e.getMessage();
        }
    }

}
