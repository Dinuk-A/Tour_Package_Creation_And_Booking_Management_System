package lk.yathratravels.bookings;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SurchargeFeeDao extends JpaRepository<SurchargeFee,Integer>{
    List<SurchargeFee> findByBookingId(Integer bookingId);
}
