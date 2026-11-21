package ar.edu.utn.legaltech.contract_manager.repository;

import ar.edu.utn.legaltech.contract_manager.model.Role;
import ar.edu.utn.legaltech.contract_manager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByRole(Role role);
}