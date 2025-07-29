package lk.yathratravels.bookings;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BookingDao extends JpaRepository<Booking, Integer> {

    // create next bookingcode
    @Query(value = "SELECT CONCAT('BK', LPAD(SUBSTRING(MAX(b.bookingcode), 3) + 1, 5, '0')) FROM booking AS b", nativeQuery = true)
    public String getNextBookingCode();

    // get unpaid new bookings (bookings where is_full_payment_complete is false or
    // null)
    @Query(value = "SELECT b FROM Booking b WHERE (b.is_full_payment_complete = false OR b.is_full_payment_complete IS NULL) ")
    public List<Booking> getUnpaidNewBookings();

    // @Query("FROM Booking b WHERE b.is_full_payment_complete <> true")
    // same as above

}
