package lk.yathratravels.user;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RoleController {

    @Autowired
    private RoleDao roleDao;

    @GetMapping(value = "/role/all", produces = "application/json")
    public List<Role> getRoleAllData() {
        return roleDao.findAll(Sort.by(Direction.DESC, "id"));
    }

    @GetMapping(value = "/role/exceptadmin", produces = "application/json")
    public List<Role> getRolesWOAdmin() {
        return roleDao.getAllRolesExceptAdmin();
    }
}
