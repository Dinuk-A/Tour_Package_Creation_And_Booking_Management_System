package lk.yathratravels.attraction;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AttractionDao extends JpaRepository<Attraction, Integer> {

    // from a custom constructor, not the whole obj
    // only active ones(non deleted)
    @Query("SELECT new Attraction(attr.id, attr.name, attr.feelocaladult, attr.feeforeignadult, attr.feechildlocal, attr.feechildforeign, attr.vehicleparkingfee, attr.district_id, attr.gcoords, attr.duration) FROM Attraction attr WHERE attr.district_id.id = ?1 AND (attr.deleted_attr = false OR attr.deleted_attr IS NULL)")
    List<Attraction> attrListByDistrict(Integer selectedDistrict);

}
