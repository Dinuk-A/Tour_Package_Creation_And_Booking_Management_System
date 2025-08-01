package lk.yathratravels.tpkg;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.transaction.Transactional;
import lk.yathratravels.dayplan.DayPlan;
import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.Role;
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
    public ModelAndView showTpkgUI() throws JsonProcessingException {

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

            List<String> roleNames = loggedUser.getRoles()
                    .stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());
            // tpkgView.addObject("loggeduserroles", roleNames);
            tpkgView.addObject("loggeduserroles", new ObjectMapper().writeValueAsString(roleNames));

            // get logged users'id to filter his own assigned inqs
            tpkgView.addObject("loggedUserId", loggedUser.getId());

            // get logged users' employee id to filter his own assigned inqs
            tpkgView.addObject("loggedUserEmpId", loggedUser.getEmployee_id().getId());

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

    // get custom completed pkgs
    @GetMapping(value = "/tpkg/custom/completed", produces = "application/json")
    public List<TourPkg> getCustomDraftTourPackages() {
        return daoTPkg.getAllCompletedCustomPackages();
    }

    // get tpkgs by inq
    @GetMapping(value = "/tpkg/custom/byinq", produces = "application/json")
    public List<TourPkg> getCustomTourPackagesByInquiry(@RequestParam("inqid") String inqId) {
        return daoTPkg.getCompletedCustomPackagesByInquiryId(inqId);
    }

    // get the tpkg by id
    @GetMapping(value = "/tpkg/byid", params = { "tpkgId" }, produces = "application/json")
    public TourPkg getTpkgById(@RequestParam("tpkgId") Integer tpkgId) {
        return daoTPkg.findTpkgById(tpkgId);
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
                //ac.setAddeddatetime(LocalDateTime.now());
                //ac.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());
                ac.setTourPkg(tpkg);
            }

            //if is emplate + status == live on website
            //all days will be status == used on a web pkg start.mid.last all

            //else all status == used in a package 

            
            daoTPkg.save(tpkg);

            return "OK";
        } catch (Exception e) {
            return "save Tour Package Failed. " + e.getMessage();
        }

    }

    // update a tpkg
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

            for (AdditionalCost ac : tpkg.getAddiCostList()) {
                ac.setAddeddatetime(LocalDateTime.now());
                ac.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());
                ac.setTourPkg(tpkg);
            }

            daoTPkg.save(tpkg);
            return "OK";
        } catch (Exception e) {
            return "Update Not Completed Because :" + e.getMessage();
        }

    }

    @PutMapping(value = "/tpkgunpublish")
    public String unpublishWebTourPkg(@RequestBody TourPkg tpkg) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "TOUR_PACKAGE");

        if (!privilegeLevelForLoggedUser.getPrvupdate()) {
            return "You do not have permission to edit a tour package.";
        }

        try {
            tpkg.setLastmodifieddatetime(LocalDateTime.now());
            tpkg.setLastmodifieduserid(userDao.getUserByUsername(auth.getName()).getId());

            //for (AdditionalCost ac : tpkg.getAddiCostList()) {
            //    ac.setAddeddatetime(LocalDateTime.now());
            //    ac.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());
            //    ac.setTourPkg(tpkg);
            //}



            daoTPkg.save(tpkg);
            return "OK";
        } catch (Exception e) {
            return "Update Not Completed Because :" + e.getMessage();
        }

    }

    // think a logic for delete tour package 💥💥💥
    @DeleteMapping(value = "/tpkg")
    public String deleteTpkg(@RequestBody TourPkg tpkg) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "TOUR_PACKAGE");

        if (!privilegeLevelForLoggedUser.getPrvdelete()) {
            return "You do not have permission to delete a tour package.";
        }

        TourPkg existingRecord = daoTPkg.getReferenceById(tpkg.getId());

        if (existingRecord == null) {
            return "Delete Not Completed : Package Does Not Exists";
        }

        try {
            existingRecord.setDeleted_tpkg(true);
            existingRecord.setDeleteddatetime(LocalDateTime.now());
            existingRecord.setDeleteduserid(userDao.getUserByUsername(auth.getName()).getId());

            daoTPkg.save(existingRecord);

            return "OK";
        } catch (Exception e) {
            return "Delete Not Completed " + e.getMessage();
        }

    }
}
