package ar.edu.utn.legaltech.contract_manager.config;

import ar.edu.utn.legaltech.contract_manager.service.ContractService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ContractStatusScheduler {

    private static final Logger log = LoggerFactory.getLogger(ContractStatusScheduler.class);

    private final ContractService contractService;

    public ContractStatusScheduler(ContractService contractService) {
        this.contractService = contractService;
    }

    @Scheduled(cron = "${contract.status-update-cron}")
    public void runDailyStatusUpdate() {
        int updated = contractService.updateStatuses();
        log.info("Daily status update: {} contract(s) updated", updated);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void runOnStartup() {
        try {
            int updated = contractService.updateStatuses();
            log.info("Startup status update: {} contract(s) updated", updated);
        } catch (Exception e) {
            log.warn("Startup status update failed, the app will keep running", e);
        }
    }
}