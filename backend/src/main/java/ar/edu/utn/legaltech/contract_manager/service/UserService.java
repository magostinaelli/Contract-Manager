package ar.edu.utn.legaltech.contract_manager.service;

import ar.edu.utn.legaltech.contract_manager.dto.UserCreateRequest;
import ar.edu.utn.legaltech.contract_manager.exception.ResourceNotFoundException;
import ar.edu.utn.legaltech.contract_manager.model.Role;
import ar.edu.utn.legaltech.contract_manager.model.User;
import ar.edu.utn.legaltech.contract_manager.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found: " + id)
                );
    }

    public User create(UserCreateRequest request) {
        User user = new User();

        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        return userRepository.save(user);
    }

    public User updateRole(Long id, Role newRole, String currentUsername) {
        User user = findById(id);

        if (user.getUsername().equals(currentUsername)) {
            throw new IllegalStateException("No podés cambiar tu propio rol");
        }

        user.setRole(newRole);
        return userRepository.save(user);
    }

    public void delete(Long id, String currentUsername) {
        User target = findById(id);

        if (target.getUsername().equals(currentUsername)) {
            throw new IllegalStateException(
                    "No podés eliminar tu propio usuario"
            );
        }

        userRepository.deleteById(id);
    }
}