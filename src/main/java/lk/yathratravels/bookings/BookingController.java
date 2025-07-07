package lk.yathratravels.bookings;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.User;
import lk.yathratravels.user.UserDao;

@RestController
public class BookingController {
    @Autowired
    private UserDao userDao;

    @Autowired
    private PrivilegeServices privilegeService;

    @Autowired
    private BookingDao bookingDao;

    // display booking UI
    @RequestMapping(value = "/booking", method = RequestMethod.GET)
    public ModelAndView bookingUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "BOOKING");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {

            ModelAndView lost = new ModelAndView();
            lost.setViewName("lost.html");
            return lost;

        } else {

            ModelAndView bookingView = new ModelAndView();
            bookingView.setViewName("booking.html");
            bookingView.addObject("loggedUserUN", auth.getName());
            bookingView.addObject("title", "Yathra Attraction");
            bookingView.addObject("moduleName", "Attraction Management");

            User loggedUser = userDao.getUserByUsername(auth.getName());
            bookingView.addObject("loggedUserCompanyEmail", loggedUser.getWork_email());

            return bookingView;
        }
    }
}
