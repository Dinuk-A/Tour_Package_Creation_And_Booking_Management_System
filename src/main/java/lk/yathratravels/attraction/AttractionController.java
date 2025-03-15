package lk.yathratravels.attraction;

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
public class AttractionController {

    @Autowired
    private AttractionDao attractionDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private PrivilegeServices privilegeService;

    // display attraction UI
    @RequestMapping(value = "/attraction", method = RequestMethod.GET)
    public ModelAndView attractionUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "ATTRACTION");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {

            ModelAndView lost = new ModelAndView();
            lost.setViewName("lost.html");
            return lost;

        } else {

            ModelAndView attrView = new ModelAndView();
            attrView.setViewName("attraction.html");
            attrView.addObject("loggedUserUN", auth.getName());
            attrView.addObject("title", "Yathra Attraction");
            attrView.addObject("moduleName", "Attraction Management");

            User loggedUser = userDao.getUserByUsername(auth.getName());
            attrView.addObject("loggedUserCompanyEmail", loggedUser.getWork_email());

            return attrView;
        }
    }

    // get all attactions list from DB
    @GetMapping(value = "/attraction/all", produces = "application/json")
    public List<Attraction> getAllAttractions() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "ATTRACTION");

          if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<Attraction>();
        }
       
        return attractionDao.findAll(Sort.by(Direction.DESC, "id"));
    }

    // for get attractions based on district >> to day plan creation
    @GetMapping(value = "/attraction/bydistrict/{selectedDistrict}", produces = "application/json")
    public List<Attraction> getAttrListByDist(@PathVariable Integer selectedDistrict) {
        return attractionDao.attrListByDistrict(selectedDistrict);
    }

    // save attraction record on DB
    @PostMapping(value = "/attraction")
    public String saveVPlace(@RequestBody Attraction vplace) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "ATTRACTION");
      
        if (!privilegeLevelForLoggedUser.getPrvinsert()) {
            return "Attraction Save Not Completed; You Dont Have Permission";
        }

        try {
            vplace.setAddeddatetime(LocalDateTime.now());
             vplace.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());

            attractionDao.save(vplace);

            return "OK";
        } catch (Exception e) {
            return "save not completed : " + e.getMessage();
        }
    }

    // update an attraction row
    @PutMapping(value = "/attraction")
    public String updateVPlace(@RequestBody Attraction vplace) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "ATTRACTION");

        if (!privilegeLevelForLoggedUser.getPrvupdate()) {
            return "Attraction Update Not Completed; You Dont Have Permission";
        }
       
        // check existence

        // duplications

        try {
            vplace.setLastmodifieddatetime(LocalDateTime.now());
             vplace.setLastmodifieduserid(userDao.getUserByUsername(auth.getName()).getId());

            attractionDao.save(vplace);
            return "OK";
        } catch (Exception e) {
            return "Update Not Completed ; " + e.getMessage();
        }
    }

    @DeleteMapping(value = "/attraction")
    public String deleteVplace(@RequestBody Attraction vplace) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "ATTRACTION");

        if (!privilegeLevelForLoggedUser.getPrvdelete()) {
            return "Attraction Delete Not Completed; You Dont Have Permission";
        }

        // check existence
        Attraction existVPlace = attractionDao.getReferenceById(vplace.getId());
        if (existVPlace == null) {
            return "Record Not Found";
        }
        try {
            existVPlace.setDeleted_attr(true);
            existVPlace.setDeleteddatetime(LocalDateTime.now());
            existVPlace.setDeleteduserid(userDao.getUserByUsername(auth.getName()).getId());

            // AttrStatus deletedStatus = atSttsDao.getReferenceById(4);
            // existVPlace.setAttrstatus_id(deletedStatus);
            attractionDao.save(existVPlace);

            return "OK";

        } catch (Exception e) {
            return "Delete Not Completed : " + e.getMessage();
        }
    }

}
