-- Migración para Insertar Tarifas de Habitaciones
-- Hotel Colina Campestre
-- Fecha: 2026-01-29

-- Eliminar registros existentes en room_rates (si existen)
DELETE FROM room_rates;

-- INSERTAR TARIFAS - CATEGORÍA HOTEL
-- =====================================

-- Habitaciones HOTEL con capacidades corregidas según camas dobles = 2 personas
INSERT INTO room_rates (room_id, person_count, rate) VALUES
-- Habitación 102: 1 doble + 0 sencillas = 2 personas capacidad máxima
('01473020-5230-46a4-83b0-c277aa67cd10', 1, 80000),
('01473020-5230-46a4-83b0-c277aa67cd10', 2, 100000),
-- Habitación 103: 1 doble + 0 sencillas = 2 personas capacidad máxima
('4b458e52-0569-4ba5-8b92-f9cf77a01397', 1, 80000),
('4b458e52-0569-4ba5-8b92-f9cf77a01397', 2, 100000),
-- Habitación 104: 1 doble + 0 sencillas = 2 personas capacidad máxima
('ce00fed2-904c-4387-b8cf-787d57556e24', 1, 80000),
('ce00fed2-904c-4387-b8cf-787d57556e24', 2, 100000),
-- Habitación 105: 1 doble + 0 sencillas = 2 personas capacidad máxima
('d0674725-e8a2-4873-9493-8f792d2fc7ef', 1, 80000),
('d0674725-e8a2-4873-9493-8f792d2fc7ef', 2, 100000),
-- Habitación 106: 1 doble + 0 sencillas = 2 personas capacidad máxima
('2eb6cfa2-7c63-4fce-bc45-bbb077e22254', 1, 80000),
('2eb6cfa2-7c63-4fce-bc45-bbb077e22254', 2, 100000),
-- Habitación 107: 1 doble + 0 sencillas = 2 personas capacidad máxima
('1f021c32-149e-4805-8067-fb36a32f8348', 1, 80000),
('1f021c32-149e-4805-8067-fb36a32f8348', 2, 100000),
-- Habitación 108: 1 doble + 0 sencillas = 2 personas capacidad máxima
('e072a9f2-2d39-4617-a003-b5b93dea7f9d', 1, 80000),
('e072a9f2-2d39-4617-a003-b5b93dea7f9d', 2, 100000),
-- Habitación 109: 1 doble + 0 sencillas = 2 personas capacidad máxima
('dc2dea84-2826-451f-81d4-bc80237914ed', 1, 80000),
('dc2dea84-2826-451f-81d4-bc80237914ed', 2, 100000),
-- Habitación 110: 1 doble + 0 sencillas = 2 personas capacidad máxima
('c63e6bad-71f2-44cc-88f4-e641106a70b5', 1, 80000),
('c63e6bad-71f2-44cc-88f4-e641106a70b5', 2, 100000),
-- Habitación 111: 1 doble + 0 sencillas = 2 personas capacidad máxima
('71f89d31-f228-4065-b05d-c466c0108a6b', 1, 80000),
('71f89d31-f228-4065-b05d-c466c0108a6b', 2, 100000),
-- Habitación 112: 1 doble + 0 sencillas = 2 personas capacidad máxima
('c323b378-4502-43ee-9255-0c83802fab8a', 1, 80000),
('c323b378-4502-43ee-9255-0c83802fab8a', 2, 100000),
-- Habitación 113: 1 doble + 0 sencillas = 2 personas capacidad máxima
('ab6627f1-de12-4d90-8f38-f4e5e9bfabe6', 1, 80000),
('ab6627f1-de12-4d90-8f38-f4e5e9bfabe6', 2, 100000),
-- Habitación 114: 1 doble + 0 sencillas = 2 personas capacidad máxima
('7bebd012-cf7e-4518-9c09-02d0f1e8b4e6', 1, 80000),
('7bebd012-cf7e-4518-9c09-02d0f1e8b4e6', 2, 100000),
-- Habitación 115: 0 dobles + 1 sencilla = capacidad hasta 2 personas
('a18ec673-e60b-40c8-88eb-1d4a5dc5ccd6', 1, 80000),
('a18ec673-e60b-40c8-88eb-1d4a5dc5ccd6', 2, 100000),
-- Habitación 116: 1 doble = capacidad hasta 2 personas
('b1f2e5c5-71c7-4091-b038-374aee2fcc62', 1, 80000),
('b1f2e5c5-71c7-4091-b038-374aee2fcc62', 2, 100000),
-- Habitación 117: 0 dobles + 2 sencillas = capacidad hasta 2 personas
('d8b82d18-b8d1-4f37-bdae-84184392ecfa', 1, 80000),
('d8b82d18-b8d1-4f37-bdae-84184392ecfa', 2, 100000),
-- Habitación 118: 1 doble = capacidad hasta 2 personas
('d3be2a72-a644-4cc5-bac8-5e0d92f3dac7', 1, 80000),
-- Habitación 119: 1 doble = capacidad hasta 2 personas
('310f2012-a19e-4faa-95dd-b52e7dc6aa44', 1, 80000),
-- Habitación 120: 0 dobles + 4 sencillas = capacidad hasta 4 personas
('17fc0429-62ed-4e8e-acdb-f7649071b6e7', 1, 80000),
('17fc0429-62ed-4e8e-acdb-f7649071b6e7', 2, 90000),
('17fc0429-62ed-4e8e-acdb-f7649071b6e7', 3, 100000),
('17fc0429-62ed-4e8e-acdb-f7649071b6e7', 4, 110000),
-- Habitación 121: 1 doble + 1 sencilla = capacidad hasta 3 personas (solo hay tarifas para 3)
('33f06914-5962-4390-89cd-839551ba3534', 1, 80000),
('33f06914-5962-4390-89cd-839551ba3534', 2, 90000),
('33f06914-5962-4390-89cd-839551ba3534', 3, 100000),

