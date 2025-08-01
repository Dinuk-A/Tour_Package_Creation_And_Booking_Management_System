package lk.yathratravels.payment;

import java.math.BigDecimal;
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

import lk.yathratravels.bookings.Booking;
import lk.yathratravels.bookings.BookingDao;
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

    @Autowired
    private BookingDao bookingDao;

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

    // get NEXT payment code
    private void assignNextPaymentCode(Payment payment) {
        String nextPaymentCode = paymentDao.getNextPaymentCode();
        if (nextPaymentCode == null || nextPaymentCode.equals("")) {
            payment.setPaymentcode("TRX000001");
        } else {
            payment.setPaymentcode(nextPaymentCode);
        }
    }

    // changes in bookings entity common fn
    private void updateBookingPayments(Payment payment) {

        Booking booking = payment.getBooking_id();
        if (booking == null)
            return;

        // get values or default to 0
        BigDecimal existingTotalPaid = booking.getTotal_paid() != null ? booking.getTotal_paid() : BigDecimal.ZERO;
        BigDecimal paymentAmount = payment.getPaid_amount() != null ? payment.getPaid_amount()
                : BigDecimal.ZERO;

        // calulate new total paid = existing_total_paid + new payment_amount
        BigDecimal newTotalPaid = existingTotalPaid.add(paymentAmount);
        booking.setTotal_paid(newTotalPaid);

        // calculate new due balance = final_price - total_paid
        BigDecimal finalPrice = booking.getFinal_price() != null ? booking.getFinal_price() : BigDecimal.ZERO;
        BigDecimal newDueBalance = finalPrice.subtract(newTotalPaid);
        booking.setDue_balance(newDueBalance);

        // check if full payment is complete, then set the flag is_full_payment_complete
        if (newDueBalance.doubleValue() <= 0.0) {
            booking.setIs_full_payment_complete(true);
        } else {
            booking.setIs_full_payment_complete(false);
        }

        // update paymnt status of a new booking when paying for first time
        if (booking.getPayment_status() == null || booking.getPayment_status().isEmpty()
                || booking.getPayment_status().equals("Payment_Pending")) {
            booking.setPayment_status("Partially_Paid");
        }

        /// check if advancement amount is paid
        if (booking.getAdvancement_amount() != null
                && booking.getAdvancement_amount().doubleValue() > 0.0) {

            if (newTotalPaid.doubleValue() >= booking.getAdvancement_amount().doubleValue()) {
                booking.setPayment_status("Advance_Paid");
                booking.setBooking_status("Assignment_Pending");
            }

        }

        /*
         * if (newDueBalance.doubleValue() <= 0.0) {
         * booking.setBooking_status("Fully_Paid");
         * } else if (booking.getAdvancement_amount() != null
         * && booking.getAdvancement_amount().doubleValue() > 0.0
         * && newTotalPaid.doubleValue() >=
         * booking.getAdvancement_amount().doubleValue()) {
         * booking.setBooking_status("Advance_Paid");
         * }
         * 
         */

        // check if all payments are done
        if (newDueBalance.doubleValue() <= 0.0) {
            booking.setPayment_status("Fully_Paid");
        }

        bookingDao.save(booking);

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
            assignNextPaymentCode(payment);

            payment.setAddeddatetime(LocalDateTime.now());
            payment.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());
            paymentDao.save(payment);

            // changes in bookings entity
            updateBookingPayments(payment);

            return "OK";
        } catch (Exception e) {
            return "Error updating additional cost : " + e.getMessage();
        }

    }

    // when payment is done by cust from website
    @PostMapping(value = "/paymentbycust")
    public String addPaymentByCust(@RequestBody Payment payment) {

        try {

            // generate nextPaymentCode
            assignNextPaymentCode(payment);

            payment.setAddeddatetime(LocalDateTime.now());
            payment.setAddeduserid(-10);
            paymentDao.save(payment);

            // changes in bookings entity
            updateBookingPayments(payment);

            return "OK";
        } catch (Exception e) {
            return "Error updating additional cost : " + e.getMessage();
        }

    }

}
