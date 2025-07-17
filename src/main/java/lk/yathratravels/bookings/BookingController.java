package lk.yathratravels.bookings;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;

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
            bookingView.addObject("title", "Yathra Booking");
            bookingView.addObject("moduleName", "Booking Management");

            User loggedUser = userDao.getUserByUsername(auth.getName());
            bookingView.addObject("loggedUserCompanyEmail", loggedUser.getWork_email());

            return bookingView;
        }
    }

     // get all booking list from DB
    @GetMapping(value = "/booking/all", produces = "application/json")
    public List<Booking> getAllBookings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "BOOKING");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<Booking>();
        }

        return bookingDao.findAll(Sort.by(Direction.DESC, "id"));
    }
    
}
