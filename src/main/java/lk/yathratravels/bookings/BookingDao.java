package lk.yathratravels.bookings;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BookingDao extends JpaRepository<Booking, Integer> {

    // create next bookingcode
    @Query(value = "SELECT CONCAT('BK', LPAD(SUBSTRING(MAX(b.bookingcode), 3) + 1, 5, '0')) FROM booking AS b", nativeQuery = true)
    public String getNextBookingCode();
    

}
