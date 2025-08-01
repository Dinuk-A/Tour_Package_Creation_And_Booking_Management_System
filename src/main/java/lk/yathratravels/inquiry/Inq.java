package lk.yathratravels.inquiry;

import jakarta.persistence.*;
import lk.yathratravels.employee.Employee;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "inquiry")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inq {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    // in web form ✅
    @Column(name = "clienttitle")
    private String clienttitle;

    @Column(name = "clientname")
    private String clientname;

    @Column(name = "email")
    private String email;

    @Column(name = "contactnum")
    private String contactnum;

    @Column(name = "prefcontactmethod")
    private String prefcontactmethod;

    @Column(name = "intrstdpkgid")
    private Integer intrstdpkgid;

    @Column(name = "lastquotedpkgid")
    private Integer lastquotedpkgid;

    @Column(name = "main_inq_msg")
    private String main_inq_msg;

    @Column(name = "inq_apprx_start_date")
    private LocalDate inq_apprx_start_date;

    // general traveller count
    @Column(name = "inq_kids")
    private Integer inq_kids;

    @Column(name = "inq_adults")
    private Integer inq_adults;

    @Column(name = "inq_vplaces")
    private String inq_vplaces;

    @Column(name = "inq_accos")
    private String inq_accos;

    @Column(name = "inq_vehi")
    private String inq_vehi;

    // NATIONALITY LINK
    @ManyToOne
    @JoinColumn(name = "nationality_id", referencedColumnName = "id")
    private Nationality nationality_id;

    // hidden in web form ✅
    @Column(name = "inqcode")
    private String inqcode;

    @Column(name = "inqsrc")
    private String inqsrc;

    @Column(name = "recieveddate")
    private LocalDate recieveddate;

    @Column(name = "recievedtime")
    private LocalTime recievedtime;

    // in system form ✅
    @ManyToOne
    @JoinColumn(name = "assigned_empid", referencedColumnName = "id")
    private Employee assigned_empid;

    @Column(name = "recievedcontactoremail")
    private String recievedcontactoremail;

    @Column(name = "contactnumtwo")
    private String contactnumtwo;

    @Column(name = "passportnumornic")
    private String passportnumornic;

    // for foreigners
    @Column(name = "inq_foreign_adults")
    private Integer inq_foreign_adults;

    @Column(name = "inq_foreign_kids")
    private Integer inq_foreign_kids;

    // for locals
    @Column(name = "inq_local_adults")
    private Integer inq_local_adults;

    @Column(name = "inq_local_kids")
    private Integer inq_local_kids;

    @Column(name = "inq_guideneed")
    private Boolean inq_guideneed;

    @Column(name = "is_startdate_confirmed")
    private Boolean is_startdate_confirmed;

    @Column(name = "inq_pick")
    private String inq_pick;

    @Column(name = "inq_drop")
    private String inq_drop;

    @Column(name = "note")
    private String note;

    @Column(name = "inq_status")
    private String inq_status;

    // hidden in system form ✅

    @Column(name = "deleted_inq")
    private Boolean deleted_inq;

    @Column(name = "addeddatetime")
    private LocalDateTime addeddatetime;

    @Column(name = "addeduserid")
    private Integer addeduserid;

    @Column(name = "deleteddatetime")
    private LocalDateTime deleteddatetime;

    @Column(name = "deleteduserid")
    private Integer deleteduserid;

    /**
     * @param clientname
     * @param inqcode
     */
    public Inq(Integer id,String clientname, String inqcode) {
        this.id = id;
        this.clientname = clientname;
        this.inqcode = inqcode;
    }

}
