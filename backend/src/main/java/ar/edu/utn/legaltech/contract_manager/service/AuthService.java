package ar.edu.utn.legaltech.contract_manager.service;

import ar.edu.utn.legaltech.contract_manager.config.JwtService;
import ar.edu.utn.legaltech.contract_manager.dto.AuthResponse;
import ar.edu.utn.legaltech.contract_manager.dto.LoginRequest;
import ar.edu.utn.legaltech.contract_manager.dto.RegisterRequest;
import ar.edu.utn.legaltech.contract_manager.exception.InvalidCredentialsException;
import ar.edu.utn.legaltech.contract_manager.model.User;
import ar.edu.utn.legaltech.contract_manager.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new InvalidCredentialsException("Invalid credentials")
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        String token = jwtService.generateToken(
                user.getUsername(),
                user.getRole().name()
        );

        return new AuthResponse(token);
    }
}