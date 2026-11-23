package ar.edu.utn.legaltech.contract_manager.exception;

public class InvalidTaxIdException extends RuntimeException {
    public InvalidTaxIdException(String message) {
        super(message);
    }
}