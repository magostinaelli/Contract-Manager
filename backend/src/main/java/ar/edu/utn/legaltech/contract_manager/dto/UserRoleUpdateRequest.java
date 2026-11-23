package ar.edu.utn.legaltech.contract_manager.dto;

import ar.edu.utn.legaltech.contract_manager.model.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserRoleUpdateRequest {
    @NotNull(message = "El rol es obligatorio")
    private Role role;
}