package lk.yathratravels.payment;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.tpkg.AdditionalCost;
import lk.yathratravels.user.Role;
import lk.yathratravels.user.User;
import lk.yathratravels.user.UserDao;

@RestController
public class PaymentController {

    @Autowired
    private PrivilegeServices privilegeService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private PaymentDao paymentDao;

    // display payment UI
    @RequestMapping(value = "/payment", method = RequestMethod.GET)
    public ModelAndView showpaymentUI() throws JsonProcessingException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "PAYMENT");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {

            ModelAndView lost = new ModelAndView();
            lost.setViewName("lost.html");
            return lost;

        } else {

            ModelAndView paymentView = new ModelAndView();
            paymentView.setViewName("payment.html");
            paymentView.addObject("loggedUserUN", auth.getName());
            paymentView.addObject("title", "Yathra Payments");
            paymentView.addObject("moduleName", "Payments Management");

            User loggedUser = userDao.getUserByUsername(auth.getName());
            paymentView.addObject("loggedUserCompanyEmail", loggedUser.getWork_email());

            // get logged users'id to filter his own assigned inqs
            paymentView.addObject("loggedUserId", loggedUser.getId());

            // get logged users' employee id to filter his own assigned inqs
            paymentView.addObject("loggedUserEmpId", loggedUser.getEmployee_id().getId());

            // get all the roles as a custom array
            List<String> roleNames = loggedUser.getRoles()
                    .stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());
            paymentView.addObject("loggeduserroles", new ObjectMapper().writeValueAsString(roleNames));

            return paymentView;
        }
    }

    // get all employee list from DB
    @GetMapping(value = "/payment/all", produces = "application/json")
    public List<Payment> getAllPayments() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "PAYMENT");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<Payment>();
        }

        return paymentDao.findAll(Sort.by(Direction.DESC, "id"));
    }

    // when payment added by an employee
    @PostMapping(value = "/paymentbyemp")
    public String addPaymentByEmp(@RequestBody Payment payment) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "PAYMENT");

        if (!privilegeLevelForLoggedUser.getPrvinsert()) {
            return "You do not have permission to add a new Payment.";
        }

        try {

            // generate nextPaymentCode
            String nextPaymentCode = paymentDao.getNextPaymentCode();

            if (nextPaymentCode.equals(null) || nextPaymentCode.equals("")) {
                payment.setPaymentcode("PAY000001");
            } else {
                payment.setPaymentcode(nextPaymentCode);
            }

            payment.setAddeddatetime(LocalDateTime.now());
            payment.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());
            paymentDao.save(payment);
            return "OK";
        } catch (Exception e) {
            return "Error updating additional cost : " + e.getMessage();
        }

    }

    // when payment is done by cust from website
    @PostMapping(value = "/paymentbycust")
    public String addPaymentByCust(@RequestBody Payment payment) {

        try {
            payment.setAddeddatetime(LocalDateTime.now());
            payment.setAddeduserid(-10);
            paymentDao.save(payment);
            return "OK";
        } catch (Exception e) {
            return "Error updating additional cost : " + e.getMessage();
        }

    }

}
