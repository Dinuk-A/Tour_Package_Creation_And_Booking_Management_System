package lk.yathratravels.lunchplace;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lk.yathratravels.attraction.District;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lunchplace")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class LunchPlace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "name")
    private String name;

    // another table for meal type ???

    @Column(name = "costperhead")
    private BigDecimal costperhead;

    @Column(name = "address")
    private String address;

    @Column(name = "contactnum")
    private String contactnum;

    @Column(name = "contactnumtwo")
    private String contactnumtwo;

    @Column(name = "email")
    private String email;

    @Column(name = "note")
    private String note;

    @Column(name = "lp_status")
    private String lp_status;

    @Column(name = "deleted_lp")
    private Boolean deleted_lp;

    @ManyToOne
    @JoinColumn(name = "district_id", referencedColumnName = "id")
    private District district_id;

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
