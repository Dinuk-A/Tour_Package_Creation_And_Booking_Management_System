package lk.yathratravels.employee;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
public class DesignationController {

    @Autowired
    private DesignationDao designationDao;

    @GetMapping(value = "/desig/all", produces = "application/json")
    public List<Designation> getAllDesignations() {
        return designationDao.findAll(Sort.by(Direction.ASC, "id"));
    }

    // designations without admin
    @GetMapping(value = "/desig/exceptadmin", produces = "application/json")
    public List<Designation> getDesignationsWOAdmin() {
        return designationDao.getDesigsExceptAdmin();
    }

}
