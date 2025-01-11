package lk.yathratravels.privilege;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ModuleController {
    @Autowired
    private ModuleDao moduleDao;

    // mapping for get all module data
    @GetMapping(value = "/module/all", produces = "application/json")
    public List<Module> getAllModuleData() {
        return moduleDao.findAll();
    }

    // karala balala comments danna ?????????????????????
    @GetMapping(value = "/module/listbyrole", params = { "roleid" })
    public List<Module> getByrole(@RequestParam("roleid") Integer roleid) {
        return moduleDao.getModulesByRole(roleid);
    }
}
