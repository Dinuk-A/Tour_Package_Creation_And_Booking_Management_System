package lk.yathratravels.inquiry;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.transaction.Transactional;
import lk.yathratravels.employee.Employee;
import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.UserDao;

@RestController
public class FollowupController {

    @Autowired
    private FollowupDao followupDao;

    @Autowired
    private PrivilegeServices privilegeService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private InqDao inqDao;

    // get all followups
    @GetMapping(value = "/followup/all", produces = "application/json")
    public List<Followup> getAllFollowups() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "INQUIRY");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<Followup>();
        }

        return followupDao.findAll();

    }

    // get followups by inq id
    @GetMapping(value = "/followup/byinqid/{inqId}", produces = "application/JSON")
    public List<Followup> getFollowupsByInq(@PathVariable("inqId") int inquiryID) {

        return followupDao.getAllFollowupsByInqId(inquiryID);
    }

    // save a followup also with inq detail updates
    @PostMapping(value = "/followupwithinq")
    @Transactional
    public String addNewFollowupWithInqUpdates(@RequestBody Followup flwup) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        //
        // Privilege privilegeLevelForLoggedUser =
        // privilegeService.getPrivileges(auth.getName(), "INQUIRY");

        // if (!privilegeLevelForLoggedUser.getPrvinsert()) {
        // return "Update Not Completed; You Dont Have Permission";
        // }

        try {
            flwup.setAddeddatetime(LocalDateTime.now());
            flwup.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());

            followupDao.save(flwup);
            
            inqDao.save(flwup.getInquiry_id());

            return "OK";

        } catch (Exception e) {
            return "Error Saving Followup Update: " + e.getMessage();
        }

    }

    // save just the followup
    @PostMapping(value = "/followup")
    @Transactional
    public String addNewFollowup(@RequestBody Followup flwup) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        //
        // Privilege privilegeLevelForLoggedUser =
        // privilegeService.getPrivileges(auth.getName(), "INQUIRY");

        // if (!privilegeLevelForLoggedUser.getPrvinsert()) {
        // return "Update Not Completed; You Dont Have Permission";
        // }

        try {
            flwup.setAddeddatetime(LocalDateTime.now());
            flwup.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());

            followupDao.save(flwup);

            flwup.getInquiry_id().setInq_status("In-Progress");

            inqDao.save(flwup.getInquiry_id());

            return "OK";

        } catch (Exception e) {
            return "Error Saving New Followup: " + e.getMessage();
        }

    }

}
