package lk.yathratravels.attraction;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DistrictController {
    @Autowired
    private DistrictDao districtDao;

    //get all district data
    @GetMapping(value = "district/all", produces = "application/json")
    public List<District> getAllDistricts() {
        return districtDao.findAll(Sort.by(Direction.DESC, "id"));
    }

    @GetMapping(value = "/districts/byprovinceid/{provinceid}")
    public List <District> getDistByprovince (@PathVariable Integer provinceid){
        return districtDao.getDistrictsByProvinceID(provinceid);
    }

}