-- BLOCK HOTEL - PISO 2
-- Habitación 201: 0 dobles + 2 sencillas = 2 personas capacidad máxima
('c0ddefb0-4ec4-4ca3-a3cd-c100d0f9794f', 1, 80000),
('c0ddefb0-4ec4-4ca3-a3cd-c100d0f9794f', 2, 100000),
-- Habitación 202: 1 doble + 1 sencilla = 3 personas capacidad máxima (1×2 + 1×1 = 3)
('6a8040cd-3b40-448f-a090-9cdde675a611', 1, 80000),
('6a8040cd-3b40-448f-a090-9cdde675a611', 2, 100000),
('6a8040cd-3b40-448f-a090-9cdde675a611', 3, 110000),
-- Habitación 203: 1 doble + 0 sencillas = 2 personas capacidad máxima
('66f53ecc-d5d2-4731-a85f-24dd88d84de2', 1, 80000),
('66f53ecc-d5d2-4731-a85f-24dd88d84de2', 2, 100000),
-- Habitación 204: 1 doble + 0 sencillas = 2 personas capacidad máxima
('66e8a381-4fa5-4ee7-b35e-76af20b14431', 1, 80000),
('66e8a381-4fa5-4ee7-b35e-76af20b14431', 2, 100000),
-- Habitación 205: 0 dobles + 2 sencillas = 2 personas capacidad máxima
('a4e726f6-3ecf-4842-99af-e3e82b76719b', 1, 80000),
('a4e726f6-3ecf-4842-99af-e3e82b76719b', 2, 100000),
-- Habitación 206: 0 dobles + 2 sencillas = 2 personas capacidad máxima
('0a008efd-5afd-4f81-b8c4-e646f5bf67dc', 1, 80000),
('0a008efd-5afd-4f81-b8c4-e646f5bf67dc', 2, 100000),
-- Habitación 207: 1 doble + 0 sencillas = 2 personas capacidad máxima
('05ef10dd-954f-48b7-9287-6d24bf04ba23', 1, 80000),
('05ef10dd-954f-48b7-9287-6d24bf04ba23', 2, 100000),
-- Habitación 208: 1 doble + 1 sencilla = capacidad hasta 3 personas
('ab1476fc-f213-43aa-888f-6ef4e0160b04', 1, 80000),
('ab1476fc-f213-43aa-888f-6ef4e0160b04', 2, 100000),
('ab1476fc-f213-43aa-888f-6ef4e0160b04', 3, 110000),
('ab1476fc-f213-43aa-888f-6ef4e0160b04', 4, 120000),
-- Habitación 209: 1 doble + 2 sencillas = 4 personas capacidad máxima (1×2 + 2×1 = 4)
('fd000275-c0b2-41bf-8055-85cb0f28994c', 1, 80000),
('fd000275-c0b2-41bf-8055-85cb0f28994c', 2, 100000),
('fd000275-c0b2-41bf-8055-85cb0f28994c', 3, 110000),
('fd000275-c0b2-41bf-8055-85cb0f28994c', 4, 120000),
-- Habitación 210: 1 doble + 1 sencilla = 3 personas capacidad máxima (1×2 + 1×1 = 3)
('05e3d87d-6ef9-4c8d-887b-209bc3e53aec', 1, 80000),
('05e3d87d-6ef9-4c8d-887b-209bc3e53aec', 2, 100000),
('05e3d87d-6ef9-4c8d-887b-209bc3e53aec', 3, 110000),
-- Habitación 211: 1 doble + 1 sencilla = 3 personas capacidad máxima (1×2 + 1×1 = 3)
('ba923d2a-c746-42d6-98e1-74454e3a0175', 1, 80000),
('ba923d2a-c746-42d6-98e1-74454e3a0175', 2, 100000),
('ba923d2a-c746-42d6-98e1-74454e3a0175', 3, 110000),
-- Habitación 212: 1 doble + 2 sencillas = 4 personas capacidad máxima (1×2 + 2×1 = 4)
('8a5159ea-befb-4405-b363-28d21f0c337f', 1, 80000),
('8a5159ea-befb-4405-b363-28d21f0c337f', 2, 100000),
('8a5159ea-befb-4405-b363-28d21f0c337f', 3, 110000),
('8a5159ea-befb-4405-b363-28d21f0c337f', 4, 120000),
-- Habitación 213: 1 doble = capacidad hasta 2 personas
('012ffea8-3dc1-4487-a11b-f67a0da5e7b3', 1, 80000),
('012ffea8-3dc1-4487-a11b-f67a0da5e7b3', 2, 100000),
-- Habitación 214: 1 doble = capacidad hasta 2 personas
('0ef8caa0-7b43-49ea-adc8-2cec9351e95d', 1, 80000),
('0ef8caa0-7b43-49ea-adc8-2cec9351e95d', 2, 100000),
-- Habitación 215: 1 doble = capacidad hasta 2 personas
('e02e20e0-4cf2-47cb-adbc-1f61a6c14f9c', 1, 80000),
('e02e20e0-4cf2-47cb-adbc-1f61a6c14f9c', 2, 100000),
-- Habitación 216: 1 doble = capacidad hasta 2 personas
('37123f1f-9887-400b-ad42-3354341f292c', 1, 80000),
('37123f1f-9887-400b-ad42-3354341f292c', 2, 100000),
-- Habitación 217: 1 doble = capacidad hasta 2 personas
('f75f8480-74a3-4cbe-9a7a-05e5abef6226', 1, 80000),
('f75f8480-74a3-4cbe-9a7a-05e5abef6226', 2, 100000),
-- Habitación 218: 1 doble = capacidad hasta 2 personas
('06aaf0ae-ed3b-46b0-88ff-96cf587ba82b', 1, 80000),
('06aaf0ae-ed3b-46b0-88ff-96cf587ba82b', 2, 100000),
-- Habitación 219: 1 doble = capacidad hasta 2 personas
('4702add9-b718-47b3-b692-7f5a96bbde0a', 1, 80000),
('4702add9-b718-47b3-b692-7f5a96bbde0a', 2, 100000),
-- Habitación 220: 1 doble = capacidad hasta 2 personas
('710d52e0-e5b9-457d-8e3f-27bd294fefbf', 1, 80000),
('710d52e0-e5b9-457d-8e3f-27bd294fefbf', 2, 100000),
-- Habitación 221: 1 doble = capacidad hasta 2 personas
('574d0f6e-044d-4cdc-8dba-7065cb5d0465', 1, 80000),
('574d0f6e-044d-4cdc-8dba-7065cb5d0465', 2, 100000),
-- Habitación 222: 1 doble = capacidad hasta 2 personas
('dddfdc64-fb50-4771-8476-a0bc47ea1367', 1, 80000),
('dddfdc64-fb50-4771-8476-a0bc47ea1367', 2, 100000),
-- Habitación 223: 1 doble = capacidad hasta 2 personas
('ff06d63e-9be6-402f-ac67-cd9da3e537cb', 1, 80000),
('ff06d63e-9be6-402f-ac67-cd9da3e537cb', 2, 100000),
-- Habitación 224: 1 doble = capacidad hasta 2 personas
('1bc5cb18-6a23-4065-b6ad-3f2d20c134ae', 1, 80000),
('1bc5cb18-6a23-4065-b6ad-3f2d20c134ae', 2, 100000),
-- Habitación 225: 1 doble = capacidad hasta 2 personas
('ca431477-bd5b-4769-8e61-c78834248541', 1, 80000),
('ca431477-bd5b-4769-8e61-c78834248541', 2, 100000),
-- Habitación 226: 1 doble = capacidad hasta 2 personas
('8d4d1e9d-8f7f-459e-b1b7-dce498aee21f', 1, 80000),
('8d4d1e9d-8f7f-459e-b1b7-dce498aee21f', 2, 100000),
-- Habitación 227: 1 doble = capacidad hasta 2 personas
('82488204-cf4d-4598-a762-ed9fc8f479e6', 1, 80000),
('82488204-cf4d-4598-a762-ed9fc8f479e6', 2, 100000),
-- Habitación 228: 0 dobles + 4 sencillas = capacidad hasta 4 personas
('3b048b7c-3c8e-4545-9d4f-1930aaf6aa76', 1, 80000),
('3b048b7c-3c8e-4545-9d4f-1930aaf6aa76', 2, 100000),
('3b048b7c-3c8e-4545-9d4f-1930aaf6aa76', 3, 110000),
('3b048b7c-3c8e-4545-9d4f-1930aaf6aa76', 4, 120000),
-- Habitación 229: 1 doble + 2 sencillas = 4 personas capacidad máxima (1×2 + 2×1 = 4)
('99676bc3-1a48-4236-b4d7-911c54cfd0c0', 1, 80000),
('99676bc3-1a48-4236-b4d7-911c54cfd0c0', 2, 100000),
('99676bc3-1a48-4236-b4d7-911c54cfd0c0', 3, 110000),
('99676bc3-1a48-4236-b4d7-911c54cfd0c0', 4, 120000);

