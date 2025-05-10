package lk.yathratravels.stay;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface StayDao extends JpaRepository<Stay, Integer> {

    // only active(non deleted) stays + filtered by district
    @Query("SELECT new Stay(s.id, s.name, s.gcoords) FROM Stay s WHERE s.district_id.id = ?1 AND (s.deleted_stay = false OR s.deleted_stay IS NULL)")
    public List<Stay> getStayListByDistrict(Integer givenDistrict);

    // only active(non deleted) stays
    @Query("SELECT s FROM Stay s WHERE s.deleted_stay = false OR s.deleted_stay IS NULL")
    public List<Stay> getNonDeletedStays();

}
