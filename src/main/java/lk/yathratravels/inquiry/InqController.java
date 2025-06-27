package lk.yathratravels.inquiry;

import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.security.core.Authentication;
import jakarta.transaction.Transactional;
import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.Role;
import lk.yathratravels.user.User;
import lk.yathratravels.user.UserDao;

@RestController
public class InqController {

    @Autowired
    private InqDao inqDao;

    @Autowired
    private PrivilegeServices privilegeService;

    @Autowired
    private UserDao userDao;

    @RequestMapping(value = "/inq", method = RequestMethod.GET)
    public ModelAndView showInquiryUI() throws JsonProcessingException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "INQUIRY");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            ModelAndView lost = new ModelAndView();
            lost.setViewName("lost.html");
            return lost;
        } else {
            ModelAndView inqView = new ModelAndView();
            inqView.setViewName("inq.html");
            inqView.addObject("loggedUserUN", auth.getName());
            inqView.addObject("title", "Yathra Inquiries");
            inqView.addObject("moduleName", "Inquiry Management");

            User loggedUser = userDao.getUserByUsername(auth.getName());
            inqView.addObject("loggedUserCompanyEmail", loggedUser.getWork_email());

            List<String> roleNames = loggedUser.getRoles()
                    .stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());
            // tpkgView.addObject("loggeduserroles", roleNames);
            inqView.addObject("loggeduserroles", new ObjectMapper().writeValueAsString(roleNames));

            // get logged users'id to filter his own assigned inqs
            inqView.addObject("loggedUserId", loggedUser.getId());

            return inqView;
        }
    }

    @GetMapping(value = "/inq/all", produces = "application/json")
    public List<Inq> getAllInquiries() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "INQUIRY");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<Inq>();
        }

        return inqDao.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }



    @GetMapping(value = "/inq/personal", params = {"userid"}, produces = "application/json")
    public List<Inq> getPersonalAssignedInquiries(@RequestParam("userid") Integer userId) {

        //Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        //Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "INQUIRY");

        //if (!privilegeLevelForLoggedUser.getPrvselect()) {
        //    return new ArrayList<Inq>();
        //}

        return inqDao.returnPersonalInqsByUserId(userId);
    }

    // inqs from website
    @PostMapping(value = "/inquiryfromweb")
    public String saveInqFromWeb(@RequestBody Inq inq) {

        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Privilege privilegeLevelForLoggedUser =
        // privilegeService.getPrivileges(auth.getName(), "EMPLOYEE");
        //
        // if (!privilegeLevelForLoggedUser.getPrvinsert()) {
        // return "Save Not Completed You Dont Have Permission";
        // }

        try {

            // System.out.println("New Inquiry Received from Website : " + inq.toString());

            // gen a code
            String inqCode = inqDao.getNextInquiryCode();
            if (inqCode == null || inqCode.equals("")) {
                inq.setInqcode("INQ00001");
            } else {
                inq.setInqcode(inqCode);
            }

            // if recieved via the website
            if (inq.getInqsrc() == null) {
                inq.setInqsrc("Website");
            }

            inq.setInq_status("New");

            // set recieved date and time within this for inqs sent by clients via website
            inq.setRecieveddate(LocalDate.now());
            inq.setRecievedtime(LocalTime.now());

            inqDao.save(inq);

            return "OK";

        } catch (Exception e) {
            return "save not completed : " + e.getMessage();
        }
    }

    // if an employee manually added this which recieved from email or call
    // inq.setAddeddatetime(LocalDateTime.now());
    // inq.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());

    // inqs from manual system
    @PostMapping(value = "/inq")
    public String saveInq(@RequestBody Inq inq) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "INQUIRY");

        if (!privilegeLevelForLoggedUser.getPrvinsert()) {
            return "Save Not Completed You Dont Have Permission";
        }

        try {

            // gen a code
            String inqCode = inqDao.getNextInquiryCode();
            if (inqCode == null || inqCode.equals("")) {
                inq.setInqcode("INQ00001");
            } else {
                inq.setInqcode(inqCode);
            }

            inq.setInq_status("New");

            // set recieved date and time within this for inqs sent by clients via website
            inq.setAddeddatetime(LocalDateTime.now());
            inq.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());

            inqDao.save(inq);

            return "OK";

        } catch (Exception e) {
            return "save not completed : " + e.getMessage();
        }
    }

}
