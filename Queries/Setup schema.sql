-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema flexben
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema flexben
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `flexben` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `flexben` ;

-- -----------------------------------------------------
-- Table `flexben`.`accounts`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `flexben`.`accounts` ;

CREATE TABLE IF NOT EXISTS `flexben`.`accounts` (
  `account_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` SMALLINT UNSIGNED NULL DEFAULT NULL,
  `password` VARCHAR(255) NULL DEFAULT NULL,
  `is_active` CHAR(1) NULL DEFAULT 'Y',
  `date_updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`account_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `flexben`.`categories`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `flexben`.`categories` ;

CREATE TABLE IF NOT EXISTS `flexben`.`categories` (
  `category_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(255) NULL DEFAULT NULL,
  `name` VARCHAR(255) NULL DEFAULT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `date_added` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `added_by` VARCHAR(255) NULL DEFAULT 'SYSTEM',
  `updated_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` VARCHAR(255) NULL DEFAULT 'SYSTEM',
  PRIMARY KEY (`category_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 19
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `flexben`.`companies`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `flexben`.`companies` ;

CREATE TABLE IF NOT EXISTS `flexben`.`companies` (
  `company_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(255) NULL DEFAULT NULL,
  `name` VARCHAR(255) NULL DEFAULT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `logo` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`company_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `flexben`.`employees`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `flexben`.`employees` ;

CREATE TABLE IF NOT EXISTS `flexben`.`employees` (
  `employee_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_number` MEDIUMINT UNSIGNED NULL DEFAULT NULL,
  `firstname` VARCHAR(255) NULL DEFAULT NULL,
  `lastname` VARCHAR(255) NULL DEFAULT NULL,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `is_active` CHAR(1) NULL DEFAULT NULL,
  `date_added` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `company_id` SMALLINT UNSIGNED NULL DEFAULT NULL,
  `role_id` SMALLINT UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`employee_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 71
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `flexben`.`flex_cycle_cutoffs`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `flexben`.`flex_cycle_cutoffs` ;

CREATE TABLE IF NOT EXISTS `flexben`.`flex_cycle_cutoffs` (
  `flex_cutoff_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `start_date` DATE NULL DEFAULT NULL,
  `end_date` DATE NULL DEFAULT NULL,
  `is_active` CHAR(1) NULL DEFAULT NULL,
  `flex_cycle_id` SMALLINT UNSIGNED NULL DEFAULT NULL,
  `cut_off_cap_amount` MEDIUMINT UNSIGNED NULL DEFAULT NULL,
  `cut_off_description` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`flex_cutoff_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `flexben`.`flex_reimbursement`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `flexben`.`flex_reimbursement` ;

CREATE TABLE IF NOT EXISTS `flexben`.`flex_reimbursement` (
  `flex_reimbursement_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` MEDIUMINT UNSIGNED NULL DEFAULT NULL,
  `flex_cut_off_id` SMALLINT UNSIGNED NULL DEFAULT NULL,
  `total_reimbursement_amount` MEDIUMINT UNSIGNED NULL DEFAULT '0',
  `date_submitted` DATE NULL DEFAULT NULL,
  `status` VARCHAR(255) NULL DEFAULT 'Draft',
  `date_updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `transaction_number` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`flex_reimbursement_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `flexben`.`flex_reimbursement_details`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `flexben`.`flex_reimbursement_details` ;

CREATE TABLE IF NOT EXISTS `flexben`.`flex_reimbursement_details` (
  `flex_reimbursement_detail_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `flex_reimbursement_id` SMALLINT UNSIGNED NOT NULL,
  `or_number` VARCHAR(255) NOT NULL,
  `name_of_establishment` VARCHAR(255) NOT NULL,
  `tin_of_establishment` VARCHAR(255) NOT NULL,
  `amount` MEDIUMINT UNSIGNED NOT NULL,
  `category_id` SMALLINT UNSIGNED NOT NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'Draft',
  `date_added` DATE NOT NULL,
  `deleted` CHAR(1) NULL DEFAULT 'n',
  PRIMARY KEY (`flex_reimbursement_detail_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `flexben`.`roles`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `flexben`.`roles` ;

CREATE TABLE IF NOT EXISTS `flexben`.`roles` (
  `role_id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NULL DEFAULT NULL,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`role_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb3;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
