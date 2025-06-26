package lk.yathratravels.inquiry;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InqDao extends JpaRepository<Inq,Integer> {

    // create an unique code for every Inquiry
    @Query(value = "SELECT concat('INQ', lpad(substring(max(inq.inqcode),4)+1 , 5 , 0))  as inqcode FROM newyathra.inquiry as inq;", nativeQuery = true)
    public String getNextInquiryCode();
}
