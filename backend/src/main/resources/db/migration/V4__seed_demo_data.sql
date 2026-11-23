INSERT INTO clients (name, tax_id, email, phone) VALUES
                                                     ('Inmobiliaria del Sur S.A.', '30-11111111-1', 'contacto@inmobiliariadelsur.com', '11-4000-1000'),
                                                     ('Consultora Andina S.R.L.', '30-22222222-2', 'info@consultoraandina.com', '11-4000-2000'),
                                                     ('Logística Global S.A.', '30-33333333-3', 'ventas@logisticaglobal.com', '11-4000-3000'),
                                                     ('TecnoSoft Servicios IT', '30-44444444-4', 'admin@tecnosoft.com', '11-4000-4000');

INSERT INTO contracts (title, client_id, start_date, end_date, amount, status) VALUES
                                                                                   ('Alquiler de oficina central', 1, '2025-01-01', '2026-12-31', 250000.00, 'ACTIVE'),
                                                                                   ('Servicio de limpieza mensual', 1, '2025-06-01', '2026-10-10', 45000.00, 'EXPIRING_SOON'),
                                                                                   ('Consultoría estratégica anual', 2, '2025-03-01', '2026-03-01', 380000.00, 'EXPIRED'),
                                                                                   ('Auditoría de procesos', 2, '2026-09-01', '2027-06-30', 190000.00, 'ACTIVE'),
                                                                                   ('Transporte de mercadería', 3, '2025-01-01', '2026-10-05', 620000.00, 'EXPIRING_SOON'),
                                                                                   ('Mantenimiento de flota', 3, '2026-01-01', '2027-01-01', 310000.00, 'ACTIVE'),
                                                                                   ('Licencia de software ERP', 4, '2025-05-01', '2026-11-15', 450000.00, 'ACTIVE'),
                                                                                   ('Soporte técnico trimestral', 4, '2025-01-01', '2025-12-31', 90000.00, 'UNDER_RENEWAL'),
                                                                                   ('Borrador de renovación 2027', 4, '2027-01-01', '2027-12-31', 450000.00, 'DRAFT');