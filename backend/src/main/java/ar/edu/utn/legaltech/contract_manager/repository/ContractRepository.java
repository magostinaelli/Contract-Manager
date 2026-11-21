package ar.edu.utn.legaltech.contract_manager.repository;

import ar.edu.utn.legaltech.contract_manager.model.Client;
import ar.edu.utn.legaltech.contract_manager.model.Contract;
import ar.edu.utn.legaltech.contract_manager.model.ContractStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ContractRepository extends JpaRepository<Contract, Long> {
    List<Contract> findByStatusIn(List<ContractStatus> statuses);

    List<Contract> findByStatus(ContractStatus status);

    long countByStatus(ContractStatus status);

    boolean existsByClient(Client client);

    List<Contract> findByStatusInAndEndDateBetween(
            List<ContractStatus> statuses,
            LocalDate from,
            LocalDate to
    );
}