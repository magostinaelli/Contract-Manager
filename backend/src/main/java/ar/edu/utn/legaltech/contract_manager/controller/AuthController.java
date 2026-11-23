package ar.edu.utn.legaltech.contract_manager.controller;

import ar.edu.utn.legaltech.contract_manager.dto.AuthResponse;
import ar.edu.utn.legaltech.contract_manager.dto.LoginRequest;
import ar.edu.utn.legaltech.contract_manager.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }
}