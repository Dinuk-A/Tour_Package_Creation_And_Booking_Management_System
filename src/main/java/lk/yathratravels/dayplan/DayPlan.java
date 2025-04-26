package lk.yathratravels.dayplan;

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
//import lk.yathratravels.activity.Activity;
import lk.yathratravels.attraction.Attraction;
import lk.yathratravels.attraction.District;
import lk.yathratravels.lunchplace.LunchPlace;
import lk.yathratravels.stay.Stay;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dayplan")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DayPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "daytitle")
    @NotNull
    private String daytitle;
    
    @Column(name = "dayplancode")
    @NotNull
    private String dayplancode;

    @Column(name = "dp_status")
    private String dp_status;

    @Column(name = "deleted_dp")
    private Boolean deleted_dp;

    @Column(name = "is_template")
    private Boolean is_template;

    // 💥💥💥 meka wenuwata mulinma add karana attr or actv eke district eka
    // ganna(0th index from that array)
    @ManyToOne
    @JoinColumn(name = "start_district_id", referencedColumnName = "id")
    private District start_district_id;

    @Column(name = "note")
    private String note;

    // ****TICKETS COSTS STARTS
    @Column(name = "foreignadulttktcost")
    private BigDecimal foreignadulttktcost;

    @Column(name = "foreignchildtktcost")
    private BigDecimal foreignchildtktcost;

    @Column(name = "localadulttktcost")
    private BigDecimal localadulttktcost;

    @Column(name = "localchildtktcost")
    private BigDecimal localchildtktcost;
    
    // ****TICKETS COSTS ENDS

    @Column(name = "totalkmcount")
    private BigDecimal totalkmcount;

    @Column(name = "totalvehiparkcost")
    private BigDecimal totalvehiparkcost;

    // total cost for today modification
    //@Column(name = "totallocostfortoday")
    //private BigDecimal totallocostfortoday;

    @ManyToOne
    @JoinColumn(name = "end_stay_id", referencedColumnName = "id")
    private Stay end_stay_id;

    @ManyToOne
    @JoinColumn(name = "lunchplace_id", referencedColumnName = "id")
    private LunchPlace lunchplace_id;

    @ManyToMany
    @JoinTable(name = "dayplan_has_attraction", joinColumns = @JoinColumn(name = "dayplan_id"), inverseJoinColumns = @JoinColumn(name = "attraction_id"))
    private Set<Attraction> vplaces;

    //@ManyToMany
    //@JoinTable(name = "dayplan_has_activity", joinColumns = @JoinColumn(name = "dayplan_id"), inverseJoinColumns = @JoinColumn(name = "activity_id"))
    //private Set<Activity> activities;

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
