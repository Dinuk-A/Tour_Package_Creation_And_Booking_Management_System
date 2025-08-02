package lk.yathratravels.tpkg;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TourPkgDao extends JpaRepository<TourPkg, Integer> {

    // Get the next tour package code
    @Query(value = "SELECT concat('TP', lpad(substring(max(tp.pkgcode),3)+1 , 5 , 0))  as pkgcode FROM newyathra.tpkg as tp;", nativeQuery = true)
    public String getNextTPCode();

    // Get all template packages that ready to show on website
    @Query(value = "SELECT * FROM newyathra.tpkg tpkg WHERE tpkg.is_custompkg = 0 AND tpkg.tpkg_status = 'Active' AND (tpkg.deleted_tpkg IS NULL OR tpkg.deleted_tpkg = false);", nativeQuery = true)
    public List<TourPkg> getPkgsToShowWebsite();

    // get custom only+ actives only
    @Query(value = "SELECT * FROM newyathra.tpkg tpkg WHERE tpkg.is_custompkg = 1 AND tpkg.tpkg_status = 'Completed' AND (tpkg.deleted_tpkg IS NULL OR tpkg.deleted_tpkg = false) ORDER BY id DESC", nativeQuery = true)
    public List<TourPkg> getAllCompletedCustomPackages();

    // get template + actives only
    // only get active ones

    // get template pkgs by id
    // @Query(value = "select TourPkg(tp.id , tp.pkgtitle, tp.pkgcode ) from TourPkg tp where tp.id = ?1")

    @Query(value = "select tp from TourPkg tp where tp.id = ?1")
    public TourPkg findTpkgById(Integer tpkgId);

    // get tpkgs by based inq
    @Query(value = "SELECT tpkg FROM TourPkg tpkg " +
            "WHERE tpkg.is_custompkg = true " +
            "AND tpkg.tpkg_status = 'Completed' " +
            "AND tpkg.basedinq = ?1 " +
            "AND (tpkg.deleted_tpkg IS NULL OR tpkg.deleted_tpkg = false) " +
            "ORDER BY tpkg.id DESC")
    List<TourPkg> getCompletedCustomPackagesByInquiryId(String inquiryId);

}
