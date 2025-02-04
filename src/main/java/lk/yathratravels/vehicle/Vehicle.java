package lk.yathratravels.vehicle;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicle")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "vehiclename")
    private String vehiclename;

    @Column(name = "numberplate")
    private String numberplate;

    @Column(name = "passengerseats")
    private Integer passengerseats;

    @Column(name = "description")
    private String description;

    @Column(name = "vehi_status")
    private String vehi_status;

    @ManyToOne
    @JoinColumn(name = "vehicletype_id", referencedColumnName = "id")
    private VehicleType vehicletype_id;

    @Column(name = "note")
    private String note;

    @Column(name = "deleted_vehi")
    private Boolean deleted_vehi;

    // common 6
    @Column(name = "addeddatetime")
    private LocalDateTime addeddatetime;

    @Column(name = "lastmodifieddatetime")
    private LocalDateTime lastmodifieddatetime;

    @Column(name = "deleteddatetime")
    private LocalDateTime deleteddatetime;

    @Column(name = "addeduserid")
    private Integer addeduserid;

    @Column(name = "lastmodifieduserid")
    private Integer lastmodifieduserid;

    @Column(name = "deleteduserid")
    private Integer deleteduserid;
}
