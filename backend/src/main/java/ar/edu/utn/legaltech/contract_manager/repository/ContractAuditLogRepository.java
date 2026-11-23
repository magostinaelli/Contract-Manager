package ar.edu.utn.legaltech.contract_manager.repository;

import ar.edu.utn.legaltech.contract_manager.model.Contract;
import ar.edu.utn.legaltech.contract_manager.model.ContractAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContractAuditLogRepository extends JpaRepository<ContractAuditLog, Long> {
    List<ContractAuditLog> findByContractOrderByCreatedAtDesc(Contract contract);
}