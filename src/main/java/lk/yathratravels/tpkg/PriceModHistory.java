package lk.yathratravels.tpkg;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "price_mod_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriceModHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "old_cpm" )
    private BigDecimal old_cpm;

    @Column(name = "old_edp" )
    private BigDecimal old_edp;

    @Column(name = "old_evp" )
    private BigDecimal old_evp;

    @Column(name = "old_egp" )
    private BigDecimal old_egp;

    @Column(name = "ori_addeduserid")
    private Integer ori_addeduserid;

    @Column(name = "ori_addeddatetime")
    private LocalDateTime ori_addeddatetime;

    @Column(name = "ori_updateduserid")
    private Integer ori_updateduserid;

    @Column(name = "ori_updateddatetime")
    private LocalDateTime ori_updateddatetime;

    @Column(name = "note")
    private String note;

}

/*
ori_updateduserid int 
ori_updateddatetime datetime

 * @Column(name = "modifier_type")
 * private String modifierType;
 * 
 * @Column(name = "old_value")
 * private BigDecimal old_value;
 * 
 * @Column(name = "updated_value")
 * private BigDecimal updated_value;
 * 
 * @Column(name = "lastmodifieduserid")
 * private Integer lastmodifieduserid;
 * 
 * @Column(name = "lastmodifieddatetime")
 * private LocalDateTime lastmodifieddatetime;
 * 
 * @Column(name = "note")
 * private String note;
 */