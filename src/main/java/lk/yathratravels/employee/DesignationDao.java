package lk.yathratravels.employee;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;

public interface DesignationDao extends JpaRepository<Designation, Integer> {

    @Query(value = "select des from Designation des where des.name <> 'Admin' ")
    public List<Designation> getDesigsExceptAdmin();

}
