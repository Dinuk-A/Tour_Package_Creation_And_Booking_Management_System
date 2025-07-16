package lk.yathratravels.inquiry;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface FollowupDao extends JpaRepository<Followup, Integer> {

    // return all followups of this inq
    @Query(value = "select * from newyathra.followup as flwup where flwup.inquiry_id=?1 order by flwup.addeddatetime desc", nativeQuery = true)
    List<Followup> getAllFollowupsByInqId(Integer inqId);

    // get the tpkg id of ( last sent tpkg ) by the last followup that has status as
    // "good_to_book"
    @Query(value = "select flwup from  Followup as flwup  where flwup.inquiry_id.id=?1 and flwup.followup_status='good_to_book'")
    public Followup getTpkgOfLastSent(Integer flwup);
}
