package lk.yathratravels.activity;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ActTypeController {

    @Autowired
    private ActTypeDao actTypeDao;

    @GetMapping(value = "/acttype/all", produces = "application/json")
    public List<ActType> getAllActivityTypes() {
        return actTypeDao.findAll();
    }
}