-- INSERTAR TARIFAS - CATEGORÍA APARTAMENTO
-- ========================================
-- Todas las habitaciones de apartamento con tarifas para 1-4 personas

INSERT INTO room_rates (room_id, person_count, rate) VALUES
-- Apartamento 201
('585cdbc7-9403-4561-9b8b-215b18b9130b', 1, 90000),
('585cdbc7-9403-4561-9b8b-215b18b9130b', 2, 115000),
('585cdbc7-9403-4561-9b8b-215b18b9130b', 3, 130000),
('585cdbc7-9403-4561-9b8b-215b18b9130b', 4, 140000),

-- Apartamento 202 (A-202)
('f51567be-0fe9-4c1c-ad32-a8822b46a774', 1, 90000),
('f51567be-0fe9-4c1c-ad32-a8822b46a774', 2, 115000),
('f51567be-0fe9-4c1c-ad32-a8822b46a774', 3, 130000),
('f51567be-0fe9-4c1c-ad32-a8822b46a774', 4, 140000),

-- Apartamento 203
('51020dc0-b9fa-4c6e-8eed-3d67d2da01ae', 1, 90000),
('51020dc0-b9fa-4c6e-8eed-3d67d2da01ae', 2, 115000),
('51020dc0-b9fa-4c6e-8eed-3d67d2da01ae', 3, 130000),
('51020dc0-b9fa-4c6e-8eed-3d67d2da01ae', 4, 140000),

