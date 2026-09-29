
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


CREATE DATABASE IF NOT EXISTS study_planner_db
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE study_planner_db;

DROP TABLE IF EXISTS tasks;

CREATE TABLE tasks (
    `task_id` INT(11) NOT NULL AUTO_INCREMENT,
    `subject` VARCHAR(100) NOT NULL,
    `task_title` VARCHAR(255) NOT NULL,
    `status` ENUM('Not Started', 'Completed') NOT NULL DEFAULT 'Not Started',
    `due_date` DATE NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id),
    KEY idx_due_date (due_date),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;