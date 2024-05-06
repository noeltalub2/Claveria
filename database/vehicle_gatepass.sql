-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 30, 2024 at 09:10 AM
-- Server version: 10.4.25-MariaDB
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vehicle_gatepass`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `username` varchar(60) NOT NULL,
  `password` varchar(60) NOT NULL,
  `phoneNumber` varchar(60) NOT NULL,
  `joinDate` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `username`, `password`, `phoneNumber`, `joinDate`) VALUES
(1, 'mmsu_admin', '$2a$12$06atVmBg8b.A49hvQzxoseuOHnNbRQEYCuKTsibeUmNiJDEs4qQii', '0912341223', '2024-04-21 17:49:45');

-- --------------------------------------------------------

--
-- Table structure for table `gate`
--

CREATE TABLE `gate` (
  `id` int(11) NOT NULL,
  `gateName` varchar(60) NOT NULL,
  `location` varchar(60) NOT NULL,
  `status` varchar(60) NOT NULL,
  `type` varchar(45) NOT NULL,
  `dateAdded` datetime NOT NULL DEFAULT current_timestamp(),
  `dateModified` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `gate-access`
--

CREATE TABLE `gate-access` (
  `id` int(11) NOT NULL,
  `gateId` int(11) NOT NULL,
  `name` varchar(45) NOT NULL,
  `username` varchar(45) NOT NULL,
  `password` varchar(60) NOT NULL,
  `dateAdded` datetime NOT NULL DEFAULT current_timestamp(),
  `dateModified` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `gatepass`
--

CREATE TABLE `gatepass` (
  `id` int(11) NOT NULL,
  `userUuid` varchar(60) NOT NULL,
  `rfidTagCode` varchar(20) NOT NULL,
  `entryGate` int(45) DEFAULT NULL,
  `entryTime` varchar(45) DEFAULT NULL,
  `exitGate` int(45) DEFAULT NULL,
  `exitTime` varchar(45) DEFAULT NULL,
  `logDate` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `gatepass_logs`
--

CREATE TABLE `gatepass_logs` (
  `id` int(11) NOT NULL,
  `userId` varchar(45) NOT NULL,
  `rfidTagCode` varchar(45) NOT NULL,
  `gatepassStatus` varchar(45) NOT NULL,
  `logDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `rfidcards`
--

CREATE TABLE `rfidcards` (
  `id` int(11) NOT NULL,
  `cardnumber` varchar(20) DEFAULT NULL,
  `userUuid` varchar(45) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `dateAdded` datetime NOT NULL DEFAULT current_timestamp(),
  `dateModified` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `uuid` varchar(50) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `middleName` varchar(255) DEFAULT NULL,
  `address` text NOT NULL,
  `phonenumber` varchar(15) NOT NULL,
  `username` varchar(45) NOT NULL,
  `password` varchar(60) NOT NULL,
  `profileUrl` varchar(60) DEFAULT NULL,
  `isVerified` tinyint(1) NOT NULL DEFAULT 0,
  `joinDate` datetime NOT NULL DEFAULT current_timestamp(),
  `dateModified` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_details`
--

CREATE TABLE `vehicle_details` (
  `id` int(11) NOT NULL,
  `usersId` varchar(50) NOT NULL,
  `officialReceiptNo` varchar(255) NOT NULL,
  `plateNumber` varchar(45) DEFAULT NULL,
  `driverlicense` varchar(60) NOT NULL,
  `certificateOfRegistration` varchar(255) NOT NULL,
  `vehicleDescription` varchar(45) NOT NULL,
  `dateAdded` datetime NOT NULL DEFAULT current_timestamp(),
  `dateModified` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `gate`
--
ALTER TABLE `gate`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `gate-access`
--
ALTER TABLE `gate-access`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `gateId` (`gateId`);

--
-- Indexes for table `gatepass`
--
ALTER TABLE `gatepass`
  ADD PRIMARY KEY (`id`),
  ADD KEY `entryGate` (`entryGate`),
  ADD KEY `exitGate` (`exitGate`),
  ADD KEY `userUuid` (`userUuid`),
  ADD KEY `rfidTagCode` (`rfidTagCode`);

--
-- Indexes for table `gatepass_logs`
--
ALTER TABLE `gatepass_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `rfidTagCode` (`rfidTagCode`);

--
-- Indexes for table `rfidcards`
--
ALTER TABLE `rfidcards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cardnumber` (`cardnumber`),
  ADD KEY `userUuid` (`userUuid`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `phonenumber` (`phonenumber`),
  ADD UNIQUE KEY `uuid` (`uuid`);

--
-- Indexes for table `vehicle_details`
--
ALTER TABLE `vehicle_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usersId` (`usersId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `gate`
--
ALTER TABLE `gate`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gate-access`
--
ALTER TABLE `gate-access`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gatepass`
--
ALTER TABLE `gatepass`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gatepass_logs`
--
ALTER TABLE `gatepass_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rfidcards`
--
ALTER TABLE `rfidcards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vehicle_details`
--
ALTER TABLE `vehicle_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `gate-access`
--
ALTER TABLE `gate-access`
  ADD CONSTRAINT `gate-access_ibfk_1` FOREIGN KEY (`gateId`) REFERENCES `gate` (`id`);

--
-- Constraints for table `gatepass`
--
ALTER TABLE `gatepass`
  ADD CONSTRAINT `gatepass_ibfk_2` FOREIGN KEY (`entryGate`) REFERENCES `gate` (`id`),
  ADD CONSTRAINT `gatepass_ibfk_3` FOREIGN KEY (`exitGate`) REFERENCES `gate` (`id`),
  ADD CONSTRAINT `gatepass_ibfk_5` FOREIGN KEY (`userUuid`) REFERENCES `users` (`uuid`);

--
-- Constraints for table `gatepass_logs`
--
ALTER TABLE `gatepass_logs`
  ADD CONSTRAINT `gatepass_logs_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `gatepass` (`userUuid`),
  ADD CONSTRAINT `gatepass_logs_ibfk_2` FOREIGN KEY (`rfidTagCode`) REFERENCES `gatepass` (`rfidTagCode`);

--
-- Constraints for table `rfidcards`
--
ALTER TABLE `rfidcards`
  ADD CONSTRAINT `rfidcards_ibfk_1` FOREIGN KEY (`userUuid`) REFERENCES `users` (`uuid`);

--
-- Constraints for table `vehicle_details`
--
ALTER TABLE `vehicle_details`
  ADD CONSTRAINT `vehicle_details_ibfk_1` FOREIGN KEY (`usersId`) REFERENCES `users` (`uuid`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
