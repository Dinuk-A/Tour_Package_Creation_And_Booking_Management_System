package lk.yathratravels.tpkg;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TourPkgDao extends JpaRepository<TourPkg,Integer>{
    
     @Query(value = "SELECT concat('TP', lpad(substring(max(tp.pkgcode),3)+1 , 5 , 0))  as pkgcode FROM newyathra.tpkg as tp;", nativeQuery = true)
    public String nextTPCode();

}
