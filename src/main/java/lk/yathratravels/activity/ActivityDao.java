package lk.yathratravels.activity;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ActivityDao extends JpaRepository<Activity, Integer> {

    // 😁😁😁 first check these can be done via frontend ????
    // activity by type
    // activity by type and district

    // activity by district
    @Query(value = "select act from Activity act where act.district_id.id=?1")
    List<Activity> activityListByDistrict(Integer selectedDistrict);

}