-- Apartamento 204
('bebc4ce1-9869-4f69-b3fe-4e8e887582e1', 1, 90000),
('bebc4ce1-9869-4f69-b3fe-4e8e887582e1', 2, 115000),
('bebc4ce1-9869-4f69-b3fe-4e8e887582e1', 3, 130000),
('bebc4ce1-9869-4f69-b3fe-4e8e887582e1', 4, 140000),

-- Apartamento 301
('c808c06f-61a7-4689-96c0-5d782f7bdcb1', 1, 90000),
('c808c06f-61a7-4689-96c0-5d782f7bdcb1', 2, 115000),
('c808c06f-61a7-4689-96c0-5d782f7bdcb1', 3, 130000),
('c808c06f-61a7-4689-96c0-5d782f7bdcb1', 4, 140000),

-- Apartamento 302
('59e3a6fd-d4f1-4a21-85a0-9b3649550e03', 1, 90000),
('59e3a6fd-d4f1-4a21-85a0-9b3649550e03', 2, 115000),
('59e3a6fd-d4f1-4a21-85a0-9b3649550e03', 3, 130000),
('59e3a6fd-d4f1-4a21-85a0-9b3649550e03', 4, 140000),

-- Apartamento 303
('ffac4ad6-c133-41d8-864e-39655db0ced4', 1, 90000),
('ffac4ad6-c133-41d8-864e-39655db0ced4', 2, 115000),
('ffac4ad6-c133-41d8-864e-39655db0ced4', 3, 130000),
('ffac4ad6-c133-41d8-864e-39655db0ced4', 4, 140000),

