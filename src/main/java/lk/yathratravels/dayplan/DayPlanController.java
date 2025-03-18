package lk.yathratravels.dayplan;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DayPlanController {
    @Autowired
    private DayPlanDao daoDP;

    /*
     *    @GetMapping(value = "/emp/all", produces = "application/json")
    public List<Employee> getAllEmployees() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Privilege privilegeLevelForLoggedUser = privilegeService.getPrivileges(auth.getName(), "EMPLOYEE");

        if (!privilegeLevelForLoggedUser.getPrvselect()) {
            return new ArrayList<Employee>();
        }

        return employeeDao.findAll(Sort.by(Direction.DESC, "id"));
    }
     */
    
    @GetMapping(value = "/dayplan/all", produces = "application/json")
    public List<DayPlan> getAllDayPlans(){
        return daoDP.findAll(Sort.by(Direction.DESC, "id"));
    }


    @PostMapping(value = "/dayplan")
    public String saveDayPlan(@RequestBody DayPlan dp){
        try {
            daoDP.save(dp);
             return "OK";
        } catch (Exception e) {
            return "save not completed : " + e.getMessage();
        }
    }
}
