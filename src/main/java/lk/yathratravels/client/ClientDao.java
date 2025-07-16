package lk.yathratravels.client;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ClientDao extends JpaRepository<Client, Integer> {

    // Find client by exact email
    @Query("select c from Client c where c.email = ?1")
    List<Client> findClientsByEmail(String email);

    // if email is unique
     Optional<Client> findByEmail(String email);

}
