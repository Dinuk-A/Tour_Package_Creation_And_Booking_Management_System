package lk.yathratravels.vehicle;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.UserDao;

@RestController
public class VehicleController {

    @Autowired
    private VehicleDao vehiDao;

    @Autowired
    private VehicleTypeDao vehicleTypeDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private PrivilegeServices privilegeService;

    // mapping for get the vehicle UI
    @RequestMapping(value = "/vehicle", method = RequestMethod.GET)
    public ModelAndView VehicleUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "TRANSPORT");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {

            ModelAndView lost = new ModelAndView();
            lost.setViewName("lost.html");
            return lost;

        } else {

            ModelAndView vehicleView = new ModelAndView();
            vehicleView.setViewName("vehicle.html");
            vehicleView.addObject("loggedusername", auth.getName());
            vehicleView.addObject("title", "Yathra Vehicles");

            return vehicleView;
        }
    }

    // mapping for get vehicle all data
    @GetMapping(value = "/vehicle/all", produces = "application/json")
    public List<Vehicle> getAllVehicles() {

        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Privilege loggedUserPrivilege =
        // prvcntrler.getPrivilegesByUserAndModule(auth.getName(), "TRANSPORT");

        // if (!loggedUserPrivilege.getPrivselect()) {
        // return new ArrayList<Vehicle>();
        // }

        return vehiDao.findAll(Sort.by(Direction.DESC, "id"));
    }
}
