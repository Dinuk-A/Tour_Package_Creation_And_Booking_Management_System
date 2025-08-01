package lk.yathratravels.inquiry;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InqDao extends JpaRepository<Inq, Integer> {

    // create an unique code for every Inquiry
    @Query(value = "SELECT concat('INQ', lpad(substring(max(inq.inqcode),4)+1 , 5 , 0))  as inqcode FROM newyathra.inquiry as inq;", nativeQuery = true)
    public String getNextInquiryCode();

    // get personal assigned inqs
    @Query(value = "SELECT * from newyathra.inquiry as pinq where pinq.assigned_empid=?1", nativeQuery = true)
    public List<Inq> returnPersonalInqsByEmpId(Integer empid);

    // get only active inqs
    @Query(value = "SELECT * FROM newyathra.inquiry AS inq WHERE inq.inq_status NOT IN ('Confirmed', 'Closed') AND (inq.deleted_inq IS NULL OR inq.deleted_inq = false)", nativeQuery = true)
    public List<Inq> getOnlyActiveInqs();

    // get only confirmed inqs
    @Query(value = "SELECT * FROM newyathra.inquiry AS inq WHERE inq.inq_status = 'Confirmed' AND (inq.deleted_inq IS NULL OR inq.deleted_inq = false)", nativeQuery = true)
    public List<Inq> getOnlyConfirmedInqs();

    // get only new inqs
    @Query(value = "SELECT * FROM newyathra.inquiry AS inq WHERE inq.inq_status = 'New' AND (inq.deleted_inq IS NULL OR inq.deleted_inq = false)", nativeQuery = true)
    public List<Inq> getOnlyNewUnAssignedInqs();

    // get currently working inqs + by emp id
    @Query(value = "SELECT * from newyathra.inquiry as inq where inq.inq_status in ('Working') and inq.assigned_empid=?1", nativeQuery = true)
    public List<Inq> getOnlyWorkingInqsByAssignedEmp(Integer empId);

    // get assigned to emp, but has not started working yet
    @Query(value = "SELECT * from newyathra.inquiry as inq where inq.inq_status in ('Assigned') and inq.assigned_empid=?1", nativeQuery = true)
    public List<Inq> getNotStartedInqsByAssignedEmp(Integer empId);

    // get client and code by id
    @Query("SELECT new Inq(i.id, i.clientname, i.inqcode) FROM Inq i WHERE i.id = ?1")
    Inq getClientnameAndCodeById(Integer id);

    // @Query(value = "SELECT * FROM newyathra.inquiry " +
    // "WHERE rescheduled_date = CURRENT_DATE " +
    // "AND (deleted_inq IS NULL OR deleted_inq = false) " +
    // "AND assigned_empid = ?1", nativeQuery = true)
    // List<Inq> getRescheduledInquiriesForTodayByEmployee(Integer empId);

    @Query(value = "SELECT * FROM newyathra.inquiry " +
            "WHERE rescheduled_date = CURRENT_DATE " +
            "AND (deleted_inq IS NULL OR deleted_inq = false) " +
            "AND assigned_empid = ?1 " +
            "AND inq_status = 'Working'", nativeQuery = true)
    List<Inq> getRescheduledWorkingInquiriesForTodayByEmployee(Integer empId);

}
