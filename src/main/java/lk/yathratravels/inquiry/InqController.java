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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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
//import jakarta.transaction.Transactional;
import lk.yathratravels.employee.Employee;
import lk.yathratravels.employee.EmployeeDao;
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

    @Autowired
    private EmployeeDao empDao;

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
            inqView.addObject("loggeduserroles", new ObjectMapper().writeValueAsString(roleNames));

            // get logged users' employee id to filter his own assigned inqs
            inqView.addObject("loggedUserEmpId", loggedUser.getEmployee_id().getId());

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

        return inqDao.findAll();
        // return inqDao.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @GetMapping(value = "/inq/codeandclient", params = { "id" }, produces = "application/json")
    public Inq getClientNameAndCode(@RequestParam("id") Integer id) {
        return inqDao.getClientnameAndCodeById(id);
    }

    @GetMapping(value = "/inq/personal", params = { "empid" }, produces = "application/json")
    public List<Inq> getPersonalAssignedInquiries(@RequestParam("empid") Integer empid) {

        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // user dao and auth eke logged userge USER obj samanada kiyala

        return inqDao.returnPersonalInqsByEmpId(empid);
    }

    @GetMapping(value = "/inq/personal/active", params = { "empid" }, produces = "application/json")
    public List<Inq> getOnlyActivePersonalAssignedInquiries(@RequestParam("empid") Integer empid) {

        return inqDao.getOnlyWorkingInqsByAssignedEmp(empid);
    }

    // get only the active ones
    @GetMapping(value = "/inq/active", produces = "application/json")
    public List<Inq> getOnlyActiveInquiries() {
        return inqDao.getOnlyActiveInqs();
    }

    // get only the confirmed ones
    @GetMapping(value = "/inq/confirmed", produces = "application/json")
    public List<Inq> getOnlyConfirmedInquiries() {
        return inqDao.getOnlyConfirmedInqs();
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

            Integer empId = empDao.getLeastBusyAgent();

            if (empId != null) {
                Employee emp = empDao.findById(empId).get();
                inq.setAssigned_empid(emp);
                inq.setInq_status("Assigned");
            } else {
                inq.setAssigned_empid(null);
                inq.setInq_status("New");
            }

            inqDao.save(inq);

            // Followup fup = new Followup;

            return "OK";

        } catch (Exception e) {
            return "save not completed : " + e.getMessage();
        }
    }

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

            Integer empId = empDao.getLeastBusyAgent();

            if (empId != null) {
                Employee emp = empDao.findById(empId).get();
                inq.setAssigned_empid(emp);
                inq.setInq_status("Assigned");
            } else {
                inq.setAssigned_empid(null);
                inq.setInq_status("New");
            }

            inqDao.save(inq);

            return "OK";

        } catch (Exception e) {
            return "save not completed : " + e.getMessage();
        }
    }

}
