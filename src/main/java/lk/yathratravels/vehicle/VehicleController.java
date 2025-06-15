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
import lk.yathratravels.user.User;
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
            User loggedUser = userDao.getUserByUsername(auth.getName());
            vehicleView.addObject("loggedUserCompanyEmail", loggedUser.getWork_email());

            return vehicleView;
        }
    }

    // mapping for get vehicle all data
    @GetMapping(value = "/vehicle/all", produces = "application/json")
    public List<Vehicle> getAllVehicles() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "TRANSPORT");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<Vehicle>();
        }

        return vehiDao.findAll(Sort.by(Direction.DESC, "id"));
    }

    // mapping for get vehicle names by seats count
    @GetMapping("/vehicletypes/byminseats/{seats}")
    public List<VehicleType> getVehicleTypesByMinSeats(@PathVariable Integer seats) {
        return vehiDao.findVehicleTypeNamesByMinSeats(seats);
    }

    // mapping for get vehicle by availability
    @GetMapping(value = "vehi/availablevehiclesbyvehitype/{startDate}/{endDate}/{vehitype}", produces = "application/JSON")
    public List<Vehicle> getAvailableVehicles(@PathVariable("startDate") String startDate,
            @PathVariable("endDate") String endDate, @PathVariable("vehitype") Integer vehitype) {

        return vehiDao.getAvailableVehicleListByVehiType(LocalDate.parse(startDate), LocalDate.parse(endDate),
                vehitype);
    }

    // POST mapping for add
    @PostMapping(value = "/vehicle")
    public String saveVehicle(@RequestBody Vehicle vehicle) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "TRANSPORT");

        if (!privilegeLevelForLoggedUser.getPrvinsert()) {
            return "Vehicle Save Not Completed; You Dont Have Permission";
        }

        // check number plate duplications
        Vehicle existingVehicle = vehiDao.getVehicleByNumberPlate(vehicle.getNumberplate());
        if (existingVehicle != null) {
            return "Save Not Completed, This Vehicle Already Exists";
        }

        try {
            vehicle.setAddeddatetime(LocalDateTime.now());
            vehicle.setAddeduserid(userDao.getUserByUsername(auth.getName()).getId());
            vehiDao.save(vehicle);
            return "OK";
        } catch (Exception e) {
            return "Save Not Completed : " + e.getMessage();
        }

    }

    // put mapping for update
    @PutMapping(value = "/vehicle")
    public String updateVehicle(@RequestBody Vehicle vehicle) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "TRANSPORT");

        if (!privilegeLevelForLoggedUser.getPrvupdate()) {
            return "Vehicle Update Not Completed; You Dont Have Permission";
        }

        // check existence
        Vehicle existingVehicle = vehiDao.getReferenceById(vehicle.getId());
        if (existingVehicle == null) {
            return "Update Not Completed ; Vehicle Not Found";
        }

        // check number plate duplications
        Vehicle existingVehicleByNumberPlate = vehiDao.getVehicleByNumberPlate(vehicle.getNumberplate());
        if (existingVehicleByNumberPlate != null && existingVehicleByNumberPlate.getId() != vehicle.getId()) {
            return "A Vehicle With This Number Plate Already Exists In The System";
        }

        try {
            vehicle.setLastmodifieddatetime(LocalDateTime.now());
            vehicle.setLastmodifieduserid(userDao.getUserByUsername(auth.getName()).getId());
            vehiDao.save(vehicle);
            return "OK";

        } catch (Exception e) {
            return "Update Not Completed ; " + e.getMessage();
        }

    }

    // delete mapping for delete
    @DeleteMapping(value = "/vehicle")
    public String deleteVehicle(@RequestBody Vehicle vehicle) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "TRANSPORT");

        if (!privilegeLevelForLoggedUser.getPrvdelete()) {
            return "Vehicle Delete Not Completed; You Dont Have Permission";
        }

        // check existence
        Vehicle existingVehicle = vehiDao.getReferenceById(vehicle.getId());
        if (existingVehicle == null) {
            return "Delete Not Completed ; Vehicle Not Found";
        }

        try {
            existingVehicle.setDeleted_vehi(true);
            existingVehicle.setDeleteddatetime(LocalDateTime.now());
            existingVehicle.setDeleteduserid(userDao.getUserByUsername(auth.getName()).getId());

            vehiDao.save(existingVehicle);
            return "OK";
        } catch (Exception e) {
            return "Delete Not Completed " + e.getMessage();
        }

    }

}
