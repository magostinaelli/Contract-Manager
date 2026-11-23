package ar.edu.utn.legaltech.contract_manager.dto;

import ar.edu.utn.legaltech.contract_manager.model.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ContractAuditLogResponse {
    private AuditAction action;
    private String performedBy;
    private String detail;
    private LocalDateTime createdAt;
}