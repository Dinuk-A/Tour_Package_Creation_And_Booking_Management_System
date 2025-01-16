package lk.yathratravels.privilege;

import java.time.LocalDateTime;
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
//import org.springframework.web.bind.annotation.RequestParam;

@RestController

public class PrivilegeController {

    @Autowired
    private PrivilegeDao privilegeDao;

    @Autowired
    private PrivilegeServices privilegeService;

    // Get privileges by module name
    @GetMapping(value = "/privilege/bymodule/{moduleName}")
    public Privilege getPrivilegesByModule(@PathVariable("moduleName") String moduleName) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return privilegeService.getPrivileges(auth.getName(), moduleName);
    }

    // display privi web page
    @RequestMapping(value = "/privilege", method = RequestMethod.GET)
    public ModelAndView privilegeUi() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        ModelAndView privilegeView = new ModelAndView();
        privilegeView.setViewName("privilege.html");
        privilegeView.addObject("loggedusername", auth.getName());
        privilegeView.addObject("title", "Yathra Privilege");
        return privilegeView;
    }

    // get all privi records w/o filtering by any parameters
    @GetMapping(value = "/privilege/all", produces = "application/json")
    public List<Privilege> getPrvAllData() {

        // methana group by module name karanna try karanna
        // or JS ekedi .filter eken group karanna balanna 💥💥💥??????????
        return privilegeDao.findAll(Sort.by(Direction.DESC, "id"));
    }

    @PostMapping(value = "/privilege")
    public String SavePrivilege(@RequestBody Privilege privilege) {

        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // duplicates
        Privilege existPrivilege = privilegeDao.getPrivisByBothRoleAndModule(privilege.getRole_id().getId(),
                privilege.getModule_id().getId());
        if (existPrivilege != null) {
            return "Save failed : This privilege is already granted for this Role & Module";
        }
        try {
            privilege.setAddeddatetime(LocalDateTime.now());

            privilegeDao.save(privilege);
            return "OK";
        } catch (Exception e) {
            return ("Save Not Competeded " + e.getMessage());
        }
    }

    @PutMapping(value = "/privilege")
    public String editPrivilege(@RequestBody Privilege privilege) {

        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // check existing
        Privilege existPrivilege = privilegeDao.getReferenceById(privilege.getId());

        if (existPrivilege == null) {
            return "Update Not Completed : Record Not Found";
        }

        try {
            privilege.setLastmodifieddatetime(LocalDateTime.now());
            privilegeDao.save(privilege);
            return "OK";
        } catch (Exception e) {
            return "Update Not Completed " + e.getMessage();
        }
    }

    @DeleteMapping(value = "/privilege")
    public String deletePrivilege(@RequestBody Privilege privilege) {

        //Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege existingRecord = privilegeDao.getReferenceById(privilege.getId());

        if (existingRecord == null) {
            return "Delete Not Completed : Record Does Not Exists";
        }

        try {
            //❌ not finished 💥💥💥
            // prvDao.delete(privilege);
            //privilegeDao.delete(privilegeDao.getReferenceById(privilege.getId()));

            privilege.setDeleteddatetime(LocalDateTime.now());
            //privilegeDao
            
            return "OK";
        } catch (Exception e) {
            return "Delete Not Completed " + e.getMessage();
        }
    }

}
