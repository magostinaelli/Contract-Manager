package ar.edu.utn.legaltech.contract_manager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClientRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    private String taxId;

    @Email(message = "El email no tiene un formato válido")
    private String email;

    private String phoneCountryCode;

    private String phoneNumber;
}