package lk.yathratravels.lunchplace;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LunchPlaceDao extends JpaRepository<LunchPlace, Integer> {

    @Query(value = "select lp from LunchPlace lp where lp.district_id.id=?1")
    public List<LunchPlace> getLunchPlaceByGivenDistrict(Integer givenDistrict);

}
