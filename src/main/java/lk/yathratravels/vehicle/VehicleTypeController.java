package lk.yathratravels.vehicle;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class VehicleTypeController {

    @Autowired
    private VehicleTypeDao vTypeDao;

    @GetMapping(value = "/vehitypes/all" ,produces = "application/json")
    public List <VehicleType> getAllVehicleTypes(){
        return vTypeDao.findAll();
    }
}
