package lk.yathratravels.bookings;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lk.yathratravels.employee.Employee;
import lk.yathratravels.tpkg.TourPkg;
import lk.yathratravels.client.Client;
import lk.yathratravels.vehicle.Vehicle;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "booking")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "bookingcode")
    private String bookingcode;

    @Column(name = "startdate")
    private LocalDate startdate;

    @Column(name = "enddate")
    private LocalDate enddate;

    @Column(name = "final_price")
    private BigDecimal final_price;

    @Column(name = "total_paid")
    private BigDecimal total_paid;

    @Column(name = "booking_status")
    private String booking_status;

    @ManyToOne
    @JoinColumn(name = "tpkg", referencedColumnName = "id")
    private Client client;

    @ManyToOne
    @JoinColumn(name = "tpkg", referencedColumnName = "id")
    private TourPkg tpkg;

    @ManyToMany
    @JoinTable(name = "booking_has_int_vehicles", joinColumns = @JoinColumn(name = "booking_id"), inverseJoinColumns = @JoinColumn(name = "vehicle_id"))
    private Set<Vehicle> vehicles;

    @ManyToMany
    @JoinTable(name = "booking_has_int_drivers", joinColumns = @JoinColumn(name = "booking_id"), inverseJoinColumns = @JoinColumn(name = "employee_id"))
    private Set<Employee> int_drivers;

    @ManyToMany
    @JoinTable(name = "booking_has_int_guides", joinColumns = @JoinColumn(name = "booking_id"), inverseJoinColumns = @JoinColumn(name = "employee_id"))
    private Set<Employee> int_guides;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "booking_id") 
    private List<ExtPersonnel> externalPersonnel;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "booking_id") 
    private List<ExtVehicles> externalVehicles;

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
