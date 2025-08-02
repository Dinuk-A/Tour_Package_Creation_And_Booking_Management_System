package lk.yathratravels.Reports;

import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.yathratravels.inquiry.Inq;

public interface InqReportsDao extends JpaRepository<Inq, Integer> {

    /// get all inqs count recieved between 2 dates
    @Query(value = "SELECT count(*) FROM newyathra.inquiry as inq WHERE inq.recieveddate BETWEEN ?1 AND ?2", nativeQuery = true)
    public long countInquiriesByGivenDays(LocalDate startDate, LocalDate endDate);

     // only get count of succeded inqs
     @Query(value = "SELECT count(*) FROM newyathra.inquiry as inq where inq.recieveddate BETWEEN ?1 AND ?2 and inq.inq_status = 'Confirmed' ", nativeQuery = true)
     public long countConfirmedInquiries(LocalDate startDate, LocalDate endDate);

      // only get count of succeded inqs
      @Query(value = "SELECT count(*) FROM newyathra.inquiry as inq where inq.recieveddate BETWEEN ?1 AND ?2 and inq.inq_status = 'Closed' ", nativeQuery = true)
      public long countDroppedInquiries(LocalDate startDate, LocalDate endDate);

}
