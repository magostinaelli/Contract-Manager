package ar.edu.utn.legaltech.contract_manager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MonthlyExpirationResponse {
    private String month;
    private long count;
}