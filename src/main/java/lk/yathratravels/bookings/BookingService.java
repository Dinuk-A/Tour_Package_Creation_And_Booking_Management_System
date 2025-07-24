package lk.yathratravels.bookings;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BookingService {
    @Autowired
    private BookingDao bookingDao;

    public void assignNextBookingCode(Booking booking) {
        String nextBookingCode = bookingDao.getNextBookingCode();
        if (nextBookingCode == null || nextBookingCode.equals("")) {
            booking.setBookingcode("BK00001");
        } else {
            booking.setBookingcode(nextBookingCode);
        }

        System.out.println("Next Booking Code: " + booking.getBookingcode());
        System.out.println("assignNextBookingCode ran successfully");
    }
}
