-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: clinica_odonto
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `atendimento`
--

DROP TABLE IF EXISTS `atendimento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atendimento` (
  `idAtendimento` int unsigned NOT NULL AUTO_INCREMENT,
  `observacao` text,
  `data` date NOT NULL,
  `valorTotal` decimal(10,2) unsigned NOT NULL,
  `tipoAtendimento` enum('ORTODÔNTICO','CLÍNICO') NOT NULL,
  `parcelas` int unsigned DEFAULT NULL,
  `fk_CPF_Paciente` varchar(11) DEFAULT NULL,
  `fk_CPF_Secretaria` varchar(11) DEFAULT NULL,
  PRIMARY KEY (`idAtendimento`),
  KEY `FK_Atendimento_2` (`fk_CPF_Paciente`),
  KEY `FK_Atendimento_3` (`fk_CPF_Secretaria`),
  CONSTRAINT `FK_Atendimento_2` FOREIGN KEY (`fk_CPF_Paciente`) REFERENCES `paciente` (`CPF_Paciente`),
  CONSTRAINT `FK_Atendimento_3` FOREIGN KEY (`fk_CPF_Secretaria`) REFERENCES `secretaria` (`CPF_Secretaria`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dentista`
--

DROP TABLE IF EXISTS `dentista`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dentista` (
  `CPF_Dentista` varchar(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `CRO` char(8) NOT NULL,
  `croUF` enum('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO') NOT NULL,
  `especialidade` varchar(100) NOT NULL,
  PRIMARY KEY (`CPF_Dentista`),
  UNIQUE KEY `CRO` (`CRO`),
  KEY `idx_CRO` (`CRO`),
  KEY `idx_nome_dentista` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `itematendimento`
--

DROP TABLE IF EXISTS `itematendimento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itematendimento` (
  `qtd` int unsigned NOT NULL,
  `valorUnit` decimal(10,2) unsigned NOT NULL,
  `descontoItem` decimal(10,2) unsigned DEFAULT NULL,
  `comissaoDentista` decimal(10,2) unsigned NOT NULL,
  `CPF_Dentista` varchar(11) DEFAULT NULL,
  `fk_idProcedimento` int unsigned NOT NULL,
  `fk_idAtendimento` int unsigned NOT NULL,
  PRIMARY KEY (`fk_idProcedimento`,`fk_idAtendimento`),
  KEY `FK__ItemAtendimento_1` (`CPF_Dentista`),
  KEY `FK__ItemAtendimento_3` (`fk_idAtendimento`),
  CONSTRAINT `FK__ItemAtendimento_1` FOREIGN KEY (`CPF_Dentista`) REFERENCES `dentista` (`CPF_Dentista`),
  CONSTRAINT `FK__ItemAtendimento_2` FOREIGN KEY (`fk_idProcedimento`) REFERENCES `procedimento` (`idProcedimento`),
  CONSTRAINT `FK__ItemAtendimento_3` FOREIGN KEY (`fk_idAtendimento`) REFERENCES `atendimento` (`idAtendimento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `paciente`
--

DROP TABLE IF EXISTS `paciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paciente` (
  `CPF_Paciente` varchar(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `CEP` varchar(8) NOT NULL,
  `numero` int unsigned NOT NULL,
  `bairro` varchar(100) NOT NULL,
  `logradouro` varchar(100) NOT NULL,
  `cidade` varchar(100) NOT NULL,
  `UF` enum('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO') NOT NULL,
  PRIMARY KEY (`CPF_Paciente`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pagamento`
--

DROP TABLE IF EXISTS `pagamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagamento` (
  `idPagamento` int unsigned NOT NULL AUTO_INCREMENT,
  `dataRecebimento` date NOT NULL,
  `valorBruto` decimal(10,2) unsigned NOT NULL,
  `taxaCartao` decimal(4,2) unsigned NOT NULL DEFAULT '0.00',
  `valorLiquido` decimal(10,2) unsigned NOT NULL,
  `formaPagamento` enum('CRÉDITO','DÉBITO','PIX','DINHEIRO') NOT NULL,
  `fk_dAtendimento` int unsigned NOT NULL,
  PRIMARY KEY (`idPagamento`,`fk_dAtendimento`),
  KEY `FK_Pagamento_2` (`fk_dAtendimento`),
  CONSTRAINT `FK_Pagamento_2` FOREIGN KEY (`fk_dAtendimento`) REFERENCES `atendimento` (`idAtendimento`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `procedimento`
--

DROP TABLE IF EXISTS `procedimento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `procedimento` (
  `idProcedimento` int unsigned NOT NULL AUTO_INCREMENT,
  `descricao` text,
  `tipoProcedimento` enum('ORTODÔNTICO','CLÍNICO') NOT NULL,
  `nome` varchar(100) NOT NULL,
  PRIMARY KEY (`idProcedimento`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `secretaria`
--

DROP TABLE IF EXISTS `secretaria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `secretaria` (
  `CPF_Secretaria` varchar(11) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`CPF_Secretaria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `telefone`
--

DROP TABLE IF EXISTS `telefone`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `telefone` (
  `telefone` varchar(15) NOT NULL,
  `CPF_Paciente` varchar(11) NOT NULL,
  PRIMARY KEY (`telefone`,`CPF_Paciente`),
  KEY `FK_telefone_2` (`CPF_Paciente`),
  CONSTRAINT `FK_telefone_2` FOREIGN KEY (`CPF_Paciente`) REFERENCES `paciente` (`CPF_Paciente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-15 21:49:20
