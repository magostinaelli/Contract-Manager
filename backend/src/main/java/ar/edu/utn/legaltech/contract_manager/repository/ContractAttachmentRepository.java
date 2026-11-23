package ar.edu.utn.legaltech.contract_manager.repository;

import ar.edu.utn.legaltech.contract_manager.model.Contract;
import ar.edu.utn.legaltech.contract_manager.model.ContractAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContractAttachmentRepository extends JpaRepository<ContractAttachment, Long> {

    List<ContractAttachment> findByContractOrderByUploadedAtDesc(Contract contract);
}