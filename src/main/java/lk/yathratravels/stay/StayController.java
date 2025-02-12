package lk.yathratravels.stay;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.security.core.Authentication;
import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.User;
import lk.yathratravels.user.UserDao;

@RestController
public class StayController {

    @Autowired
    private PrivilegeServices privilegeService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private StayDao stayDao;

    @RequestMapping(value = "/stay", method = RequestMethod.GET)
    public ModelAndView showStayUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "STAY");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {

            ModelAndView lost = new ModelAndView();
            lost.setViewName("lost.html");
            return lost;

        } else {
            ModelAndView stayView = new ModelAndView();
            stayView.setViewName("stay.html");
            stayView.addObject("loggedUserUN", auth.getName());
            stayView.addObject("title", "Yathra Accomodation");
            stayView.addObject("moduleName", "Accomodation Management");

            User loggedUser = userDao.getUserByUsername(auth.getName());
            stayView.addObject("loggedUserCompanyEmail", loggedUser.getWork_email());

            return stayView;
        }

    }

    @GetMapping(value = "/stay/all", produces = "application/json")
    public List<Stay> getAllStays() {
        return stayDao.findAll();
    }

    @GetMapping(value = "/stay/bydistrict/{givenDistrict}", produces = "application/json")
    public List<Stay> getStaysByDist(@PathVariable Integer givenDistrict) {
        return stayDao.getStayListByDistrict(givenDistrict);
    }

    @PostMapping(value = "/stay")
    public String saveStayinfo(@RequestBody Stay stay) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        try {
            stay.setAddeddatetime(LocalDateTime.now());
            stay.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());
            stayDao.save(stay);
            return "OK";
        } catch (Exception e) {
            return "save not completed : " + e.getMessage();

        }
    }

    @PutMapping(value = "/stay")
    public String updateStay(@RequestBody Stay stay) {

        // user auth
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        try {
            stay.setLastmodifieddatetime(LocalDateTime.now());
            stay.setLastmodifieduserid(userDao.getUserByUsername(auth.getName()).getId());
            stayDao.save(stay);
            return "OK";
        } catch (Exception e) {
            return "Update Not Completed ; " + e.getMessage();
        }

    }

    @DeleteMapping(value = "/stay")
    public String deleteStay(@RequestBody Stay stay) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // check existence
        Stay existStay = stayDao.getReferenceById(stay.getId());
        if (existStay == null) {
            return "Record Not Found";
        }

        try {
            System.out.println("this runs 1");
            existStay.setDeleted_stay(true);
            existStay.setDeleteddatetime(LocalDateTime.now());
            existStay.setDeleteduserid(userDao.getUserByUsername(auth.getName()).getId());
            System.out.println("this runs 2");
            stayDao.save(existStay);
            return "OK";
        } catch (Exception e) {
            return "Delete Not Completed : " + e.getMessage();
        }

    }

}
