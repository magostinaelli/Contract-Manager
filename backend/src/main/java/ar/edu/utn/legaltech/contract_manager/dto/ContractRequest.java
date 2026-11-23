package ar.edu.utn.legaltech.contract_manager.dto;

import ar.edu.utn.legaltech.contract_manager.model.ContractStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ContractRequest {

    @NotBlank(message = "El título es obligatorio")
    private String title;

    @NotNull(message = "El cliente es obligatorio")
    private Long clientId;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate startDate;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate endDate;

    private BigDecimal amount;
}