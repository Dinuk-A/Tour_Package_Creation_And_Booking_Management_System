package lk.yathratravels.vehicle;

import java.math.BigDecimal;

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
@Table(name = "vehicletype")
@Data
@AllArgsConstructor
@NoArgsConstructor

public class VehicleType {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "name")
    private String name;

    //int_avg_cpkm
    @Column(name = "int_avg_cpkm")
    private BigDecimal int_avg_cpkm;

    //ext_avg_cpkm
    @Column(name = "ext_avg_cpkm")
    private BigDecimal ext_avg_cpkm;

}
