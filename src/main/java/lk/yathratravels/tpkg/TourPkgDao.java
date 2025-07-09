package lk.yathratravels.tpkg;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.yathratravels.employee.Employee;

public interface TourPkgDao extends JpaRepository<TourPkg, Integer> {

    // Get the next tour package code
    @Query(value = "SELECT concat('TP', lpad(substring(max(tp.pkgcode),3)+1 , 5 , 0))  as pkgcode FROM newyathra.tpkg as tp;", nativeQuery = true)
    public String getNextTPCode();

    // Get all template packages
    @Query(value = "SELECT * FROM newyathra.tpkg tpkg WHERE tpkg.is_custompkg = 0 AND tpkg.tpkg_status = 'Draft' AND (tpkg.deleted_tpkg IS NULL OR tpkg.deleted_tpkg = false);", nativeQuery = true)
    public List<TourPkg> getPkgsToShowWebsite();

    // get custom only+ actives only
    @Query(value = "SELECT * FROM newyathra.tpkg tpkg WHERE tpkg.is_custompkg = 1 AND tpkg.tpkg_status = 'Draft' AND (tpkg.deleted_tpkg IS NULL OR tpkg.deleted_tpkg = false) ORDER BY id DESC", nativeQuery = true)
    public List<TourPkg> findAllDraftCustomPackages();

    // get template + actives only
    // only get active ones

    // get template pkgs by id
    // @Query(value = "select TourPkg(tp.id , tp.pkgtitle, tp.sd_dayplan_id ,
    // tp.ed_dayplan_id , tp.dayplans ) from TourPkg tp where tp.id = ?1")

    
    @Query(value = "select  tp from TourPkg tp where tp.id = ?1")
    public TourPkg findTpkgById(Integer tpkgId);

}
