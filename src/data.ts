/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Produto, PedidoVenda } from './types';

export const PRODUTOS_PADRAO: Produto[] = [
  { id_produto: 1, nome_produto: 'Combo FLV Higienizado', preco: 25.90 },
  { id_produto: 2, nome_produto: 'Pote de Frutas Picadas', preco: 12.50 },
  { id_produto: 3, nome_produto: 'Suco Natural Detóx 500ml', preco: 8.00 }
];

export const PEDIDOS_PADRAO: PedidoVenda[] = [
  { id_venda: 1, id_produto: 1, quantidade_comprada: 10, data_venda: '2026-06-07' },
  { id_venda: 2, id_produto: 2, quantidade_comprada: 5, data_venda: '2026-06-07' },
  { id_venda: 3, id_produto: 3, quantidade_comprada: 20, data_venda: '2026-06-07' },
  { id_venda: 4, id_produto: 1, quantidade_comprada: 15, data_venda: '2026-06-08' },
  { id_venda: 5, id_produto: 2, quantidade_comprada: 15, data_venda: '2026-06-08' }
];

export const RAW_SQL_SCRIPT = `-- 1. CRIAÇÃO DO BANCO DE DADOS DE VENDAS
CREATE DATABASE IF NOT EXISTS db_sistema_vendas;
USE db_sistema_vendas;

-- 2. CRIAÇÃO DAS TABELAS
CREATE TABLE produtos (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome_produto VARCHAR(100) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL
);

CREATE TABLE pedidos_vendas (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT,
    quantidade_comprada INT NOT NULL,
    data_venda DATE NOT NULL, -- Foco no levantamento diário
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
);

-- 3. INSERÇÃO DE DADOS DE TESTE
INSERT INTO produtos (nome_produto, preco) VALUES 
('Combo FLV Higienizado', 25.90),
('Pote de Frutas Picadas', 12.50),
('Suco Natural Detóx 500ml', 8.00);

-- Vendas simuladas em dias diferentes
INSERT INTO pedidos_vendas (id_produto, quantidade_comprada, data_venda) VALUES 
(1, 10, '2026-06-07'),
(2, 5,  '2026-06-07'),
(3, 20, '2026-06-07'), -- Total do dia 07/06
(1, 15, '2026-06-08'),
(2, 15, '2026-06-08'); -- Total do dia 08/06

-- 4. CRIAÇÃO DA PROCEDURE PARA O RELATÓRIO DIÁRIO
DELIMITER $$

CREATE PROCEDURE sp_relatorio_diario_compras()
BEGIN
    SELECT 
        p.data_venda AS 'Data da Venda',
        prod.nome_produto AS 'Produto',
        SUM(p.quantidade_comprada) AS 'Total de Unidades Compradas',
        SUM(p.quantidade_comprada * prod.preco) AS 'Faturamento Total (R$)'
    FROM pedidos_vendas p
    INNER JOIN produtos prod ON p.id_produto = prod.id_produto
    GROUP BY p.data_venda, prod.nome_produto
    ORDER BY p.data_venda DESC, SUM(p.quantidade_comprada) DESC;
END$$

DELIMITER ;

-- 5. COMO EXECUTAR A PROCEDURE
CALL sp_relatorio_diario_compras();`;
