package lk.yathratravels.tpkg;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
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

    // not the full obj, only the id/code
    @Column(name = "basedinq")
    private String basedinq;

    @Column(name = "tourstartdate")
    private LocalDate tourstartdate;

    @Column(name = "totaldays")
    private Integer totaldays;

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

    @ManyToOne(optional = false)
    @JoinColumn(name = "sd_dayplan_id", referencedColumnName = "id")
    private DayPlan sd_dayplan_id;

    @ManyToOne(optional = true)
    @JoinColumn(name = "ed_dayplan_id", referencedColumnName = "id")
    private DayPlan ed_dayplan_id;

    @ManyToMany
    @JoinTable(name = "tpkg_has_dayplan", joinColumns = @JoinColumn(name = "tpkg_id"), inverseJoinColumns = @JoinColumn(name = "dayplan_id"))
    @OrderColumn(name = "day_order")
    private List<DayPlan> dayplans;

    // additional costs one to many 1 add karana 1 optional 💥💥

    // TO CALC VEHICLE COST 💥💥
    // @Column(name = "totalkmcountofpkg")
    // private BigDecimal totalkmcountofpkg;

    // #### SUM OF COSTS STARTS#####
    @Column(name = "totaltktcost")
    private BigDecimal totaltktcost;

    @Column(name = "totallunchcost")
    private BigDecimal totallunchcost;

    @Column(name = "totalvehiparkingcost")
    private BigDecimal totalvehiparkingcost;

    @Column(name = "totalvehicost")
    private BigDecimal totalvehicost;

    @Column(name = "totaldrivercost")
    private BigDecimal totaldrivercost;

    @Column(name = "totalguidecost")
    private BigDecimal totalguidecost;

    @Column(name = "totalstaycost")
    private BigDecimal totalstaycost;

    @Column(name = "totaladditionalcosts")
    private BigDecimal totaladditionalcosts;

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

    @Column(name = "is_guide_needed")
    private Boolean is_guide_needed;

    @Column(name = "is_company_guide")
    private Boolean is_company_guide;

    @Column(name = "is_company_vehicle")
    private Boolean is_company_vehicle;

    @Column(name = "is_company_driver")
    private Boolean is_company_driver;

    @Column(name = "img1")
    private byte[] img1;

    @Column(name = "img2")
    private byte[] img2;

    @Column(name = "img3")
    private byte[] img3;

    @Column(name = "web_description")
    private String web_description;

    @Column(name = "pref_vehi_type")
    private String pref_vehi_type;

    @OneToMany(mappedBy = "tourPkg", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AdditionalCost> addiCostList;

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

    /**
     * @param id
     * @param pkgtitle
     * @param sd_dayplan_id
     * @param ed_dayplan_id
     * @param dayplans
     */
    public TourPkg(Integer id, String pkgtitle, DayPlan sd_dayplan_id, DayPlan ed_dayplan_id, List<DayPlan> dayplans) {
        this.id = id;
        this.pkgtitle = pkgtitle;
        this.sd_dayplan_id = sd_dayplan_id;
        this.ed_dayplan_id = ed_dayplan_id;
        this.dayplans = dayplans;
    }

}
