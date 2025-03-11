package lk.yathratravels.stay;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StayTypeController {

    @Autowired
    private StayTypeDao stayTypeDao;

    @GetMapping(value = "/staytype/all", produces = "application/json")
    public List<StayType> getAllStayTypes() {
        return stayTypeDao.findAll(Sort.by(Direction.DESC, "id"));
    }
}
