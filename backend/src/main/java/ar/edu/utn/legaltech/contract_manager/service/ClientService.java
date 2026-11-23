package ar.edu.utn.legaltech.contract_manager.service;

import ar.edu.utn.legaltech.contract_manager.exception.InvalidTaxIdException;
import ar.edu.utn.legaltech.contract_manager.exception.ResourceNotFoundException;
import ar.edu.utn.legaltech.contract_manager.model.Client;
import ar.edu.utn.legaltech.contract_manager.repository.ClientRepository;
import ar.edu.utn.legaltech.contract_manager.repository.ContractRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final ContractRepository contractRepository;

    public ClientService(ClientRepository clientRepository, ContractRepository contractRepository) {
        this.clientRepository = clientRepository;
        this.contractRepository = contractRepository;
    }

    public List<Client> findAll() {
        return clientRepository.findAll();
    }

    public Client findById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + id));
    }

    public Client save(Client client) {
        client.setTaxId(normalizeTaxId(client.getTaxId()));
        return clientRepository.save(client);
    }

    public void delete(Long id) {
        Client client = findById(id);
        if (contractRepository.existsByClient(client)) {
            throw new IllegalStateException("No se puede eliminar el cliente porque tiene contratos asociados");
        }
        clientRepository.deleteById(id);
    }

    private String normalizeTaxId(String taxId) {
        if (taxId == null || taxId.isBlank()) {
            return null;
        }

        String normalized = taxId.replaceAll("[.\\-\\s]", "");

        if (!normalized.matches("\\d+")) {
            throw new InvalidTaxIdException(
                    "El DNI/CUIT/CUIL solo puede contener números, puntos, guiones y espacios"
            );
        }

        if (normalized.length() != 7
                && normalized.length() != 8
                && normalized.length() != 11) {
            throw new InvalidTaxIdException(
                    "El DNI debe tener 7 u 8 dígitos y el CUIT/CUIL debe tener 11 dígitos"
            );
        }

        if (normalized.length() == 11) {
            return normalized.substring(0, 2) + "-" +
                    normalized.substring(2, 10) + "-" +
                    normalized.substring(10);
        }

        return normalized;
    }
}