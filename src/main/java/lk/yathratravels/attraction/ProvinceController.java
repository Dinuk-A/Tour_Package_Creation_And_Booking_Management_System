package lk.yathratravels.attraction;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProvinceController {

    @Autowired
    private ProvinceDao provinceDao;

    @GetMapping(value = "province/all", produces = "application/json")
    public List<Province> getAllProvinces() {
        return provinceDao.findAll(Sort.by(Direction.DESC, "id"));
    }
}
