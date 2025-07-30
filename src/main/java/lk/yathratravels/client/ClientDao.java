package lk.yathratravels.client;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClientDao extends JpaRepository<Client, Integer> {

    // create next clientcode
    @Query(value = "SELECT CONCAT('CL', LPAD(SUBSTRING(MAX(c.clientcode), 3) + 1, 5, '0')) FROM client AS c", nativeQuery = true)
    public String getNextClientCode();

    // Find client by exact email
    @Query("select c from Client c where c.email = ?1")
    List<Client> findClientsByEmail(String email);

    // if email is unique
    Optional<Client> findByEmail(String email);

    // how many successful bookings by jpql
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.client.id = :clientId AND b.booking_status = 'Completed'")
    int countCompletedBookingsByClientJPQL(@Param("clientId") Integer clientId);

    // same with native
    @Query(value = "SELECT COUNT(*) FROM booking WHERE client = ?1 AND booking_status = 'Completed'", nativeQuery = true)
    int countCompletedBookingsByClientNative(Integer clientId);

}