-- Apartamento 304
('51b269ee-5de3-4542-bb9b-3afbbbb7ede5', 1, 90000),
('51b269ee-5de3-4542-bb9b-3afbbbb7ede5', 2, 115000),
('51b269ee-5de3-4542-bb9b-3afbbbb7ede5', 3, 130000),
('51b269ee-5de3-4542-bb9b-3afbbbb7ede5', 4, 140000);

-- INSERTAR TARIFAS - CATEGORÍA CASA 1
-- ===================================
-- Todas las habitaciones con tarifas fijas para 1-4 personas

INSERT INTO room_rates (room_id, person_count, rate) VALUES
-- Casa 1 - HAB 1
('93219e79-efc2-4ded-984c-442f6ad779eb', 1, 85000),
('93219e79-efc2-4ded-984c-442f6ad779eb', 2, 95000),
('93219e79-efc2-4ded-984c-442f6ad779eb', 3, 105000),
('93219e79-efc2-4ded-984c-442f6ad779eb', 4, 125000),

-- Casa 1 - HAB 2
('f7c4c71b-6980-4b2c-92a7-0f8039a3d435', 1, 85000),
('f7c4c71b-6980-4b2c-92a7-0f8039a3d435', 2, 95000),
('f7c4c71b-6980-4b2c-92a7-0f8039a3d435', 3, 105000),
('f7c4c71b-6980-4b2c-92a7-0f8039a3d435', 4, 125000),

-- Casa 1 - HAB 3
('9299a188-2613-4b79-ad8c-6e2bff0e530d', 1, 85000),
('9299a188-2613-4b79-ad8c-6e2bff0e530d', 2, 95000),
('9299a188-2613-4b79-ad8c-6e2bff0e530d', 3, 105000),
('9299a188-2613-4b79-ad8c-6e2bff0e530d', 4, 125000),

-- Casa 1 - HAB 4
('7b54eb40-7341-4961-b0c5-e14789da9269', 1, 85000),
('7b54eb40-7341-4961-b0c5-e14789da9269', 2, 95000),
('7b54eb40-7341-4961-b0c5-e14789da9269', 3, 105000),
('7b54eb40-7341-4961-b0c5-e14789da9269', 4, 125000),

