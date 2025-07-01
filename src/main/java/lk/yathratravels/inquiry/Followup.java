package lk.yathratravels.inquiry;

import java.time.LocalDateTime;

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

    @Column(name = "followup_status")
    private String followup_status;

    @Column(name = "addeddatetime")
    private LocalDateTime addeddatetime;

    @Column(name = "addeduserid")
    private Integer addeduserid;

    @ManyToOne
    @JoinColumn(name = "inquiry_id", referencedColumnName = "id")
    private Inq inquiry_id;

    @ManyToOne(optional = true)
    @JoinColumn(name = "last_sent_tpkg" , referencedColumnName = "id")
    private TourPkg last_sent_tpkg;

}

/*
 * adddeddatetime datetime
 * addeduserid int
 * content text
 * followup_status varchar(45)
 * inquiry_id int
 */
