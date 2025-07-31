package lk.yathratravels.bookings;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import lk.yathratravels.user.UserDao;

@RestController
public class SurchargeFeeController {

    @Autowired
    private UserDao userDao;

    @Autowired
    private SurchargeFeeDao surchargeFeeDao;

    // get all
    @GetMapping(value = "/surchargefee/all", produces = "application/json")
    public List<SurchargeFee> getAllSurchargeFees() {

        return surchargeFeeDao.findAll();

    }

    // add new
    @PostMapping(value = "/surchargefee")
    public String saveSurchargeFee(@RequestBody SurchargeFee sf) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        try {
            sf.setAddeddatetime(LocalDateTime.now());
            sf.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());
            surchargeFeeDao.save(sf);
            return "OK";
        } catch (Exception e) {
            return "Error saving late charge : " + e.getMessage();
        }

    }

    // update
    @PutMapping(value = "/surchargefee")
    public String updateSurchargeFee(@RequestBody SurchargeFee sf) {

        try {
            surchargeFeeDao.save(sf);
            return "OK";
        } catch (Exception e) {
            return "Error updating late charge: " + e.getMessage();
        }

    }

}
