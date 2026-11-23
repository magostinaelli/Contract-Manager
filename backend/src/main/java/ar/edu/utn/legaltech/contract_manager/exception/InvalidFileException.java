package ar.edu.utn.legaltech.contract_manager.exception;

public class InvalidFileException extends RuntimeException {
    public InvalidFileException(String message) {
        super(message);
    }
}