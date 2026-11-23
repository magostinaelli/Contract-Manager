package ar.edu.utn.legaltech.contract_manager.dto;

import ar.edu.utn.legaltech.contract_manager.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private Role role;
}