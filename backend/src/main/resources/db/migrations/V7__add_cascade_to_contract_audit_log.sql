ALTER TABLE contract_audit_log
DROP CONSTRAINT contract_audit_log_contract_id_fkey;

ALTER TABLE contract_audit_log
    ADD CONSTRAINT contract_audit_log_contract_id_fkey
        FOREIGN KEY (contract_id)
            REFERENCES contracts(id)
            ON DELETE CASCADE;