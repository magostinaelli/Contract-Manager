package ar.edu.utn.legaltech.contract_manager.service;

import ar.edu.utn.legaltech.contract_manager.dto.ContractAuditLogResponse;
import ar.edu.utn.legaltech.contract_manager.dto.DashboardResponse;
import ar.edu.utn.legaltech.contract_manager.dto.MonthlyExpirationResponse;
import ar.edu.utn.legaltech.contract_manager.exception.ResourceNotFoundException;
import ar.edu.utn.legaltech.contract_manager.model.AuditAction;
import ar.edu.utn.legaltech.contract_manager.model.Contract;
import ar.edu.utn.legaltech.contract_manager.model.ContractAuditLog;
import ar.edu.utn.legaltech.contract_manager.model.ContractStatus;
import ar.edu.utn.legaltech.contract_manager.repository.ContractAuditLogRepository;
import ar.edu.utn.legaltech.contract_manager.repository.ContractRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ContractService {

    private final ContractRepository contractRepository;
    private final ContractAuditLogRepository contractAuditLogRepository;

    @Value("${contract.expiring-soon-days}")
    private int expiringSoonDays;

    @Value("${dashboard.expiration-months:6}")
    private int expirationMonths;

    public ContractService(ContractRepository contractRepository, ContractAuditLogRepository contractAuditLogRepository) {
        this.contractRepository = contractRepository;
        this.contractAuditLogRepository = contractAuditLogRepository;
    }

    public List<Contract> findAll() {
        return contractRepository.findAll();
    }

    public Contract findById(Long id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found: " + id));
    }

    public Contract save(Contract contract, String performedBy) {
        contract.setStatus(calculateStatus(
                contract.getStartDate(),
                contract.getEndDate()
        ));

        Contract saved = contractRepository.save(contract);
        logAudit(saved, AuditAction.CREATED, performedBy, "Contrato creado");

        return saved;
    }

    public Contract update(Long id, Contract data, String performedBy) {
        Contract existing = findById(id);
        ContractStatus previousStatus = existing.getStatus();

        existing.setTitle(data.getTitle());
        existing.setClient(data.getClient());
        existing.setStartDate(data.getStartDate());
        existing.setEndDate(data.getEndDate());
        existing.setAmount(data.getAmount());
        existing.setStatus(calculateStatus(existing.getStartDate(), existing.getEndDate()));

        Contract updated = contractRepository.save(existing);
        logAudit(updated, AuditAction.UPDATED, performedBy, "Contrato actualizado");

        if (previousStatus != updated.getStatus()) {
            logAudit(updated, AuditAction.STATUS_CHANGED, performedBy, previousStatus + " -> " + updated.getStatus());
        }

        return updated;
    }

    public void delete(Long id) {
        contractRepository.deleteById(id);
    }

    public int updateStatuses() {
        List<Contract> managed = contractRepository.findByStatusIn(
                List.of(ContractStatus.DRAFT, ContractStatus.ACTIVE, ContractStatus.EXPIRING_SOON)
        );

        int updatedCount = 0;

        for (Contract contract : managed) {
            ContractStatus newStatus = calculateStatus(contract.getStartDate(), contract.getEndDate());

            if (newStatus != contract.getStatus()) {
                String detail = contract.getStatus() + " -> " + newStatus;
                contract.setStatus(newStatus);
                contractRepository.save(contract);
                logAudit(contract, AuditAction.STATUS_CHANGED, "SYSTEM", detail);
                updatedCount++;
            }
        }

        return updatedCount;
    }

    private ContractStatus calculateStatus(LocalDate startDate, LocalDate endDate) {
        LocalDate today = LocalDate.now();

        if (today.isBefore(startDate)) {
            return ContractStatus.DRAFT;
        }
        if (today.isAfter(endDate)) {
            return ContractStatus.EXPIRED;
        }
        if (!today.isBefore(endDate.minusDays(expiringSoonDays))) {
            return ContractStatus.EXPIRING_SOON;
        }
        return ContractStatus.ACTIVE;
    }

    public List<Contract> findExpiringSoon() {
        return contractRepository.findByStatus(ContractStatus.EXPIRING_SOON);
    }

    public DashboardResponse getDashboard() {
        long activeCount = contractRepository.countByStatus(ContractStatus.ACTIVE);
        long expiringSoonCount = contractRepository.countByStatus(ContractStatus.EXPIRING_SOON);

        BigDecimal totalCommitted = contractRepository.findByStatusIn(
                        List.of(ContractStatus.ACTIVE, ContractStatus.EXPIRING_SOON))
                .stream()
                .map(Contract::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> byStatus = new java.util.LinkedHashMap<>();

        for (ContractStatus status : ContractStatus.values()) {
            byStatus.put(status.name(), contractRepository.countByStatus(status));
        }

        List<MonthlyExpirationResponse> monthlyExpirations = getExpirationsByMonth();

        return new DashboardResponse(
                activeCount,
                expiringSoonCount,
                totalCommitted,
                byStatus,
                monthlyExpirations
        );
    }

    public List<ContractAuditLogResponse> getAuditLog(Long contractId) {
        Contract contract = findById(contractId);
        return contractAuditLogRepository.findByContractOrderByCreatedAtDesc(contract).stream()
                .map(log -> new ContractAuditLogResponse(log.getAction(), log.getPerformedBy(), log.getDetail(), log.getCreatedAt()))
                .toList();
    }

    private void logAudit(Contract contract, AuditAction action, String performedBy, String detail) {
        ContractAuditLog log = new ContractAuditLog();
        log.setContract(contract);
        log.setAction(action);
        log.setPerformedBy(performedBy);
        log.setDetail(detail);
        log.setCreatedAt(LocalDateTime.now());
        contractAuditLogRepository.save(log);
    }

    public List<MonthlyExpirationResponse> getExpirationsByMonth() {
        LocalDate today = LocalDate.now();
        YearMonth firstMonth = YearMonth.from(today);
        YearMonth lastMonth = firstMonth.plusMonths(expirationMonths - 1);

        List<Contract> contracts = contractRepository.findByStatusInAndEndDateBetween(
                List.of(
                        ContractStatus.ACTIVE,
                        ContractStatus.EXPIRING_SOON
                ),
                today,
                lastMonth.atEndOfMonth()
        );

        Map<YearMonth, Long> countsByMonth = contracts.stream()
                .collect(Collectors.groupingBy(
                        contract -> YearMonth.from(contract.getEndDate()),
                        Collectors.counting()
                ));

        List<MonthlyExpirationResponse> result = new ArrayList<>();

        for (YearMonth month = firstMonth;
             !month.isAfter(lastMonth);
             month = month.plusMonths(1)) {

            result.add(new MonthlyExpirationResponse(
                    month.toString(),
                    countsByMonth.getOrDefault(month, 0L)
            ));
        }

        return result;
    }

    public void registerAttachmentAdded(Contract contract, String performedBy, String fileName) {
        logAudit(
                contract,
                AuditAction.ATTACHMENT_ADDED,
                performedBy,
                "Archivo adjunto agregado: " + fileName
        );
    }
}