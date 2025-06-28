package lk.yathratravels.inquiry;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.transaction.Transactional;
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

    @PostMapping(value = "/followup")
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

            Followup savedFollowupRecord = followupDao.save(flwup);

            

        } catch (Exception e) {
            return "Error Saving Followup Update: " + e.getMessage();
        }

        return "OK";
    }
}
