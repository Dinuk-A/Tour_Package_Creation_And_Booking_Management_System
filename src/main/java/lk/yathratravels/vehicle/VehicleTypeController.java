package lk.yathratravels.vehicle;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.yathratravels.privilege.Privilege;
import lk.yathratravels.privilege.PrivilegeServices;
import lk.yathratravels.user.User;
import lk.yathratravels.user.UserDao;

@RestController
public class VehicleTypeController {

    @Autowired
    private VehicleTypeDao vTypeDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private PrivilegeServices privilegeService;

    // mapping for get the vehicle type UI
    @RequestMapping(value = "/vehitype", method = RequestMethod.GET)
    public ModelAndView VehicleTypeUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "TRANSPORT");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {

            ModelAndView lost = new ModelAndView();
            lost.setViewName("lost.html");
            return lost;

        } else {

            ModelAndView vehicleTypeView = new ModelAndView();
            vehicleTypeView.setViewName("vehitype.html");
            vehicleTypeView.addObject("loggedusername", auth.getName());
            vehicleTypeView.addObject("title", "Yathra Vehicle Types");
            User loggedUser = userDao.getUserByUsername(auth.getName());
            vehicleTypeView.addObject("loggedUserCompanyEmail", loggedUser.getWork_email());

            return vehicleTypeView;
        }
    }

    @GetMapping(value = "/vehitypes/all", produces = "application/json")
    public List<VehicleType> getAllVehicleTypes() {
        return vTypeDao.findAll();
    }

    // POST mapping to add a new vehicle type
    @PostMapping(value = "/vehitype")
    public String saveVehicleType(@RequestBody VehicleType vehitype) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "TRANSPORT");

        if (!privilegeLevelForLoggedUser.getPrvinsert()) {
            return "Vehicle Type Save Not Completed; You Don't Have Permission";
        }

        try {
            vTypeDao.save(vehitype);
            return "OK";
        } catch (Exception e) {
            return "Save Not Completed : " + e.getMessage();
        }
    }

    // PUT mapping to update vehicle type
    @PutMapping(value = "/vehitype")
    public String updateVehicleType(@RequestBody VehicleType vehitype) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "TRANSPORT");

        if (!privilegeLevelForLoggedUser.getPrvupdate()) {
            return "Vehicle Type Update Not Completed; You Don't Have Permission";
        }

        // check existence
        VehicleType existingType = vTypeDao.getReferenceById(vehitype.getId());
        if (existingType == null) {
            return "Update Not Completed; Vehicle Type Not Found";
        }

        try {
            vTypeDao.save(vehitype);
            return "OK";

        } catch (Exception e) {
            return "Update Not Completed; " + e.getMessage();
        }
    }

    // delete mapping for vehicle type
    @DeleteMapping(value = "/vehitype")
    public String deleteVehicleType(@RequestBody VehicleType vehitype) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "TRANSPORT");

        if (!privilegeLevelForLoggedUser.getPrvdelete()) {
            return "Vehicle Type Delete Not Completed; You Don't Have Permission";
        }

        try {
            VehicleType existingType = vTypeDao.getReferenceById(vehitype.getId());

            if (existingType == null) {
                return "Delete Not Completed; Vehicle Type Not Found";
            }

            vTypeDao.save(existingType);
            return "OK";

        } catch (Exception e) {
            return "Delete Not Completed; " + e.getMessage();
        }
    }

}
