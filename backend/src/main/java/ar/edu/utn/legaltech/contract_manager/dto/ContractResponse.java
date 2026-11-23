package ar.edu.utn.legaltech.contract_manager.dto;

import ar.edu.utn.legaltech.contract_manager.model.ContractStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class ContractResponse {
    private Long id;
    private String title;
    private ClientResponse client;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal amount;
    private ContractStatus status;
}