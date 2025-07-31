package lk.yathratravels.bookings;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;

import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.Role;
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
    public ModelAndView bookingUI() throws JsonProcessingException {

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

            // get all the roles as a custom array
            List<String> roleNames = loggedUser.getRoles()
                    .stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());
            bookingView.addObject("loggeduserroles", new ObjectMapper().writeValueAsString(roleNames));

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

    // get unpaid new bookings (where is_full_payment_complete is false or null)
    @GetMapping(value = "/booking/unpaid", produces = "application/json")
    public List<Booking> getUnpaidBookings() {

        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        //
        // Privilege privilegeLevelForLoggedUser =
        // privilegeService.getPrivileges(auth.getName(), "BOOKING");
        //
        // if (!privilegeLevelForLoggedUser.getPrvselect()) {
        // return new ArrayList<>();
        // }

        return bookingDao.getUnpaidNewBookings();
    }

    // update a booking (assign vehicles, personnel, etc)
    @PutMapping(value = "/booking")
    @Transactional
    public String updateBooking(@RequestBody Booking booking) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "BOOKING");

        if (!privilegeLevelForLoggedUser.getPrvupdate()) {
            return "Update Not Completed; You Dont Have Permission";
        }

        try {
            booking.setLastmodifieddatetime(LocalDateTime.now());
            booking.setLastmodifieduserid(userDao.getUserByUsername(auth.getName()).getId());

            for (ExtVehicles vehi : booking.getExternalVehicles()) {
                vehi.setBooking(booking);
            }

            for (ExtPersonnel personnel : booking.getExternalPersonnels()) {
                personnel.setBooking(booking);
            }

            for (SurchargeFee fee : booking.getSurchargeList()) {
                fee.setAddeddatetime(LocalDateTime.now());
                fee.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());
                System.out.println("Adding Surcharge Fee: " + fee.getReason() + " - " + fee.getAmount());
                fee.setBooking(booking);
            }

            bookingDao.save(booking);

            return "OK";
        } catch (Exception e) {
            return "Update Not Completed Because :" + e.getMessage();
        }

    }

    // reusable method to get next booking code
    private void assignNextBookingCode(Booking booking) {
        String nextBookingCode = bookingDao.getNextBookingCode();
        if (nextBookingCode == null || nextBookingCode.equals("")) {
            booking.setBookingcode("BK00001");
        } else {
            booking.setBookingcode(nextBookingCode);
        }
    }

}
