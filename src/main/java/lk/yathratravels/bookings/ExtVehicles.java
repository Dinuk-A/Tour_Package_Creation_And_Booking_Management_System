package lk.yathratravels.bookings;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "ext_vehicles")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExtVehicles {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "vehiname")
    private String vehiname;

    @Column(name = "numberplate")
    private String numberplate;

    @Column(name = "providername")
    private String providername;

    @Column(name = "providercontactone")
    private String providercontactone;

    @Column(name = "providercontacttwo")
    private String providercontacttwo;

    @Column(name = "providercontactemail")
    private String providercontactemail;

    @Column(name = "notes")
    private String notes;

    @Column(name = "price_agreed")
    private BigDecimal price_agreed;

    @Column(name = "addeddatetime")
    private String addeddatetime; 

    @Column(name = "addeduserid")
    private String addeduserid;

    @ManyToOne
    @JoinColumn(name = "booking_id", referencedColumnName = "id")
    private Booking booking;

}
