package lk.yathratravels.lunchplace;

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
import lk.yathratravels.user.UserDao;

@RestController
public class LunchPlaceController {

    @Autowired
    private LunchPlaceDao lunchPlaceDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private PrivilegeServices privilegeService;

    @RequestMapping(value = "/lunchplace", method = RequestMethod.GET)
    public ModelAndView lunchMgtUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "LUNCHPLACE");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {

            ModelAndView lost = new ModelAndView();
            lost.setViewName("lost.html");
            return lost;

        } else {
            ModelAndView lunchMgtView = new ModelAndView();
            lunchMgtView.setViewName("lunchplace.html");
            lunchMgtView.addObject("loggedUserUN", auth.getName());
            lunchMgtView.addObject("title", "Yathra Lunch");

            return lunchMgtView;
        }
    }

    // get all data
    @GetMapping(value = "/lunchplace/all", produces = "application/JSON")
    public List<LunchPlace> getLunchPlaceAllData() {

        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        return lunchPlaceDao.findAll(Sort.by(Direction.DESC, "id"));
    }

    // get by given district
    @GetMapping(value = "/lunchplace/bydistrict/{givenDistrict}", produces = "application/json")
    public List<LunchPlace> getLunchPlacesByDist(@PathVariable Integer givenDistrict) {
        return lunchPlaceDao.getLunchPlaceByGivenDistrict(givenDistrict);
    }

    @PostMapping(value = "/lunchplace")
    public String saveLunchPlace(@RequestBody LunchPlace lp) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        try {

            lp.setAddeddatetime(LocalDateTime.now());
            lp.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());
            lunchPlaceDao.save(lp);

            return "OK";
        } catch (Exception e) {
            return "save not completed : " + e.getMessage();
        }

    }

    @PutMapping(value = "/lunchplace")
    public String updateLunchPlace(@RequestBody LunchPlace lp) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        try {
            lp.setLastmodifieddatetime(LocalDateTime.now());
            lp.setLastmodifieduserid(userDao.getUserByUsername(auth.getName()).getId());
            lunchPlaceDao.save(lp);
            return "OK";
        } catch (Exception e) {
            return "Update Not Completed ; " + e.getMessage();
        }
    }

    @DeleteMapping(value = "/lunchplace")
    public String deleteLhotelRecord(@RequestBody LunchPlace lp) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        LunchPlace existingLP = lunchPlaceDao.getReferenceById(lp.getId());
        if (existingLP == null) {
            return "Delete Not Completed, Record Not Found";
        }

        try {
            existingLP.setDeleted_lp(true);
            existingLP.setDeleteddatetime(LocalDateTime.now());
            existingLP.setDeleteduserid(userDao.getUserByUsername(auth.getName()).getId());
            lunchPlaceDao.save(existingLP);

            return "OK";

        } catch (Exception e) {
            return "Delete Not Completed : " + e.getMessage();
        }
    }

}
