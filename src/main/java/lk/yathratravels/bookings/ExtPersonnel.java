package lk.yathratravels.bookings;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "ext_personnel")
@Data
@AllArgsConstructor
@NoArgsConstructor

public class ExtPersonnel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "fullname")
    private String fullname;

    @Column(name = "nic")
    private String nic;

    @Column(name = "role")
    private String role;

    @Column(name = "contactone")
    private String contactone;

    @Column(name = "contacttwo")
    private String contacttwo;

    @Column(name = "email")
    private String email;

    @Column(name = "addeddatetime")
    private LocalDateTime addeddatetime;

    @Column(name = "addeduserid")
    private Integer addeduserid;

    @ManyToOne
    @JoinColumn(name = "booking_id", referencedColumnName = "id")
    @JsonIgnore
    private Booking booking;

}
