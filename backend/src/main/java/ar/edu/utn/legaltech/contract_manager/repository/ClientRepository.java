package ar.edu.utn.legaltech.contract_manager.repository;

import ar.edu.utn.legaltech.contract_manager.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long> {
}