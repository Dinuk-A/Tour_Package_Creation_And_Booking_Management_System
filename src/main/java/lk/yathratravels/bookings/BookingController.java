package lk.yathratravels.bookings;

import java.time.LocalDate;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;

import lk.yathratravels.Reports.UpcomingToursDTO;
import lk.yathratravels.client.ClientDao;
import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.tpkg.TourPkg;
import lk.yathratravels.tpkg.TourPkgDao;
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

    @Autowired
    private TourPkgDao tourPkgDao;

    @Autowired
    private ClientDao clientDao;

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

    // reusable method to get next booking code
    private void assignNextBookingCode(Booking booking) {
        String nextBookingCode = bookingDao.getNextBookingCode();
        if (nextBookingCode == null || nextBookingCode.equals("")) {
            booking.setBookingcode("BK00001");
        } else {
            booking.setBookingcode(nextBookingCode);
        }
    }

    // in dashboard
    @GetMapping(value = "/booking/assignmentspending", produces = "application/json")
    public List<Booking> getPendingAssignments() {
        return bookingDao.getAllPendingAssignments();
    }

    // get booking count
    @GetMapping(value = "/completed/count", params = { "clientid" }, produces = "application/json")
    public int countCompletedBookingsByClient(@RequestParam("clientid") Integer clientId) {
        return clientDao.countCompletedBookingsByClientNative(clientId);
    }

    // upcoming tours
    @GetMapping("/report/upcomingtours")
    public List<UpcomingToursDTO> getUpcomingTours() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        return bookingDao.findUpcomingTours(tomorrow);
    }

    // upcoming tours not fully paid and not cancelled/refunded
    @GetMapping("/report/upcomingtours/unpaid")
    public List<UpcomingToursDTO> getUpcomingToursNotFullyPaidAndNotCancelled() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        return bookingDao.findUpcomingToursNotFullyPaidAndNotCancelled(tomorrow);
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

            // update start and end dates of original tpkg
            TourPkg tpkg = booking.getTpkg();

            // not working 💥💥💥
            if (booking.getStartdate() != null && booking.getEnddate() != null) {
                tpkg.setTourstartdate(booking.getStartdate());
                tpkg.setTourenddate(booking.getEnddate());
                System.out.println("updating days in tpkg");
                // tourPkgDao.save(tpkg);
            }

            if (booking.getBooking_status().equals("Assignment_Pending")) {
                checkAssignmentCompleteOrNot(booking);
            }

            bookingDao.save(booking);

            return "OK";
        } catch (Exception e) {
            return "Update Not Completed Because :" + e.getMessage();
        }

    }

    // check the assignment status of the booking
    private void checkAssignmentCompleteOrNot(Booking booking) {

        // Count internal
        int internalDrivers = booking.getInt_drivers() != null ? booking.getInt_drivers().size() : 0;
        int internalGuides = booking.getInt_guides() != null ? booking.getInt_guides().size() : 0;
        int internalVehicles = booking.getInt_vehicles() != null ? booking.getInt_vehicles().size() : 0;

        // Count external drivers and guides by filtering role
        long externalDrivers = booking.getExternalPersonnels().stream()
                .filter(p -> p.getRole() != null && p.getRole().equalsIgnoreCase("Driver"))
                .count();

        long externalGuides = booking.getExternalPersonnels().stream()
                .filter(p -> p.getRole() != null && p.getRole().equalsIgnoreCase("Guide"))
                .count();

        int externalVehicles = booking.getExternalVehicles() != null ? booking.getExternalVehicles().size() : 0;

        int totalDrivers = internalDrivers + (int) externalDrivers;
        int totalGuides = internalGuides + (int) externalGuides;
        int totalVehicles = internalVehicles + externalVehicles;

        TourPkg tpkg = booking.getTpkg();
        boolean isGuideRequired = tpkg != null && Boolean.TRUE.equals(tpkg.getIs_guide_needed());

        boolean driverAndVehicleAssigned = totalDrivers > 0 && totalVehicles > 0;
        boolean guideAssigned = totalGuides > 0;

        if (isGuideRequired) {
            if (driverAndVehicleAssigned && guideAssigned) {
                booking.setBooking_status("Finalized");
            } else {
                booking.setBooking_status("Assignment_Pending");
            }
        } else {
            if (driverAndVehicleAssigned) {
                booking.setBooking_status("Finalized");
            } else {
                booking.setBooking_status("Assignment_Pending");
            }
        }
    }

}

// delete one surcharge
/*
 * @PutMapping(value = "/booking")
 * 
 * @Transactional
 * public String updateBooking(@RequestBody Booking booking) {
 * 
 * Authentication auth = SecurityContextHolder.getContext().getAuthentication();
 * 
 * Privilege privilegeLevelForLoggedUser =
 * privilegeService.getPrivileges(auth.getName(), "BOOKING");
 * 
 * if (!privilegeLevelForLoggedUser.getPrvupdate()) {
 * return "Update Not Completed; You Dont Have Permission";
 * }
 * 
 * try {
 * booking.setLastmodifieddatetime(LocalDateTime.now());
 * booking.setLastmodifieduserid(userDao.getUserByUsername(auth.getName()).getId
 * ());
 * 
 * // Handle external vehicles
 * for (ExtVehicles vehi : booking.getExternalVehicles()) {
 * vehi.setBooking(booking);
 * }
 * 
 * // Handle external personnel
 * for (ExtPersonnel personnel : booking.getExternalPersonnels()) {
 * personnel.setBooking(booking);
 * }
 * 
 * // Handle surcharge fees completely manually
 * // Step 1: Delete all existing surcharge fees for this booking
 * List<SurchargeFee> existingFees =
 * surchargeFeeRepository.findByBookingId(booking.getId());
 * surchargeFeeRepository.deleteAll(existingFees);
 * 
 * // Step 2: Save new surcharge fees
 * List<SurchargeFee> newSurcharges = new ArrayList<>();
 * for (SurchargeFee fee : booking.getSurchargeList()) {
 * fee.setId(null); // Ensure it's treated as new
 * fee.setAddeddatetime(LocalDateTime.now());
 * fee.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());
 * fee.setBooking(booking);
 * newSurcharges.add(fee);
 * System.out.println("Adding Surcharge Fee: " + fee.getReason() + " - " +
 * fee.getAmount());
 * }
 * 
 * // Clear the surcharge list to avoid Hibernate managing it
 * booking.setSurchargeList(new ArrayList<>());
 * 
 * // Save booking first
 * Booking savedBooking = bookingDao.save(booking);
 * 
 * // Then save surcharge fees separately
 * for (SurchargeFee fee : newSurcharges) {
 * fee.setBooking(savedBooking);
 * surchargeFeeRepository.save(fee);
 * }
 * 
 * return "OK";
 * } catch (Exception e) {
 * e.printStackTrace();
 * return "Update Not Completed Because :" + e.getMessage();
 * }
 * }
 */
