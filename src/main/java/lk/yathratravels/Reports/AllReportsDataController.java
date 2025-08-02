package lk.yathratravels.Reports;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.Role;
import lk.yathratravels.user.User;
import lk.yathratravels.user.UserDao;

@RestController
public class AllReportsDataController {

    @Autowired
    private InqReportsDao inqReportsDao;

    @Autowired
    private PaymentReportsDao paymentRepDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private PrivilegeServices privilegeService;

    // ++++++++++++++++++++++++++++ INQ REPORTS +++++++++++++++++++++++++++//

    // ui for inq report
    @RequestMapping(value = "/inqreports", method = RequestMethod.GET)
    public ModelAndView inqReportsUI() throws JsonProcessingException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "INQUIRY");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {

            ModelAndView lost = new ModelAndView();
            lost.setViewName("lost.html");
            return lost;

        } else {

            ModelAndView inqReportsView = new ModelAndView();
            inqReportsView.setViewName("inqreport.html");
            inqReportsView.addObject("loggedUserUN", auth.getName());
            inqReportsView.addObject("title", "Inquiry Reports");
            inqReportsView.addObject("moduleName", "Yathra Reports");

            // User loggedUser = userDao.getUserByUsername(auth.getName());
            // inqReportsView.addObject("loggedUserCompanyEmail",
            // loggedUser.getWork_email());
            //
            // List<String> roleNames = loggedUser.getRoles()
            // .stream()
            // .map(Role::getName)
            // .collect(Collectors.toList());
            // inqReportsView.addObject("loggeduserroles", new
            // ObjectMapper().writeValueAsString(roleNames));

            return inqReportsView;
        }
    }

    // All received inquiries between two dates
    @GetMapping(value = "report/allinqsbygivendate/{startDate}/{endDate}", produces = "application/json")
    public long countInqsRecieved(@PathVariable("startDate") String startDate,
            @PathVariable("endDate") String endDate) {
        return inqReportsDao.countInquiriesByGivenDays(LocalDate.parse(startDate), LocalDate.parse(endDate));
    }

    // All confirmed inquiries between two dates
    @GetMapping(value = "report/confirmedinqs/{startDate}/{endDate}", produces = "application/json")
    public long countSuccessInqs(@PathVariable("startDate") String startDate,
            @PathVariable("endDate") String endDate) {
        return inqReportsDao.countConfirmedInquiries(LocalDate.parse(startDate), LocalDate.parse(endDate));
    }

    // All dropped (closed) inquiries between two dates
    @GetMapping(value = "report/droppedinqs/{startDate}/{endDate}", produces = "application/json")
    public long countDroppedInqs(@PathVariable("startDate") String startDate,
            @PathVariable("endDate") String endDate) {
        return inqReportsDao.countDroppedInquiries(LocalDate.parse(startDate), LocalDate.parse(endDate));
    }

    // +++++++++++++++++++++++++++++ PAYMENT REPORTS +++++++++++++++++++++++++++//

    @RequestMapping(value = "/paymentreports", method = RequestMethod.GET)
    public ModelAndView paymentReportsUI() throws JsonProcessingException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "PAYMENT");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {

            ModelAndView lost = new ModelAndView();
            lost.setViewName("lost.html");
            return lost;

        } else {

            ModelAndView paymentReportsView = new ModelAndView();
            paymentReportsView.setViewName("paymentreport.html");
            paymentReportsView.addObject("loggedUserUN", auth.getName());
            paymentReportsView.addObject("title", "Yathra Payment Reports");
            paymentReportsView.addObject("moduleName", "Yathra Reports");

            // User loggedUser = userDao.getUserByUsername(auth.getName());
            // paymentReportsView.addObject("loggedUserCompanyEmail",
            // loggedUser.getWork_email());
            // List<String> roleNames = loggedUser.getRoles()
            // .stream()
            // .map(Role::getName)
            // .collect(Collectors.toList());
            // paymentReportsView.addObject("loggeduserroles", new
            // ObjectMapper().writeValueAsString(roleNames));

            return paymentReportsView;
        }
    }

     // sum off all payments recieved by gieven time period
    @GetMapping("report/sumofpayments/{startDate}/{endDate}")
    public BigDecimal getSumOfPaymentsByGivenDate(@PathVariable("startDate") String startDate,
            @PathVariable("endDate") String endDate) {
        return paymentRepDao.findTotalPaidAmountByDateRange(LocalDate.parse(startDate), LocalDate.parse(endDate));
    }

}
