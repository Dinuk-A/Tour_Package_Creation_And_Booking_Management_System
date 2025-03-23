package lk.yathratravels.dayplan;

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

    // filter only first days
    @GetMapping(value = "/dayplan/onlyfirstdays", produces = "application/json")
    public List<DayPlan> getFDsOnly() {
        return daoDP.getOnlyFirstDays();
    }

    // filter only middle days
    @GetMapping(value = "/dayplan/onlymiddays", produces = "application/json")
    public List<DayPlan> getMDsOnly() {
        return daoDP.getOnlyMidDays();
    }

    // filter only last days
    @GetMapping(value = "/dayplan/onlylastdays", produces = "application/json")
    public List<DayPlan> getlDsOnly() {
        return daoDP.getOnlyLastDays();
    }

    // NEED TO CREATE 3 MORE, FILTER ALSO BY THE BASED INQUIRY💥💥💥

    @PostMapping(value = "/dayplan")
    public String saveDayPlan(@RequestBody DayPlan dplan) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "DAYPLAN");

        if (!privilegeLevelForLoggedUser.getPrvinsert()) {
            return "Day Plan Save Not Completed; You Dont Have Permission";
        }

        try {

            // IF ekak dala dayplan template walata wenama code ekak hadanna 💥💥💥

            //or custom dp elkakata nam, inquiry ekath ekka sambanda code ekak hadanna 💥💥💥

            // Generate the dayplancode
            String nextCode;
            List<DayPlan> codeCountByDistrict = daoDP.getDayPlansByStartDistrict(dplan.getStart_district_id().getId());
            if (codeCountByDistrict.size() == 0) {
                nextCode = dplan.getDayplancode() + dplan.getStart_district_id().getName().substring(0, 3).toUpperCase()
                        + "1";
            } else {
                nextCode = dplan.getDayplancode() + dplan.getStart_district_id().getName().substring(0, 3).toUpperCase()
                        + (codeCountByDistrict.size() + 1);
            }

            dplan.setDayplancode(nextCode);
            dplan.setAddeddatetime(LocalDateTime.now());
            dplan.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());
            daoDP.save(dplan);
            return "OK";
        } catch (Exception e) {
            return "save not completed : " + e.getMessage();
        }
    }

    // to save the same record but with new attributes 💥💥💥
    // also a POST, not a PUT

    // to update a dayplan
    @PutMapping(value = "/dayplan")
    public String updateDayPlan(@RequestBody DayPlan dplan) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "DAYPLAN");

        if (!privilegeLevelForLoggedUser.getPrvinsert()) {
            return "Day Plan Update Not Completed; You Dont Have Permission";
        }

        try {
            dplan.setAddeddatetime(LocalDateTime.now());
            dplan.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());
            daoDP.save(dplan);
            return "OK";
        } catch (Exception e) {
            return "Update Not Completed ; " + e.getMessage();
        }

    }

    // to simulate the deletion of dayplan data
     // 💥💥💥 not finished
    @DeleteMapping(value = "/dayplan")
    public String deleteDayPlan(@RequestBody DayPlan dplan) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "DAYPLAN");

        if (!privilegeLevelForLoggedUser.getPrvinsert()) {
            return "Day Plan Delete Not Completed; You Dont Have Permission";
        }

        // check existence
        DayPlan existDayPlan = daoDP.getReferenceById(dplan.getId());

        if (existDayPlan == null) {
            return "Delete Not Completed, Record Not Found";
        }

        try {
            existDayPlan.setDeleted_dp(true);
            existDayPlan.setDeleteddatetime(LocalDateTime.now());
            existDayPlan.setDeleteduserid(userDao.getUserByUsername (auth.getName()).getId());
            daoDP.save(existDayPlan);
            return "OK";

        } catch (Exception e) {
            return "Delete Not Completed : " + e.getMessage();
        }

    }

}
