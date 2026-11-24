package ar.edu.utn.legaltech.contract_manager.controller;

import ar.edu.utn.legaltech.contract_manager.config.JwtService;
import ar.edu.utn.legaltech.contract_manager.config.SecurityConfig;
import ar.edu.utn.legaltech.contract_manager.exception.FileTooLargeException;
import ar.edu.utn.legaltech.contract_manager.exception.ResourceNotFoundException;
import ar.edu.utn.legaltech.contract_manager.model.Client;
import ar.edu.utn.legaltech.contract_manager.model.Contract;
import ar.edu.utn.legaltech.contract_manager.model.ContractStatus;
import ar.edu.utn.legaltech.contract_manager.service.ClientService;
import ar.edu.utn.legaltech.contract_manager.service.ContractAttachmentService;
import ar.edu.utn.legaltech.contract_manager.service.ContractService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ContractController.class)
@Import(SecurityConfig.class)
class ContractControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ContractService contractService;

    @MockitoBean
    private ClientService clientService;

    @MockitoBean
    private ContractAttachmentService attachmentService;

    @MockitoBean
    private JwtService jwtService;

    // --- Autenticación ---


    @Test
    @WithMockUser(roles = "OPERATOR")
    void getContracts_asOperator_isOk() throws Exception {
        when(contractService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/contracts"))
                .andExpect(status().isOk());
    }

    // --- RBAC: DELETE solo ADMIN ---

    @Test
    @WithMockUser(roles = "OPERATOR")
    void deleteContract_asOperator_isForbidden() throws Exception {
        mockMvc.perform(delete("/api/contracts/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteContract_asAdmin_isNoContent() throws Exception {
        mockMvc.perform(delete("/api/contracts/1"))
                .andExpect(status().isNoContent());

        verify(contractService).delete(1L);
    }

    // --- Crear contrato ---

    @Test
    @WithMockUser(username = "operator1", roles = "OPERATOR")
    void createContract_withValidBody_returnsOkAndPassesUsername() throws Exception {
        Client client = new Client();
        client.setId(1L);
        client.setName("Cliente Test");

        Contract saved = new Contract();
        saved.setId(10L);
        saved.setTitle("Servicio anual");
        saved.setClient(client);
        saved.setStartDate(LocalDate.of(2026, 1, 1));
        saved.setEndDate(LocalDate.of(2026, 12, 31));
        saved.setStatus(ContractStatus.ACTIVE);

        when(clientService.findById(1L)).thenReturn(client);
        when(contractService.save(any(Contract.class), eq("operator1"))).thenReturn(saved);

        String body = """
                {"title":"Servicio anual","clientId":1,
                 "startDate":"2026-01-01","endDate":"2026-12-31"}
                """;

        mockMvc.perform(post("/api/contracts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.title").value("Servicio anual"));
    }

    @Test
    @WithMockUser(roles = "OPERATOR")
    void createContract_withoutTitle_returnsBadRequestWithFieldError() throws Exception {
        String body = """
                {"clientId":1,"startDate":"2026-01-01","endDate":"2026-12-31"}
                """;

        mockMvc.perform(post("/api/contracts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("El título es obligatorio"));
    }

    // --- Errores ---

    @Test
    @WithMockUser(roles = "OPERATOR")
    void getContract_whenMissing_returnsNotFoundWithErrorKey() throws Exception {
        when(contractService.findById(99L))
                .thenThrow(new ResourceNotFoundException("Contract not found: 99"));

        mockMvc.perform(get("/api/contracts/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Contract not found: 99"));
    }

    // --- Adjuntos ---

    @Test
    @WithMockUser(roles = "OPERATOR")
    void uploadAttachment_whenFileTooLarge_returns413() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "grande.pdf", "application/pdf", "%PDF-1.4".getBytes());

        when(attachmentService.upload(eq(1L), any(), any()))
                .thenThrow(new FileTooLargeException("El archivo supera el tamaño máximo de 10 MB"));

        mockMvc.perform(multipart("/api/contracts/1/attachments").file(file))
                .andExpect(status().isPayloadTooLarge())
                .andExpect(jsonPath("$.error").value("El archivo supera el tamaño máximo de 10 MB"));
    }

    // --- Autenticación ---

    @Test
    void getContracts_withoutAuthentication_isUnauthorized() throws Exception {
        mockMvc.perform(get("/api/contracts"))
                .andExpect(status().isUnauthorized());
    }
    @Test
    void listAttachments_withoutAuthentication_isUnauthorized() throws Exception {
        mockMvc.perform(get("/api/contracts/1/attachments"))
                .andExpect(status().isUnauthorized());
    }
}