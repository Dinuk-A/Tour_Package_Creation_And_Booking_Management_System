package lk.yathratravels.vehicle;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VehicleDao extends JpaRepository<Vehicle, Integer> {

    // filter vehicles by given number plate
    @Query(value = "select v from Vehicle v where v.numberplate=?1")
    Vehicle getVehicleByNumberPlate(String numberplate);

    // filter vehicles by given vehicle type + a given seat count
    @Query("select v.vehicletype_id from Vehicle v where v.passengerseats >= ?1")
    List<VehicleType> findVehicleTypeNamesByMinSeats(Integer seatCount);
   

}
