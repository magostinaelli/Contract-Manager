package ar.edu.utn.legaltech.contract_manager.controller;

import ar.edu.utn.legaltech.contract_manager.dto.ClientRequest;
import ar.edu.utn.legaltech.contract_manager.dto.ClientResponse;
import ar.edu.utn.legaltech.contract_manager.model.Client;
import ar.edu.utn.legaltech.contract_manager.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping
    public List<ClientResponse> getAll() {
        return clientService.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public ClientResponse getById(@PathVariable Long id) {
        return toResponse(clientService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ClientResponse> create(@Valid @RequestBody ClientRequest request) {
        Client client = new Client();
        client.setName(request.getName());
        client.setTaxId(clientService.normalizeTaxId(request.getTaxId()));
        client.setEmail(request.getEmail());
        client.setPhoneCountryCode(request.getPhoneCountryCode());
        client.setPhoneNumber(request.getPhoneNumber());

        Client saved = clientService.save(client);

        return ResponseEntity.ok(toResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ClientRequest request
    ) {
        Client client = clientService.findById(id);

        client.setName(request.getName());
        client.setTaxId(clientService.normalizeTaxId(request.getTaxId()));
        client.setEmail(request.getEmail());
        client.setPhoneCountryCode(request.getPhoneCountryCode());
        client.setPhoneNumber(request.getPhoneNumber());

        Client updated = clientService.save(client);

        return ResponseEntity.ok(toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clientService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private ClientResponse toResponse(Client client) {
        return new ClientResponse(
                client.getId(),
                client.getName(),
                client.getTaxId(),
                client.getEmail(),
                client.getPhoneCountryCode(),
                client.getPhoneNumber()
        );
    }
}