package lk.yathratravels.tpkg;

import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.Role;
import lk.yathratravels.user.User;
import lk.yathratravels.user.UserDao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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
    public ModelAndView showPriceModsUI() throws JsonProcessingException {

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

            // get all the roles as a custom array
            List<String> roleNames = loggedUser.getRoles()
                    .stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());
            view.addObject("loggeduserroles", new ObjectMapper().writeValueAsString(roleNames));

            return view;
        }
    }

    // Get latest price modifier ✅✅✅
    @GetMapping(value = "/pricemods/all", produces = "application/json")
    public PriceMods getLatestPriceModifier() {

        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // Privilege privilegeLevelForLoggedUser =
        // privilegeService.getPrivileges(auth.getName(), "PRICE_MODIFIERS");
        //
        // if (!privilegeLevelForLoggedUser.getPrvselect()) {
        // return null;
        // }

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

            if (existingPMRow == null) {
                return "Update Not Completed: No existing price modifier entry found.";
            }

            // for price mod history
            PriceModHistory history = new PriceModHistory();

            history.setOld_cpm(existingPMRow.getCompany_profit_margin());
            history.setOld_ed_dc(existingPMRow.getExt_driver_daily_charge());
            history.setOld_eg_dc(existingPMRow.getExt_guide_daily_charge());
            history.setOld_id_dc(existingPMRow.getInt_driver_daily_cost());
            history.setOld_ig_dc(existingPMRow.getInt_guide_daily_cost());
            history.setOld_loyd(existingPMRow.getLoyalty_discount());
            history.setOld_offpd(existingPMRow.getOff_peak_discount());
            history.setOld_promo(existingPMRow.getTemp_promo_discount());
            // history.setOld_evp(existingPMRow.getExt_vehicle_percentage());

            history.setOri_addeduserid(existingPMRow.getAddeduserid());
            history.setOri_addeddatetime(existingPMRow.getAddeddatetime());

            history.setOri_updateduserid(existingPMRow.getUpdateduserid());
            history.setOri_updateddatetime(existingPMRow.getUpdateddatetime());

            history.setNote("Price Modifier Updated, recording history");

            priceModHistoryDao.save(history);

            // preserve the same previous values
            priceModNew.setAddeddatetime(existingPMRow.getAddeddatetime());
            priceModNew.setAddeduserid(existingPMRow.getAddeduserid());

            // for price mods
            priceModNew.setId(existingPMRow.getId());
            priceModNew.setUpdateddatetime(LocalDateTime.now());
            priceModNew.setUpdateduserid(userDao.getUserByUsername(auth.getName()).getId());

            priceModsDao.save(priceModNew);

            return "OK";

        } catch (Exception e) {
            return "Update Not Completed Because: " + e.getMessage();
        }
    }

}
