package lk.yathratravels.tpkg;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.User;
import lk.yathratravels.user.UserDao;

@RestController
public class TourPkgController {

    @Autowired
    private PrivilegeServices privilegeService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private TourPkgDao daoTPkg;

    // display tpkg UI
    @RequestMapping(value = "/tourpackage", method = RequestMethod.GET)
    public ModelAndView showTpkgUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "TOUR_PACKAGE");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {

            ModelAndView lost = new ModelAndView();
            lost.setViewName("lost.html");
            return lost;

        } else {

            ModelAndView tpkgView = new ModelAndView();
            tpkgView.setViewName("tpkg.html");
            tpkgView.addObject("loggedUserUN", auth.getName());
            tpkgView.addObject("title", "Yathra Tour Package");
            tpkgView.addObject("moduleName", "Tour Package Builder");

            User loggedUser = userDao.getUserByUsername(auth.getName());
            tpkgView.addObject("loggedUserCompanyEmail", loggedUser.getWork_email());

            return tpkgView;
        }
    }

    // get all tour packages
    @GetMapping(value = "/tpkg/all", produces = "application/json")
    public List<TourPkg> getAllTourPkgs() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "TOUR_PACKAGE");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<TourPkg>(); 
        }

        return daoTPkg.findAll(Sort.by(Direction.DESC, "id"));
    }

}
