package lk.yathratravels.tpkg;

import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.User;
import lk.yathratravels.user.UserDao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@RestController
public class PriceModsController {

    @Autowired
    private PrivilegeServices privilegeService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private PriceModsDao priceModsDao;

    @Autowired
    private PriceModHistoryDao priceModHistoryDao;

    // Display Price Modifiers UI
    @RequestMapping(value = "/pricemods", method = RequestMethod.GET)
    public ModelAndView showPriceModsUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "PRICE_MODIFIERS");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            ModelAndView lost = new ModelAndView();
            lost.setViewName("lost.html");
            return lost;
        } else {
            ModelAndView view = new ModelAndView();
            view.setViewName("pricemods.html");
            view.addObject("loggedUserUN", auth.getName());
            view.addObject("title", "Yathra Price Modifiers");
            view.addObject("moduleName", "Modifier Config");

            User loggedUser = userDao.getUserByUsername(auth.getName());
            view.addObject("loggedUserCompanyEmail", loggedUser.getWork_email());

            return view;
        }
    }

    // Get latest price modifier ✅✅✅
    @GetMapping(value = "/pricemods/all", produces = "application/json")
    public PriceMods getLatestPriceModifier() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "PRICE_MODIFIERS");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return null;
        }

        return priceModsDao.findLatestEntry();
    }

    // Get all price modifiers 💥💥💥not used
    @GetMapping(value = "/pricemods/all/original", produces = "application/json")
    public List<PriceMods> getAllPriceModifiers() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "PRICE_MODIFIERS");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<>();
        }

        return priceModsDao.findAll();
    }

    // Get latest active price modifier
    // @GetMapping(value = "/pricemods/active", produces = "application/json")
    // public Optional<PriceMods> getActivePriceModifier() {
    //
    // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    // Privilege privilegeLevelForLoggedUser =
    // privilegeService.getPrivileges(auth.getName(), "PRICE_MODIFIERS");
    //
    // if (!privilegeLevelForLoggedUser.getPrvselect()) {
    // return Optional.empty();
    // }
    //
    // return priceModsDao.getLatestActiveModifiers();
    // }

    // Update Price Modifier
    @PutMapping(value = "/pricemods")
    @Transactional
    public String updatePriceModifier(@RequestBody PriceMods priceModNew) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "PRICE_MODIFIERS");

        if (!privilegeLevelForLoggedUser.getPrvupdate()) {
            return "You do not have permission to update a price modifier.";
        }

        try {

            PriceMods existingPMRow = priceModsDao.findLatestEntry();

            if (existingPMRow != null) {
                priceModNew.setId(existingPMRow.getId());
            }

            priceModNew.setLastmodifieddatetime(LocalDateTime.now());
            priceModNew.setLastmodifieduserid(userDao.getUserByUsername(auth.getName()).getId());

            PriceMods savedPM = priceModsDao.save(priceModNew);

            

            return "OK";

        } catch (Exception e) {
            return "Update Not Completed Because: " + e.getMessage();
        }
    }

}
