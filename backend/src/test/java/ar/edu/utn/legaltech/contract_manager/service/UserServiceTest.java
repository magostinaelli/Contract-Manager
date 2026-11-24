package ar.edu.utn.legaltech.contract_manager.service;

import ar.edu.utn.legaltech.contract_manager.dto.UserCreateRequest;
import ar.edu.utn.legaltech.contract_manager.exception.DuplicateResourceException;
import ar.edu.utn.legaltech.contract_manager.exception.ResourceNotFoundException;
import ar.edu.utn.legaltech.contract_manager.model.Role;
import ar.edu.utn.legaltech.contract_manager.model.User;
import ar.edu.utn.legaltech.contract_manager.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User user(String username, Role role) {
        User user = new User();
        user.setUsername(username);
        user.setRole(role);
        return user;
    }

    private UserCreateRequest createRequest(String username, String password, Role role) {
        UserCreateRequest request = new UserCreateRequest();
        request.setUsername(username);
        request.setPassword(password);
        request.setRole(role);
        return request;
    }

    // --- create ---

    @Test
    void create_hashesPasswordAndSavesUser() {
        when(userRepository.findByUsername("nuevo")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("secreto123")).thenReturn("HASH");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User created = userService.create(createRequest("nuevo", "secreto123", Role.OPERATOR));

        assertThat(created.getUsername()).isEqualTo("nuevo");
        assertThat(created.getPassword()).isEqualTo("HASH");
        assertThat(created.getRole()).isEqualTo(Role.OPERATOR);
    }

    @Test
    void create_withExistingUsername_throwsDuplicate() {
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user("admin", Role.ADMIN)));

        assertThrows(DuplicateResourceException.class,
                () -> userService.create(createRequest("admin", "x", Role.OPERATOR)));

        verify(userRepository, never()).save(any());
    }

    // --- updateRole ---

    @Test
    void updateRole_ofAnotherUser_changesRole() {
        User target = user("operador", Role.OPERATOR);
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User updated = userService.updateRole(2L, Role.ADMIN, "admin");

        assertThat(updated.getRole()).isEqualTo(Role.ADMIN);
    }

    @Test
    void updateRole_ofOwnUser_throwsAndDoesNotSave() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user("admin", Role.ADMIN)));

        assertThrows(IllegalStateException.class,
                () -> userService.updateRole(1L, Role.OPERATOR, "admin"));

        verify(userRepository, never()).save(any());
    }

    // --- delete ---

    @Test
    void delete_ofAnotherUser_deletesIt() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(user("operador", Role.OPERATOR)));

        userService.delete(2L, "admin");

        verify(userRepository).deleteById(2L);
    }

    @Test
    void delete_ofOwnUser_throwsAndDoesNotDelete() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user("admin", Role.ADMIN)));

        assertThrows(IllegalStateException.class, () -> userService.delete(1L, "admin"));

        verify(userRepository, never()).deleteById(any());
    }

    @Test
    void findById_whenMissing_throwsNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.findById(99L));
    }
}