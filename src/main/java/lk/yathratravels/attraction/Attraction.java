package lk.yathratravels.attraction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "attraction")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Attraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "name")
    @NotNull
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "feetype")
    @NotNull
    private String feetype;

    @Column(name = "feelocaladult")
    private BigDecimal feelocaladult;

    @Column(name = "feeforeignadult")
    private BigDecimal feeforeignadult;

    @Column(name = "feechildlocal")
    private BigDecimal feechildlocal;

    @Column(name = "feechildforeign")
    private BigDecimal feechildforeign;

    @Column(name = "duration")
    private String duration;

    @Column(name = "note")
    private String note;

    @Column(name = "attr_status")
    private String attr_status;

    @Column(name = "deleted_attr")
     private Boolean deleted_attr;

    @Column(name = "vehicleparkingfee")
    private BigDecimal vehicleparkingfee;

    @ManyToOne
    @JoinColumn(name = "district_id", referencedColumnName = "id")
    @NotNull
    private District district_id;

    @ManyToMany
    @JoinTable(name = "attraction_has_attr_category", joinColumns = @JoinColumn(name = "attraction_id"), inverseJoinColumns = @JoinColumn(name = "attr_category_id"))
    private Set<AttrCategory> categories;

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

    // day plans walata attr based on district gennaganna hadapu query ekata
    // >>>attrListByDistrict
    public Attraction(Integer id, String name, BigDecimal feelocaladult, BigDecimal feeforeignadult, BigDecimal feechildlocal,
            BigDecimal feechildforeign, BigDecimal vehicleparkingfee, District district_id) {

        this.id = id;
        this.name = name;
        this.feelocaladult = feelocaladult;
        this.feeforeignadult = feeforeignadult;
        this.feechildlocal = feechildlocal;
        this.feechildforeign = feechildforeign;
        this.vehicleparkingfee = vehicleparkingfee;
        this.district_id = district_id;

    }
}

