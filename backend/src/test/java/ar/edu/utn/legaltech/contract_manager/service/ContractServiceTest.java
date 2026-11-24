package ar.edu.utn.legaltech.contract_manager.service;

import ar.edu.utn.legaltech.contract_manager.exception.ResourceNotFoundException;
import ar.edu.utn.legaltech.contract_manager.model.AuditAction;
import ar.edu.utn.legaltech.contract_manager.model.Contract;
import ar.edu.utn.legaltech.contract_manager.model.ContractAuditLog;
import ar.edu.utn.legaltech.contract_manager.model.ContractStatus;
import ar.edu.utn.legaltech.contract_manager.repository.ContractAuditLogRepository;
import ar.edu.utn.legaltech.contract_manager.repository.ContractRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContractServiceTest {

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private ContractAuditLogRepository auditRepository;

    @InjectMocks
    private ContractService contractService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(contractService, "expiringSoonDays", 30);
        ReflectionTestUtils.setField(contractService, "expirationMonths", 6);
    }

    private Contract contract(int startOffsetDays, int endOffsetDays) {
        LocalDate today = LocalDate.now();
        Contract contract = new Contract();
        contract.setTitle("Contrato de prueba");
        contract.setStartDate(today.plusDays(startOffsetDays));
        contract.setEndDate(today.plusDays(endOffsetDays));
        return contract;
    }

    // --- Cálculo de estado (se prueba a través de save) ---

    @ParameterizedTest(name = "inicio {0}d, fin {1}d -> {2}")
    @CsvSource({
            "1,   100, DRAFT",          // todavía no empezó
            "-10, 100, ACTIVE",         // vigente y lejos del vencimiento
            "-10, 31,  ACTIVE",         // justo fuera de la ventana de 30 días
            "-10, 30,  EXPIRING_SOON",  // borde: entra en la ventana
            "-10, 10,  EXPIRING_SOON",
            "-10, 0,   EXPIRING_SOON",  // vence hoy: sigue vigente
            "-10, -1,  EXPIRED"         // venció ayer
    })
    void save_calculatesStatusFromDates(int startOffset, int endOffset, ContractStatus expected) {
        when(contractRepository.save(any(Contract.class))).thenAnswer(inv -> inv.getArgument(0));

        Contract saved = contractService.save(contract(startOffset, endOffset), "admin");

        assertThat(saved.getStatus()).isEqualTo(expected);
    }

    @Test
    void save_registersCreatedAuditEntry() {
        when(contractRepository.save(any(Contract.class))).thenAnswer(inv -> inv.getArgument(0));

        contractService.save(contract(-10, 100), "operator1");

        ArgumentCaptor<ContractAuditLog> captor = ArgumentCaptor.forClass(ContractAuditLog.class);
        verify(auditRepository).save(captor.capture());
        assertThat(captor.getValue().getAction()).isEqualTo(AuditAction.CREATED);
        assertThat(captor.getValue().getPerformedBy()).isEqualTo("operator1");
    }

    // --- update ---

    @Test
    void update_whenStatusChanges_logsUpdatedAndStatusChanged() {
        Contract existing = contract(-10, 100);
        existing.setStatus(ContractStatus.ACTIVE);
        when(contractRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(contractRepository.save(any(Contract.class))).thenAnswer(inv -> inv.getArgument(0));

        // Nuevas fechas: el contrato ya venció
        Contract data = contract(-100, -1);
        Contract updated = contractService.update(1L, data, "admin");

        assertThat(updated.getStatus()).isEqualTo(ContractStatus.EXPIRED);

        ArgumentCaptor<ContractAuditLog> captor = ArgumentCaptor.forClass(ContractAuditLog.class);
        verify(auditRepository, org.mockito.Mockito.times(2)).save(captor.capture());
        assertThat(captor.getAllValues())
                .extracting(ContractAuditLog::getAction)
                .containsExactly(AuditAction.UPDATED, AuditAction.STATUS_CHANGED);
        assertThat(captor.getAllValues().get(1).getDetail()).isEqualTo("ACTIVE -> EXPIRED");
    }

    @Test
    void update_whenStatusDoesNotChange_logsOnlyUpdated() {
        Contract existing = contract(-10, 100);
        existing.setStatus(ContractStatus.ACTIVE);
        when(contractRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(contractRepository.save(any(Contract.class))).thenAnswer(inv -> inv.getArgument(0));

        contractService.update(1L, contract(-5, 200), "admin");

        ArgumentCaptor<ContractAuditLog> captor = ArgumentCaptor.forClass(ContractAuditLog.class);
        verify(auditRepository).save(captor.capture());
        assertThat(captor.getValue().getAction()).isEqualTo(AuditAction.UPDATED);
    }

    @Test
    void update_whenContractDoesNotExist_throwsNotFound() {
        when(contractRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> contractService.update(99L, contract(-1, 10), "admin"));
    }

    // --- updateStatuses (tarea programada) ---

    @Test
    void updateStatuses_changesStatusAndLogsAsSystem() {
        Contract overdue = contract(-100, -1);
        overdue.setStatus(ContractStatus.ACTIVE);
        when(contractRepository.findByStatusIn(any())).thenReturn(List.of(overdue));

        int updated = contractService.updateStatuses();

        assertThat(updated).isEqualTo(1);
        assertThat(overdue.getStatus()).isEqualTo(ContractStatus.EXPIRED);

        ArgumentCaptor<ContractAuditLog> captor = ArgumentCaptor.forClass(ContractAuditLog.class);
        verify(auditRepository).save(captor.capture());
        assertThat(captor.getValue().getAction()).isEqualTo(AuditAction.STATUS_CHANGED);
        assertThat(captor.getValue().getPerformedBy()).isEqualTo("SYSTEM");
    }

    @Test
    void updateStatuses_whenNothingChanges_returnsZeroAndDoesNotAudit() {
        Contract fine = contract(-10, 100);
        fine.setStatus(ContractStatus.ACTIVE);
        when(contractRepository.findByStatusIn(any())).thenReturn(List.of(fine));

        int updated = contractService.updateStatuses();

        assertThat(updated).isZero();
        verify(auditRepository, never()).save(any());
    }

    // --- findById ---

    @Test
    void findById_whenMissing_throwsNotFound() {
        when(contractRepository.findById(5L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> contractService.findById(5L));
    }
}