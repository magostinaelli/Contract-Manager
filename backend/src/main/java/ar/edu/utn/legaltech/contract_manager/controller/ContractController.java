package ar.edu.utn.legaltech.contract_manager.controller;

import ar.edu.utn.legaltech.contract_manager.dto.ClientResponse;
import ar.edu.utn.legaltech.contract_manager.dto.ContractAuditLogResponse;
import ar.edu.utn.legaltech.contract_manager.dto.ContractRequest;
import ar.edu.utn.legaltech.contract_manager.dto.ContractResponse;
import ar.edu.utn.legaltech.contract_manager.dto.DashboardResponse;
import ar.edu.utn.legaltech.contract_manager.model.Client;
import ar.edu.utn.legaltech.contract_manager.model.Contract;
import ar.edu.utn.legaltech.contract_manager.service.ClientService;
import ar.edu.utn.legaltech.contract_manager.service.ContractService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import ar.edu.utn.legaltech.contract_manager.service.ContractAttachmentService;
import ar.edu.utn.legaltech.contract_manager.dto.ContractAttachmentResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import ar.edu.utn.legaltech.contract_manager.model.ContractAttachment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/contracts")
public class ContractController {

    private final ContractService contractService;
    private final ClientService clientService;
    private final ContractAttachmentService contractAttachmentService;

    public ContractController(
            ContractService contractService,
            ClientService clientService,
            ContractAttachmentService contractAttachmentService
    ) {
        this.contractService = contractService;
        this.clientService = clientService;
        this.contractAttachmentService = contractAttachmentService;
    }

    @GetMapping
    public List<ContractResponse> getAll() {
        return contractService.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public ContractResponse getById(@PathVariable Long id) {
        return toResponse(contractService.findById(id));
    }


    @Operation(
            summary = "Crear un contrato",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping
    public ResponseEntity<ContractResponse> create(
            @Valid @RequestBody ContractRequest request,
            Authentication authentication
    ) {
        Contract contract = fromRequest(request);
        Contract saved = contractService.save(contract, authentication.getName());
        return ResponseEntity.ok(toResponse(saved));
    }


    @Operation(
            summary = "Actualizar un contrato",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PutMapping("/{id}")
    public ContractResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ContractRequest request,
            Authentication authentication
    ) {
        Contract contract = fromRequest(request);
        Contract updated = contractService.update(id, contract, authentication.getName());
        return toResponse(updated);
    }


    @Operation(
            summary = "Eliminar un contrato",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contractService.delete(id);
        return ResponseEntity.noContent().build();
    }


    @Operation(
            summary = "Actualizar estados de contratos",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/update-statuses")
    public ResponseEntity<Void> updateStatuses() {
        contractService.updateStatuses();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/expiring-soon")
    public List<ContractResponse> getExpiringSoon() {
        return contractService.findExpiringSoon().stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}/audit")
    public List<ContractAuditLogResponse> getAuditLog(@PathVariable Long id) {
        return contractService.getAuditLog(id);
    }

    private Contract fromRequest(ContractRequest request) {
        Client client = clientService.findById(request.getClientId());

        Contract contract = new Contract();
        contract.setTitle(request.getTitle());
        contract.setClient(client);
        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setAmount(request.getAmount());

        return contract;
    }

    private ContractResponse toResponse(Contract contract) {
        Client client = contract.getClient();

        ClientResponse clientResponse = new ClientResponse(
                client.getId(),
                client.getName(),
                client.getTaxId(),
                client.getEmail(),
                client.getPhoneCountryCode(),
                client.getPhoneNumber()
        );

        return new ContractResponse(
                contract.getId(),
                contract.getTitle(),
                clientResponse,
                contract.getStartDate(),
                contract.getEndDate(),
                contract.getAmount(),
                contract.getStatus()
        );
    }

    @GetMapping("/dashboard")
    public DashboardResponse getDashboard() {
        return contractService.getDashboard();
    }

    @Operation(
            summary = "Subir un PDF a un contrato",
            description = "Adjunta un archivo PDF al contrato indicado. Requiere autenticación JWT.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "201", description = "Archivo adjuntado correctamente")
    @ApiResponse(responseCode = "400", description = "Archivo inválido o vacío")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    @ApiResponse(responseCode = "404", description = "Contrato no encontrado")
    @ApiResponse(responseCode = "413", description = "El archivo supera los 10 MB")
    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContractAttachmentResponse> uploadAttachment(
            @PathVariable Long id,
            @Parameter(
                    description = "Archivo PDF de hasta 10 MB",
                    required = true,
                    content = @Content(mediaType = MediaType.APPLICATION_PDF_VALUE)
            )
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) throws IOException {
        ContractAttachmentResponse response = contractAttachmentService.upload(
                id,
                file,
                authentication.getName()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Listar adjuntos de un contrato",
            description = "Devuelve los archivos adjuntos del contrato. Requiere autenticación JWT.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    @ApiResponse(responseCode = "404", description = "Contrato no encontrado")
    @GetMapping("/{id}/attachments")
    public List<ContractAttachmentResponse> getAttachments(@PathVariable Long id) {
        return contractAttachmentService.findByContract(id);
    }

    @Operation(
            summary = "Descargar un adjunto",
            description = "Descarga el PDF indicado, siempre que pertenezca al contrato especificado. Requiere autenticación JWT.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(
            responseCode = "200",
            description = "PDF descargado correctamente",
            content = @Content(
                    mediaType = MediaType.APPLICATION_PDF_VALUE,
                    schema = @Schema(type = "string", format = "binary")
            )
    )
    @ApiResponse(responseCode = "401", description = "No autenticado")
    @ApiResponse(responseCode = "404", description = "Contrato o adjunto no encontrado")
    @GetMapping("/{id}/attachments/{attachmentId}")
    public ResponseEntity<byte[]> downloadAttachment(
            @PathVariable Long id,
            @PathVariable Long attachmentId
    ) {
        ContractAttachment attachment = contractAttachmentService.findById(id, attachmentId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + attachment.getFileName() + "\""
                )
                .contentLength(attachment.getFileSize())
                .body(attachment.getFileData());
    }
}