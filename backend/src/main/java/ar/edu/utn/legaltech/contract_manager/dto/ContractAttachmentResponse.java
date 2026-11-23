package ar.edu.utn.legaltech.contract_manager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ContractAttachmentResponse {

    private Long id;
    private String fileName;
    private Long fileSize;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
}