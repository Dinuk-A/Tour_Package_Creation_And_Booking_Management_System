package lk.yathratravels.stay;

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
@Table(name = "stay")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Stay {

    // website URL ekak optional💥💥💥
    // star ratings optional only for hotells💥💥💥

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "name")
    @NotNull
    private String name;

    @Column(name = "address")
    @NotNull
    private String address;

    @Column(name = "gcoords")
    // @NotNull
    private String gcoords;

    @Column(name = "contactnumone")
    @NotNull
    private String contactnumone;

    @Column(name = "contactnumtwo")
    private String contactnumtwo;

    @Column(name = "email")
    @NotNull
    private String email;

    @Column(name = "maxguestscount")
    private Integer maxguestscount;

    @Column(name = "base_price")
    private BigDecimal base_price;

    @Column(name = "incremental_cost")
    private BigDecimal incremental_cost;

    //@Column(name = "incremental_cost_kid")
    //private BigDecimal incremental_cost_kid;

    @Column(name = "note")
    private String note;

    @ManyToOne
    @JoinColumn(name = "district_id", referencedColumnName = "id")
    private District district_id;

    @ManyToOne
    @JoinColumn(name = "stay_type_id", referencedColumnName = "id")
    private StayType stay_type_id;

    @Column(name = "stay_status")
    private String stay_status;

    @Column(name = "deleted_stay")
    private Boolean deleted_stay;

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

    // for dao
    public Stay(Integer id, String name, String gcoords) {
        this.id = id;
        this.name = name;
        this.gcoords = gcoords;
    }

}
