package ar.edu.utn.legaltech.contract_manager.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "clients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "tax_id")
    private String taxId;

    private String email;

    @Column(name = "phone_country_code")
    private String phoneCountryCode;

    @Column(name = "phone_number")
    private String phoneNumber;
}