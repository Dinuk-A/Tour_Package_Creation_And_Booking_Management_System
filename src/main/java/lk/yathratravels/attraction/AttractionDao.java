package lk.yathratravels.attraction;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AttractionDao extends JpaRepository<Attraction ,  Integer> {
    
    //from a custom constructor, not the whole obj 
    @Query(value = "select new Attraction(attr.id , attr.name, attr.feelocaladult, attr.feeforeignadult, attr.feechildlocal, attr.feechildforeign, attr.vehicleparkingfee, attr.district_id, attr.gcoords , attr.duration ) from Attraction attr where attr.district_id.id=?1")
    List <Attraction> attrListByDistrict(Integer selectedDistrict);
    
}
