package lk.yathratravels.tpkg;

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
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lk.yathratravels.dayplan.DayPlan;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tpkg")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourPkg {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "is_custompkg")
    private Boolean is_custompkg;

    @Column(name = "pkgtitle")
    private String pkgtitle;

    @Column(name = "pkgcode")
    private String pkgcode;

    @Column(name = "tourstartdate")
    private LocalDate tourstartdate;

    @Column(name = "totaldays")
    private LocalDate totaldays;

    @Column(name = "tourenddate")
    private LocalDate tourenddate;

    // ####TRAVELLERS COUNT STARTS#####
    @Column(name = "localadultcount")
    private Integer localadultcount;

    @Column(name = "localchildcount")
    private Integer localchildcount;

    @Column(name = "foreignadultcount")
    private Integer foreignadultcount;

    @Column(name = "foreignchildcount")
    private Integer foreignchildcount;
    // ####TRAVELLERS COUNT ENDS####    

    @ManyToMany
    @JoinTable(name = "tpkg_has_dayplan", joinColumns = @JoinColumn(name = "tpkg_id"), inverseJoinColumns = @JoinColumn(name = "dayplan_id"))
    private Set<DayPlan> dayplans;

    //additional costs one to many 1 add karana 1 optional

    // TO CALC VEHICLE COST
    //@Column(name = "totalkmcountofpkg")
    //private BigDecimal totalkmcountofpkg;

    // #### SUM OF COSTS STARTS#####
    @Column(name = "totaltktcostforall")
    private BigDecimal totaltktcostforall;

    @Column(name = "totallunchcost")
    private BigDecimal totallunchcost;

    @Column(name = "totalvehiparkingcost")
    private BigDecimal totalvehiparkingcost;

    @Column(name = "totalvehiclecost")
    private BigDecimal totalvehiclecost;

    @Column(name = "totalstaycost")
    private BigDecimal totalstaycost;

    //@Column(name = "totaladditionalcosts")
    //private BigDecimal totaladditionalcosts;

    @Column(name = "pkgcostsum")
    private BigDecimal pkgcostsum;

    @Column(name = "pkgfinalprice")
    private BigDecimal pkgfinalprice;

    @Column(name = "note")
    private String note;

    @Column(name = "tpkg_status")
    private String tpkg_status;

    @Column(name = "deleted_tpkg")
    private Boolean deleted_tpkg;

    @Column(name = "img1")
    private byte[] img1;

    @Column(name = "img2")
    private byte[] img2;

    @Column(name = "img3")
    private byte[] img3;

    @Column(name = "web_discription")
    private String web_discription;

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
