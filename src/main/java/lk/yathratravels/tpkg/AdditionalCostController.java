package lk.yathratravels.tpkg;

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

import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.UserDao;

@RestController
public class AdditionalCostController {

    @Autowired
    private AdditionalCostDao additionalCostDao;

    @Autowired
    private PrivilegeServices privilegeService;

    @Autowired
    private UserDao userDao;

    // get all additional costs
    @GetMapping(value = "/additionalcosts/all", produces = "application/json")
    public List<AdditionalCost> geAdditionalCosts() {

        // mekata wenama module ekak hadala privi oneda? 💥
        return additionalCostDao.findAll();

    }

    @PostMapping(value = "/additionalcosts")
    public String saveAddCosts(@RequestBody AdditionalCost additionalCost) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        try {
            additionalCost.setAddeddatetime(LocalDateTime.now());
            additionalCost.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());
            additionalCostDao.save(additionalCost);
            return "OK";
        } catch (Exception e) {
            return "Error saving additional cost : " + e.getMessage();
        }

    }

    @PutMapping(value = "/additionalcosts")
    public String updateAddCosts(@RequestBody AdditionalCost additionalCost) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        try {
            additionalCost.setLastmodifieddatetime(LocalDateTime.now());
            additionalCost.setLastmodifieduserid(userDao.getUserByUsername(auth.getName()).getId());
            additionalCostDao.save(additionalCost);
            return "OK";
        } catch (Exception e) {
            return "Error updating additional cost : " + e.getMessage();
        }

    }

}
