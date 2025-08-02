package lk.yathratravels.Reports;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.yathratravels.tpkg.TourPkg;

public interface TpkgReportsDao extends JpaRepository<TourPkg, Integer> {

    @Query(value = "SELECT intrstdpkgid, COUNT(*) as inquiry_count " +
            "FROM newyathra.inquiry " +
            "WHERE intrstdpkgid IS NOT NULL " +
            "AND recieveddate BETWEEN ?1 AND ?2 " +
            "GROUP BY intrstdpkgid", nativeQuery = true)
    public List<Object[]> countInquiriesGroupedByPackageAndDateRange(LocalDate startDate, LocalDate endDate);

}
