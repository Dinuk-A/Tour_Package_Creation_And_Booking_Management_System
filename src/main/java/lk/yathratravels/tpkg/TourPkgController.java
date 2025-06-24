package lk.yathratravels.tpkg;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import jakarta.transaction.Transactional;
import lk.yathratravels.dayplan.DayPlan;
import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.User;
import lk.yathratravels.user.UserDao;

@RestController
public class TourPkgController {

    @Autowired
    private PrivilegeServices privilegeService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private TourPkgDao daoTPkg;

    @Autowired
    private AdditionalCostDao additionalCostDao;

    // display tpkg UI
    @RequestMapping(value = "/tourpackage", method = RequestMethod.GET)
    public ModelAndView showTpkgUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "TOUR_PACKAGE");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {

            ModelAndView lost = new ModelAndView();
            lost.setViewName("lost.html");
            return lost;

        } else {

            ModelAndView tpkgView = new ModelAndView();
            tpkgView.setViewName("tpkg.html");
            tpkgView.addObject("loggedUserUN", auth.getName());
            tpkgView.addObject("title", "Yathra Tour Package");
            tpkgView.addObject("moduleName", "Tour Package Builder");
            User loggedUser = userDao.getUserByUsername(auth.getName());
            tpkgView.addObject("loggeduserdesignation", loggedUser.getEmployee_id().getDesignation_id().getName());
            tpkgView.addObject("loggedUserCompanyEmail", loggedUser.getWork_email());
            tpkgView.addObject("loggeduserroles", loggedUser.getRoles());
            return tpkgView;
        }
    }

    // get all tour packages
    @GetMapping(value = "/tpkg/all", produces = "application/json")
    public List<TourPkg> getAllTourPkgs() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "TOUR_PACKAGE");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<TourPkg>();
        }

        return daoTPkg.findAll(Sort.by(Direction.DESC, "id"));
    }

    // save a tout pkg + addi costs
    @PostMapping(value = "/tpkg")
    @Transactional
    public String saveTourPkg(@RequestBody TourPkg tpkg) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "TOUR_PACKAGE");

        if (!privilegeLevelForLoggedUser.getPrvinsert()) {
            return "You do not have permission to add a new tour package.";
        }

        try {

            String tpkgCode = daoTPkg.getNextTPCode();

            if (tpkgCode == null || tpkgCode.equals("")) {
                tpkg.setPkgcode("TP00001");
            } else {
                tpkg.setPkgcode(daoTPkg.getNextTPCode());
            }

            System.out.println("Selected dayplans:");
            for (DayPlan dp : tpkg.getDayplans()) {
                System.out.println(" - ID: " + dp.getId() + ", Title: " + dp.getDaytitle());
            }

            tpkg.setAddeddatetime(LocalDateTime.now());
            tpkg.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());

            for (AdditionalCost ac : tpkg.getAddiCostList()) {
                ac.setAddeddatetime(LocalDateTime.now());
                ac.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());
                ac.setTourPkg(tpkg);
            }
            TourPkg savedTpkg = daoTPkg.save(tpkg);

            /*
             * System.out.println("additional cost list : " +
             * tpkg.getAddiCostList().toString());
             * 
             * if (tpkg.getAddiCostList() != null && !tpkg.getAddiCostList().isEmpty()) {
             * 
             * for (AdditionalCost ac : tpkg.getAddiCostList()) {
             * AdditionalCost additionalCost = new AdditionalCost();
             * 
             * System.out.println("additional cost : " + ac.toString());
             * 
             * additionalCost.setTourPkg(savedTpkg);
             * additionalCost.setCostname(ac.getCostname());
             * additionalCost.setAmount(ac.getAmount());
             * additionalCost.setAddeddatetime(LocalDateTime.now());
             * additionalCost.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId
             * ());
             * additionalCostDao.save(additionalCost);
             * }
             * 
             * }
             */

            return "OK";
        } catch (Exception e) {
            return "save Tour Package Failed. " + e.getMessage();
        }

    }

    @PutMapping(value = "/tpkg")
    public String updateTourPkg(@RequestBody TourPkg tpkg) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "TOUR_PACKAGE");

        if (!privilegeLevelForLoggedUser.getPrvupdate()) {
            return "You do not have permission to edit a tour package.";
        }

        try {
            tpkg.setLastmodifieddatetime(LocalDateTime.now());
            tpkg.setLastmodifieduserid(userDao.getUserByUsername(auth.getName()).getId());
            daoTPkg.save(tpkg);
            return "OK";
        } catch (Exception e) {
            return "Update Not Completed Because :" + e.getMessage();
        }

    }

    // think a logic for delete tour package 💥💥💥

}
