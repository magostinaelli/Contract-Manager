package ar.edu.utn.legaltech.contract_manager.service;

import ar.edu.utn.legaltech.contract_manager.exception.InvalidTaxIdException;
import ar.edu.utn.legaltech.contract_manager.model.Client;
import ar.edu.utn.legaltech.contract_manager.repository.ClientRepository;
import ar.edu.utn.legaltech.contract_manager.repository.ContractRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private ContractRepository contractRepository;

    @InjectMocks
    private ClientService clientService;

    private Client clientWithTaxId(String taxId) {
        Client client = new Client();
        client.setName("Cliente Test");
        client.setTaxId(taxId);
        return client;
    }

    @ParameterizedTest(name = "\"{0}\" -> \"{1}\"")
    @CsvSource({
            "1234567,        1234567",          // DNI de 7 dígitos
            "12345678,       12345678",         // DNI de 8 dígitos
            "12.345.678,     12345678",         // DNI con puntos
            "20123456789,    20-12345678-9",    // CUIT sin formato
            "20-12345678-9,  20-12345678-9",    // CUIT ya formateado
            "'20 12345678 9', 20-12345678-9"    // CUIT con espacios
    })
    void save_normalizesValidTaxId(String input, String expected) {
        when(clientRepository.save(any(Client.class))).thenAnswer(inv -> inv.getArgument(0));

        Client saved = clientService.save(clientWithTaxId(input));

        assertThat(saved.getTaxId()).isEqualTo(expected);
    }

    @Test
    void save_withNullTaxId_keepsItNull() {
        when(clientRepository.save(any(Client.class))).thenAnswer(inv -> inv.getArgument(0));

        Client saved = clientService.save(clientWithTaxId(null));

        assertThat(saved.getTaxId()).isNull();
    }

    @Test
    void save_withBlankTaxId_storesNull() {
        when(clientRepository.save(any(Client.class))).thenAnswer(inv -> inv.getArgument(0));

        Client saved = clientService.save(clientWithTaxId("   "));

        assertThat(saved.getTaxId()).isNull();
    }

    @ParameterizedTest(name = "\"{0}\" es inválido")
    @ValueSource(strings = {"abc12345", "123456", "123456789", "123456789012", "20-1234567A-9"})
    void save_withInvalidTaxId_throwsAndDoesNotPersist(String invalid) {
        assertThrows(InvalidTaxIdException.class,
                () -> clientService.save(clientWithTaxId(invalid)));

        verify(clientRepository, never()).save(any());
    }

    @Test
    void delete_whenClientHasContracts_throwsIllegalState() {
        Client client = clientWithTaxId("12345678");
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(contractRepository.existsByClient(client)).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> clientService.delete(1L));

        verify(clientRepository, never()).deleteById(any());
    }

    @Test
    void delete_whenClientHasNoContracts_deletesIt() {
        Client client = clientWithTaxId("12345678");
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(contractRepository.existsByClient(client)).thenReturn(false);

        clientService.delete(1L);

        verify(clientRepository).deleteById(1L);
    }
}