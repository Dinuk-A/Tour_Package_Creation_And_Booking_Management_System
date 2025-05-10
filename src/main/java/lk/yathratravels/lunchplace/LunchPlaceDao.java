package lk.yathratravels.lunchplace;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LunchPlaceDao extends JpaRepository<LunchPlace, Integer> {

    //filtered by district + not deleted ones only
    @Query("SELECT lp FROM LunchPlace lp WHERE lp.district_id.id = ?1 AND (lp.deleted_lp = false OR lp.deleted_lp IS NULL)")
    public List<LunchPlace> getLunchPlaceByGivenDistrict(Integer givenDistrict);    

    //get all the lps that isnt delete or null (active) 
    @Query("select lp from LunchPlace lp where lp.deleted_lp = false or lp.deleted_lp is null")
    List<LunchPlace> getOnlyActiveLPs();

}
