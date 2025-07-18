package lk.yathratravels.vehicle;

import java.time.LocalDate;
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

    // same butalso filtered by vehi type✅
    @Query(value = "SELECT * FROM vehicle vehi WHERE vehi.vehi_status='Available' and vehi.vehicletype_id=?3 AND vehi.id NOT IN (SELECT b.vehicle_id FROM booking b WHERE (b.startdate BETWEEN ?1 AND ?2 OR b.enddate BETWEEN ?1 AND ?2) AND (b.booking_status != 'Deleted' OR b.booking_status != 'Cancelled'))", nativeQuery = true)
    public List<Vehicle> getAvailableVehicleListByVehiTypeOri(LocalDate startDate, LocalDate endDate,
            Integer vehiTypeId);

    // same but in diff lines
    @Query(value = """
            SELECT * FROM vehicle vehi
            WHERE vehi.vehi_status = 'Available'
              AND vehi.vehicletype_id = ?3
              AND vehi.id NOT IN (
                  SELECT bhv.vehicle_id
                  FROM booking_has_int_vehicles bhv
                  JOIN booking b ON bhv.booking_id = b.id
                  WHERE (
                      (b.startdate BETWEEN ?1 AND ?2)
                      OR (b.enddate BETWEEN ?1 AND ?2)
                  )
                  AND b.booking_status NOT IN ('Deleted', 'Cancelled')
              )
            """, nativeQuery = true)
    List<Vehicle> getAvailableVehicleListByVehiType(LocalDate startDate, LocalDate endDate, Integer vehiTypeId);

    // get available vehicles by dates only
    @Query(value = """
            SELECT * FROM vehicle vehi
            WHERE vehi.vehi_status = 'Available'
                  AND vehi.id NOT IN (
                  SELECT bhv.vehicle_id
                  FROM booking_has_int_vehicles bhv
                  JOIN booking b ON bhv.booking_id = b.id
                  WHERE (
                      (b.startdate BETWEEN ?1 AND ?2)
                      OR (b.enddate BETWEEN ?1 AND ?2)
                  )
                  AND b.booking_status NOT IN ('Deleted', 'Cancelled')
              )
            """, nativeQuery = true)
    List<Vehicle> getAvailableVehiclesByDatesOnly(LocalDate startDate, LocalDate endDate);

}
