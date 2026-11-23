package ar.edu.utn.legaltech.contract_manager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class DashboardResponse {
    private long totalActiveContracts;
    private long expiringSoonCount;
    private BigDecimal totalCommittedAmount;
    private Map<String, Long> contractsByStatus;
    private List<MonthlyExpirationResponse> monthlyExpirations;
}