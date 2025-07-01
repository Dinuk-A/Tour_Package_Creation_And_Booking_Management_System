package lk.yathratravels.inquiry;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface FollowupDao extends JpaRepository<Followup, Integer> {
    
    //return all followups of this inq
    @Query(value = "select * from newyathra.followup as flwup where flwup.inquiry_id=?1 order by flwup.addeddatetime desc" , nativeQuery = true)
    List<Followup> getAllFollowupsByInqId(Integer inqId);
}
