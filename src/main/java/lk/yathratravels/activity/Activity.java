package lk.yathratravels.activity;

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
@Table(name = "activity")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "act_name")
    @NotNull
    private String act_name;

    @Column(name = "description")
    @NotNull
    private String description;

    @Column(name = "act_provider")
    @NotNull
    private String act_provider;

    @Column(name = "contactone")
    @NotNull
    private String contactone;

    @Column(name = "contacttwo")
    private String contacttwo;

    @Column(name = "act_email")
    private String act_email;

    @Column(name = "location")
    @NotNull
    private String location;

    @Column(name = "duration")
    @NotNull
    private String duration;

    @Column(name = "price_adult")
    @NotNull
    private BigDecimal price_adult;

    @Column(name = "price_child")
    @NotNull
    private BigDecimal price_child;

    @Column(name = "note")
    private String note;

    @Column(name = "act_status")
    @NotNull
    private String act_status;

    @Column(name = "deleted_act")
    private Boolean deleted_act;

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

    @ManyToOne
    @JoinColumn(name = "district_id", referencedColumnName = "id")
    @NotNull
    private District district_id;

    @ManyToOne
    @JoinColumn(name = "act_type_id", referencedColumnName = "id")
    @NotNull
    private ActType act_type_id;

}
