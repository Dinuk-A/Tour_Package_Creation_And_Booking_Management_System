package lk.yathratravels.inquiry;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class NationalityController {
    @Autowired
    
    private NationalityDao nationalityDao;
    
    @GetMapping(value = "/nationality/all", produces = "application/json")
    public List<Nationality> getAllNationalities() {
        return nationalityDao.findAll();
    }
}
