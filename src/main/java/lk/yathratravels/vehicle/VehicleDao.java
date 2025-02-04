package lk.yathratravels.vehicle;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VehicleDao extends JpaRepository<Vehicle, Integer> {

    // filter vehicles by given number plate
    @Query(value = "select v from Vehicle v where v.numberplate=?1")
    Vehicle getVehicleByNumberPlate(String numberplate);

}
