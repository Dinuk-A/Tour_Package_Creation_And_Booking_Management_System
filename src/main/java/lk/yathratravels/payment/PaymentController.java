package lk.yathratravels.payment;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "payment");

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
}
