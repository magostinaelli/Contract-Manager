
package ar.edu.utn.legaltech.contract_manager.service;

import ar.edu.utn.legaltech.contract_manager.dto.ContractAttachmentResponse;
import ar.edu.utn.legaltech.contract_manager.exception.ResourceNotFoundException;
import ar.edu.utn.legaltech.contract_manager.model.Contract;
import ar.edu.utn.legaltech.contract_manager.model.ContractAttachment;
import ar.edu.utn.legaltech.contract_manager.repository.ContractAttachmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContractAttachmentService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final byte[] PDF_SIGNATURE = {'%', 'P', 'D', 'F', '-'};

    private final ContractAttachmentRepository attachmentRepository;
    private final ContractService contractService;

    public ContractAttachmentService(
            ContractAttachmentRepository attachmentRepository,
            ContractService contractService
    ) {
        this.attachmentRepository = attachmentRepository;
        this.contractService = contractService;
    }

    @Transactional
    public ContractAttachmentResponse upload(
            Long contractId,
            MultipartFile file,
            String uploadedBy
    ) throws IOException {

        Contract contract = contractService.findById(contractId);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo no puede estar vacío");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("El archivo supera el tamaño máximo de 10 MB");
        }

        byte[] fileData = file.getBytes();

        if (fileData.length < PDF_SIGNATURE.length) {
            throw new IllegalArgumentException("El archivo no es un PDF válido");
        }

        for (int i = 0; i < PDF_SIGNATURE.length; i++) {
            if (fileData[i] != PDF_SIGNATURE[i]) {
                throw new IllegalArgumentException("El archivo no es un PDF válido");
            }
        }

        String fileName = file.getOriginalFilename();

        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("El nombre del archivo es obligatorio");
        }

        if (fileName.length() > 255) {
            throw new IllegalArgumentException("El nombre del archivo supera los 255 caracteres");
        }

        ContractAttachment attachment = new ContractAttachment();
        attachment.setContract(contract);
        attachment.setFileName(fileName);
        attachment.setFileSize((long) fileData.length);
        attachment.setFileData(fileData);
        attachment.setUploadedBy(uploadedBy);
        attachment.setUploadedAt(LocalDateTime.now());

        ContractAttachment saved = attachmentRepository.save(attachment);

        contractService.registerAttachmentAdded(contract, uploadedBy, fileName);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ContractAttachmentResponse> findByContract(Long contractId) {

        Contract contract = contractService.findById(contractId);

        return attachmentRepository.findByContractOrderByUploadedAtDesc(contract)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ContractAttachment findById(Long contractId, Long attachmentId) {

        contractService.findById(contractId);

        ContractAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attachment not found: " + attachmentId
                ));

        if (!attachment.getContract().getId().equals(contractId)) {
            throw new ResourceNotFoundException(
                    "Attachment not found for contract: " + contractId
            );
        }

        return attachment;
    }

    private ContractAttachmentResponse toResponse(ContractAttachment attachment) {
        return new ContractAttachmentResponse(
                attachment.getId(),
                attachment.getFileName(),
                attachment.getFileSize(),
                attachment.getUploadedBy(),
                attachment.getUploadedAt()
        );
    }
}
