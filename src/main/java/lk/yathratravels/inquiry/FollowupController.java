package lk.yathratravels.inquiry;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.transaction.Transactional;
import lk.yathratravels.bookings.Booking;
import lk.yathratravels.bookings.BookingDao;
import lk.yathratravels.client.Client;
import lk.yathratravels.client.ClientDao;
import lk.yathratravels.employee.Employee;
import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.tpkg.TourPkg;
import lk.yathratravels.user.UserDao;

@RestController
public class FollowupController {

    @Autowired
    private FollowupDao followupDao;

    @Autowired
    private PrivilegeServices privilegeService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private InqDao inqDao;

    @Autowired
    private ClientDao clientDao;

    @Autowired
    private BookingDao bookingDao;

    // get all followups
    @GetMapping(value = "/followup/all", produces = "application/json")
    public List<Followup> getAllFollowups() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "INQUIRY");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<Followup>();
        }

        return followupDao.findAll();

    }

    // get followups by inq id
    @GetMapping(value = "/followup/byinqid/{inqId}", produces = "application/JSON")
    public List<Followup> getFollowupsByInq(@PathVariable("inqId") int inquiryID) {

        return followupDao.getAllFollowupsByInqId(inquiryID);
    }

    // save a followup also with inq detail updates
    @PostMapping(value = "/followupwithinq")
    @Transactional
    public String addNewFollowupWithInqUpdates(@RequestBody Followup flwup) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        //
        // Privilege privilegeLevelForLoggedUser =
        // privilegeService.getPrivileges(auth.getName(), "INQUIRY");

        // if (!privilegeLevelForLoggedUser.getPrvinsert()) {
        // return "Update Not Completed; You Dont Have Permission";
        // }

        try {
            flwup.setAddeddatetime(LocalDateTime.now());
            flwup.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());

            followupDao.save(flwup);

            // if this is the first time giving a followup
            if (flwup.getInquiry_id().getInq_status().equals("New")
                    || flwup.getInquiry_id().getInq_status().equals("Assigned")) {
                flwup.getInquiry_id().setInq_status("Working");
            }

            // update the inquiry with the newly got data by calls/e,mails
            inqDao.save(flwup.getInquiry_id());

            return "OK";

        } catch (Exception e) {
            return "Error Saving Followup Update: " + e.getMessage();
        }

    }

    //
    // Privilege privilegeLevelForLoggedUser =
    // privilegeService.getPrivileges(auth.getName(), "INQUIRY");

    // if (!privilegeLevelForLoggedUser.getPrvinsert()) {
    // return "Update Not Completed; You Dont Have Permission";
    // }

    // save just the followup
    @PostMapping(value = "/followup")
    @Transactional
    public String addNewFollowup(@RequestBody Followup flwup) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        try {
            flwup.setAddeddatetime(LocalDateTime.now());
            flwup.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());

            followupDao.save(flwup);

            // if this is the first time giving a followup
            if (flwup.getInquiry_id().getInq_status().equals("New")
                    || flwup.getInquiry_id().getInq_status().equals("Assigned")) {
                flwup.getInquiry_id().setInq_status("Working");
            }

            // if cx agreed to book
            if (flwup.getFollowup_status().equals("good_to_book")) {
                flwup.getInquiry_id().setInq_status("Confirmed");

                Inq inq = flwup.getInquiry_id();
                Optional<Client> clientOpt = clientDao.findByEmail(inq.getEmail());

                Client finalClient;
                if (clientOpt.isPresent()) {
                    finalClient = clientOpt.get();
                } else {
                    Client newClient = new Client();
                    newClient.setFullname(inq.getClientname());
                    newClient.setPassportornic(inq.getPassportnumornic());
                    newClient.setContactone(inq.getContactnum());
                    newClient.setContacttwo(inq.getContactnumtwo());
                    newClient.setEmail(inq.getEmail());
                    newClient.setNote(inq.getNote());
                    newClient.setCli_status("Active");
                    newClient.setNationality_id(inq.getNationality_id());

                    finalClient = clientDao.save(newClient);
                }

                Booking newBooking = new Booking();
                newBooking.setClient(finalClient);

                TourPkg lastSentPkg = followupDao.getTpkgOfLastSent(inq.getId()).getLast_sent_tpkg();
                newBooking.setTpkg(lastSentPkg);

                newBooking.setStartdate(inq.getInq_apprx_start_date());
                newBooking.setBooking_status("Pending");

                bookingDao.save(newBooking);
            }

            return "OK";

        } catch (Exception e) {
            return "Error Saving New Followup: " + e.getMessage();
        }

    }

}
