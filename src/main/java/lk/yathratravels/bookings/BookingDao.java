package lk.yathratravels.bookings;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import lk.yathratravels.Reports.UpcomingToursDTO;

public interface BookingDao extends JpaRepository<Booking, Integer> {

    // create next bookingcode
    @Query(value = "SELECT CONCAT('BK', LPAD(SUBSTRING(MAX(b.bookingcode), 3) + 1, 5, '0')) FROM booking AS b", nativeQuery = true)
    public String getNextBookingCode();

    // bookings where needs to assigned resources
    @Query(value = "SELECT * FROM booking WHERE booking_status = 'Assignment_Pending'", nativeQuery = true)
    List<Booking> getAllPendingAssignments();

    // get unpaid new bookings (bookings where is_full_payment_complete is false or
    // null)
    @Query(value = "SELECT b FROM Booking b WHERE (b.is_full_payment_complete = false OR b.is_full_payment_complete IS NULL) ")
    public List<Booking> getUnpaidNewBookings();

    // @Query("FROM Booking b WHERE b.is_full_payment_complete <> true")
    // same as above

    // get upcoming tours
    // @Query("SELECT new lk.yathratravels.Reports.UpcomingToursDTO(b.bookingcode,
    // b.tpkg.pkgtitle, b.client.fullname, b.client.contactone) "
    // +
    // "FROM Booking b WHERE b.startdate >= :tomorrow ORDER BY b.startdate ASC")
    // List<UpcomingToursDTO> findUpcomingTours(@Param("tomorrow") LocalDate
    // tomorrow);

    @Query("SELECT new lk.yathratravels.Reports.UpcomingToursDTO(b.bookingcode, b.tpkg.pkgtitle, b.client.fullname, b.client.contactone) "
            +
            "FROM Booking b " +
            "WHERE b.startdate >= :tomorrow AND b.payment_status = 'Fully_Paid' " +
            "ORDER BY b.startdate ASC")
    List<UpcomingToursDTO> findUpcomingTours(@Param("tomorrow") LocalDate tomorrow);


    //bookings that are upcoming and not fully paid and not cancelled, refunded
    @Query("SELECT new lk.yathratravels.Reports.UpcomingToursDTO(b.bookingcode, b.tpkg.pkgtitle, b.client.fullname, b.client.contactone) " +
       "FROM Booking b " +
       "WHERE b.startdate >= :tomorrow " +
       "AND b.payment_status <> 'Fully_Paid' " +
       "AND b.booking_status NOT IN ( 'Cancelled', 'Refunded') " +
       "ORDER BY b.startdate ASC")
List<UpcomingToursDTO> findUpcomingToursNotFullyPaidAndNotCancelled(@Param("tomorrow") LocalDate tomorrow);

}
