package lk.yathratravels.inquiry;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InqDao extends JpaRepository<Inq,Integer> {

    // create an unique code for every Inquiry
    @Query(value = "SELECT concat('INQ', lpad(substring(max(inq.inqcode),4)+1 , 5 , 0))  as inqcode FROM newyathra.inquiry as inq;", nativeQuery = true)
    public String getNextInquiryCode();

    //get personal assigned inqs
    @Query(value ="SELECT * from newyathra.inquiry as pinq where pinq.assigned_empid=?1", nativeQuery = true)
    public List<Inq> returnPersonalInqsByUserId(Integer userId);

    //get only active inqs
    @Query(value ="SELECT * from newyathra.inquiry as inq where inq.inq_status not in ('Dropped','Deleted','Success')", nativeQuery = true)
    public List<Inq> getOnlyActiveInqs();
}