-- Casa 1 - HAB 5
('8e5cbd57-df48-4306-ba17-a69d5f114311', 1, 85000),
('8e5cbd57-df48-4306-ba17-a69d5f114311', 2, 95000),
('8e5cbd57-df48-4306-ba17-a69d5f114311', 3, 105000),
('8e5cbd57-df48-4306-ba17-a69d5f114311', 4, 125000),

-- Casa 1 - HAB 6
('4802f766-5759-463b-b73a-0c0e3e9fa3db', 1, 85000),
('4802f766-5759-463b-b73a-0c0e3e9fa3db', 2, 95000),
('4802f766-5759-463b-b73a-0c0e3e9fa3db', 3, 105000),
('4802f766-5759-463b-b73a-0c0e3e9fa3db', 4, 125000);

-- INSERTAR TARIFAS - CATEGORÍA CASA 2
-- ===================================
-- Todas las habitaciones con tarifas fijas para 1-4 personas

INSERT INTO room_rates (room_id, person_count, rate) VALUES
-- Casa 2 - HAB 1
('77a76cfa-030c-4041-be52-886314a1abb7', 1, 85000),
('77a76cfa-030c-4041-be52-886314a1abb7', 2, 95000),
('77a76cfa-030c-4041-be52-886314a1abb7', 3, 105000),
('77a76cfa-030c-4041-be52-886314a1abb7', 4, 125000),

-- Casa 2 - HAB 2
('15a8c76f-f0fa-464a-b909-be97d5b96399', 1, 85000),
('15a8c76f-f0fa-464a-b909-be97d5b96399', 2, 95000),
('15a8c76f-f0fa-464a-b909-be97d5b96399', 3, 105000),
('15a8c76f-f0fa-464a-b909-be97d5b96399', 4, 125000),

-- Casa 2 - HAB 3
('7ea42215-7199-47ce-a3b4-afc3d79217da', 1, 85000),
('7ea42215-7199-47ce-a3b4-afc3d79217da', 2, 95000),
('7ea42215-7199-47ce-a3b4-afc3d79217da', 3, 105000),
('7ea42215-7199-47ce-a3b4-afc3d79217da', 4, 125000),

-- Casa 2 - HAB 4
('8a83f262-0112-4069-8547-7366aaf980da', 1, 85000),
('8a83f262-0112-4069-8547-7366aaf980da', 2, 95000),
('8a83f262-0112-4069-8547-7366aaf980da', 3, 105000),
('8a83f262-0112-4069-8547-7366aaf980da', 4, 125000),

-- Casa 2 - HAB 5
('66b66f3f-8d29-405e-90b1-2ef759b8317b', 1, 85000),
('66b66f3f-8d29-405e-90b1-2ef759b8317b', 2, 95000),
('66b66f3f-8d29-405e-90b1-2ef759b8317b', 3, 105000),
('66b66f3f-8d29-405e-90b1-2ef759b8317b', 4, 125000);

-- VALIDACIÓN FINAL
-- ================

-- Verificar totales insertados
SELECT COUNT(*) as total_registros_insertados FROM room_rates;

-- Verificar distribución por categoría
SELECT r.category, COUNT(DISTINCT rr.room_id) as habitaciones_con_tarifas, COUNT(*) as total_tarifas
FROM room_rates rr
JOIN rooms r ON rr.room_id = r.id
GROUP BY r.category
ORDER BY r.category;

-- Verificar tarifas por habitación con capacidades
SELECT 
    r.room_number, 
    r.category,
    r.beds_double,
    r.beds_single,
    r.beds_double*2 + r.beds_single as capacidad_maxima,
    COUNT(rr.person_count) as tarifas_configuradas,
    MAX(rr.person_count) as tarifa_maxima_configurada
FROM rooms r
LEFT JOIN room_rates rr ON r.id = rr.room_id
WHERE r.category = 'Hotel'
GROUP BY r.room_number, r.category, r.beds_double, r.beds_single
ORDER BY r.room_number;