ALTER TABLE clients
    ADD COLUMN phone_country_code VARCHAR(5),
    ADD COLUMN phone_number VARCHAR(20);

UPDATE clients
SET
    phone_country_code = '+54',
    phone_number = REPLACE(phone, '-', '')
WHERE phone IS NOT NULL;

ALTER TABLE clients
DROP COLUMN phone;