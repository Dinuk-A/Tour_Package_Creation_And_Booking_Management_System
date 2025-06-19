package lk.yathratravels.tpkg;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.UserDao;

import java.util.*;

@RestController
public class PriceModHistoryController {

    @Autowired
    private PrivilegeServices privilegeService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private PriceModHistoryDao priceModHistoryDao;

    // Get all price modifier history
    @GetMapping(value = "/pricemodhistory/all", produces = "application/json")
    public List<PriceModHistory> getAllPriceModifierHistory() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "PRICE_MODIFIERS");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<PriceModHistory>();
        }

        return priceModHistoryDao.findAll(Sort.by(Direction.DESC, "id"));
    }

}
