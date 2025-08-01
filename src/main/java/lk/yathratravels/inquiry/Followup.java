package lk.yathratravels.inquiry;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lk.yathratravels.tpkg.TourPkg;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "followup")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Followup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "content")
    private String content;

    @Column(name = "addeddatetime")
    private LocalDateTime addeddatetime;

    @Column(name = "addeduserid")
    private Integer addeduserid;

    @ManyToOne
    @JoinColumn(name = "inquiry_id", referencedColumnName = "id")
    private Inq inquiry_id;

    @Column(name = "is_package_quoted")
    private Boolean is_package_quoted;

    @ManyToOne(optional = true)
    @JoinColumn(name = "last_sent_tpkg" , referencedColumnName = "id")
    private TourPkg last_sent_tpkg;

    @Column(name = "is_next_followup_required")
    private Boolean is_next_followup_required;

    @Column(name = "next_followup_date")
    private LocalDate next_followup_date;

}

    //@Column(name = "followup_status")
    //private String followup_status;

/*
 * adddeddatetime datetime
 * addeduserid int
 * content text
 * followup_status varchar(45)
 * inquiry_id int
 */
