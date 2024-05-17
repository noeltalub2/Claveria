-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 16, 2024 at 06:14 PM
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
-- Database: `claveria`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contact` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(100) NOT NULL,
  `status` enum('Active','Inactive','Pending','Suspended') NOT NULL,
  `joinDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `fullname`, `email`, `contact`, `address`, `username`, `password`, `status`, `joinDate`) VALUES
(1, 'Eren Yeager', 'erenyeager@gmail.com', '0923314124', 'Vintar', 'admin', '$2a$12$TEV8QrjM59KwTf.BU1DQHubl3PWbRm27JI7FKfE.dOp4Wr4KE0upq', 'Active', '2024-05-13 00:07:34');

-- --------------------------------------------------------

--
-- Table structure for table `announcement`
--

CREATE TABLE `announcement` (
  `announcement_id` int(11) NOT NULL,
  `image` varchar(100) NOT NULL,
  `title` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `dateAdded` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `announcement`
--

INSERT INTO `announcement` (`announcement_id`, `image`, `title`, `message`, `dateAdded`) VALUES
(1, '1715829474038-ticket.png', 'Test', 'test', '2024-05-16 11:17:54');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `booking_date` date NOT NULL,
  `fare_paid` decimal(10,2) NOT NULL,
  `schedule_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `booking_type` varchar(45) DEFAULT NULL,
  `drop_off` varchar(45) DEFAULT NULL,
  `discount_id` int(11) DEFAULT NULL,
  `booking_expiration` date DEFAULT NULL,
  `id_number` varchar(45) DEFAULT NULL,
  `dateAdded` datetime NOT NULL DEFAULT current_timestamp(),
  `dateModified` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `user_id`, `booking_date`, `fare_paid`, `schedule_id`, `status`, `booking_type`, `drop_off`, `discount_id`, `booking_expiration`, `id_number`, `dateAdded`, `dateModified`) VALUES
(1, 2, '2024-05-16', '50.00', 1, 'Paid', 'Online', 'Cadcadir', NULL, '2024-05-17', 'ABCD1234', '2024-05-16 10:58:47', '2024-05-16 11:06:42'),
(2, 2, '2024-05-16', '44.80', 2, 'Paid', 'Online', 'Saranay', 1, '2024-05-17', '123213', '2024-05-16 22:33:59', '2024-05-16 23:41:46'),
(3, 1, '2024-05-16', '56.00', 2, 'Paid', 'Walk In', 'Saranay', 1, '2024-05-17', '12312', '2024-05-16 23:21:51', NULL),
(4, 2, '2024-05-16', '50.00', 2, 'Pending', 'Online', 'Cadcadir', 1, '2024-05-17', 'asda', '2024-05-17 00:04:10', NULL),
(5, 2, '2024-05-16', '250.00', 2, 'Pending', 'Online', 'Claveria', NULL, '2024-05-17', NULL, '2024-05-17 00:04:37', NULL),
(6, 2, '2024-05-16', '50.00', 2, 'Pending', 'Online', 'Sta. Praxedes', 1, '2024-05-17', 'asdada', '2024-05-17 00:09:08', NULL),
(7, 2, '2024-05-16', '50.00', 2, 'Pending', 'Online', 'Sta. Praxedes', 1, '2024-05-17', 'asdasd', '2024-05-17 00:09:37', NULL),
(8, 2, '2024-05-16', '50.00', 2, 'Pending', 'Online', 'Sta. Praxedes', 2, '2024-05-17', 'qweqwe', '2024-05-17 00:10:14', NULL),
(9, 2, '2024-05-16', '56.00', 2, 'Pending', 'Online', 'Saranay', 1, '2024-05-17', 'wewew', '2024-05-17 00:12:02', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `buses`
--

CREATE TABLE `buses` (
  `bus_id` int(11) NOT NULL,
  `bus_number` varchar(50) NOT NULL,
  `capacity` int(11) NOT NULL,
  `bus_status` varchar(45) NOT NULL,
  `dateAdded` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `buses`
--

INSERT INTO `buses` (`bus_id`, `bus_number`, `capacity`, `bus_status`, `dateAdded`) VALUES
(1, 'ZXC100', 40, 'Inactive', '2024-05-14 23:01:05'),
(2, 'ABC999', 40, 'Active', '2024-05-14 23:01:19'),
(3, 'MNB100', 40, 'Active', '2024-05-15 13:42:47'),
(4, 'FGH', 40, 'Active', '2024-05-15 23:56:01'),
(5, 'WE', 23, 'Active', '2024-05-15 23:56:12');

-- --------------------------------------------------------

--
-- Table structure for table `conductors`
--

CREATE TABLE `conductors` (
  `cnd_id` int(11) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contact` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `status` enum('Active','Inactive','Pending','Suspended') NOT NULL,
  `joinDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `conductors`
--

INSERT INTO `conductors` (`cnd_id`, `fullname`, `email`, `contact`, `address`, `username`, `password`, `status`, `joinDate`) VALUES
(1, 'Conductor 1', 'conductor1@gmail.com', '09123123333', 'Laoag City', 'conductor1', '$2b$12$fYcTpJ7sHnU/MrU5NrMQbeW/Nvo19kWbNKrdbdSqD3oD/usvNEQLu', 'Active', '2024-05-14 23:03:47'),
(2, 'Conductor 2', 'conductor@gmail.com', '0989898989', 'Claveria', 'conductor2', '$2b$12$Ej5rkUyiPjZoj69mIwHxPezcUcE9A.1yeOFviXpK3D9jpFizbiA2i', 'Active', '2024-05-14 23:04:36');

-- --------------------------------------------------------

--
-- Table structure for table `discounts`
--

CREATE TABLE `discounts` (
  `discount_id` int(11) NOT NULL,
  `discount_type` varchar(45) NOT NULL,
  `discount_percentage` varchar(45) NOT NULL,
  `status` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `discounts`
--

INSERT INTO `discounts` (`discount_id`, `discount_type`, `discount_percentage`, `status`) VALUES
(1, 'STUDENT', '0.20', 'Active'),
(2, 'PWD', '0.20', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `inspectors`
--

CREATE TABLE `inspectors` (
  `ins_id` int(11) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contact` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `status` enum('Active','Inactive','Pending','Suspended') NOT NULL,
  `joinDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `inspectors`
--

INSERT INTO `inspectors` (`ins_id`, `fullname`, `email`, `contact`, `address`, `username`, `password`, `status`, `joinDate`) VALUES
(1, 'Inspector 1', 'inspector1@gmail.com', '0909123123', 'Laoag City', 'inspector1', '$2b$12$18f5i4d8eKq0wdVrUyyNWe9nSTkaodeIhIZn3PIecRC3KG65P5Hfi', 'Active', '2024-05-14 23:02:17'),
(2, 'Inspector 2', 'inspector2@gmail.com', '09123123123', 'Claveria', 'inspector2', '$2b$12$9gla0d9x8GdKBsMpb.fj1OSHByF6JwldA2vMKRsQ/K6WdH.RTev/u', 'Active', '2024-05-14 23:02:50');

-- --------------------------------------------------------

--
-- Table structure for table `inspector_report`
--

CREATE TABLE `inspector_report` (
  `ir_id` int(11) NOT NULL,
  `inspector_id` int(11) NOT NULL,
  `schedule_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `arrival_time` time NOT NULL,
  `added_passenger` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `pickup_passenger`
--

CREATE TABLE `pickup_passenger` (
  `psg_id` int(11) NOT NULL,
  `schedule_id` int(11) NOT NULL,
  `conductor_id` int(11) NOT NULL,
  `fullname` varchar(45) NOT NULL,
  `origin` varchar(45) NOT NULL,
  `destination` varchar(45) NOT NULL,
  `fare_paid` decimal(10,2) NOT NULL,
  `status` varchar(45) NOT NULL DEFAULT 'Paid',
  `dateAdded` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `pickup_passenger`
--

INSERT INTO `pickup_passenger` (`psg_id`, `schedule_id`, `conductor_id`, `fullname`, `origin`, `destination`, `fare_paid`, `status`, `dateAdded`) VALUES
(1, 1, 1, 'PICK UP', 'qwe', 'qwe', '50.00', 'Paid', '2024-05-16 23:49:33'),
(2, 1, 1, 'qweqw', 'qwe', 'qwe', '50.00', 'Paid', '2024-05-16 23:52:03'),
(3, 1, 1, 'qweqw', 'qwe', 'qwe', '50.00', 'Paid', '2024-05-16 23:52:03'),
(4, 1, 1, 'qweqw', 'qwe', 'qwe', '50.00', 'Paid', '2024-05-16 23:52:03'),
(5, 1, 1, 'qweqw', 'qwe', 'qwe', '50.00', 'Paid', '2024-05-16 23:52:03'),
(6, 1, 1, 'PICK UP', 'qwe', 'qwe', '65.00', 'Paid', '2024-05-16 23:52:38'),
(7, 1, 1, 'PICK UP', 'qwe', 'qwe', '65.00', 'Paid', '2024-05-16 23:52:38'),
(8, 1, 1, 'PICK UP', 'qwe', 'we', '22.20', 'Paid', '2024-05-16 23:53:02'),
(9, 1, 1, 'PICK UP', 'qwe', 'we', '22.20', 'Paid', '2024-05-16 23:53:02'),
(10, 1, 1, 'PICK UP', 'qwe', 'we', '22.20', 'Paid', '2024-05-16 23:53:02'),
(11, 1, 1, 'PICK UP', 'qwe', 'we', '22.20', 'Paid', '2024-05-16 23:53:02'),
(12, 1, 1, 'PICK UP', 'qwe', 'we', '22.20', 'Paid', '2024-05-16 23:53:02'),
(13, 1, 1, 'PICK UP', 'qwe', 'weqwe', '31.25', 'Paid', '2024-05-16 23:53:52'),
(14, 1, 1, 'PICK UP', 'qwe', 'weqwe', '31.25', 'Paid', '2024-05-16 23:53:52'),
(15, 1, 1, 'PICK UP', 'qwe', 'weqwe', '31.25', 'Paid', '2024-05-16 23:53:52'),
(16, 1, 1, 'PICK UP', 'qwe', 'weqwe', '31.25', 'Paid', '2024-05-16 23:53:52'),
(17, 1, 1, 'PICK UP', 'qwe', 'weqwe', '31.25', 'Paid', '2024-05-16 23:53:52'),
(18, 1, 1, 'PICK UP', 'qwe', 'weqwe', '31.25', 'Paid', '2024-05-16 23:53:52'),
(19, 1, 1, 'PICK UP', 'qwe', 'weqwe', '31.25', 'Paid', '2024-05-16 23:53:52'),
(20, 1, 1, 'PICK UP', 'qwe', 'weqwe', '31.25', 'Paid', '2024-05-16 23:53:52');

-- --------------------------------------------------------

--
-- Table structure for table `routes`
--

CREATE TABLE `routes` (
  `route_id` int(11) NOT NULL,
  `start_point` varchar(255) NOT NULL,
  `end_point` varchar(255) NOT NULL,
  `fare` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `routes`
--

INSERT INTO `routes` (`route_id`, `start_point`, `end_point`, `fare`) VALUES
(1, 'Claveria', 'Laoag City', '200.00'),
(2, 'Laoag City', 'Claveria', '200.00'),
(3, 'Dingras', 'Bangui', '0.00');

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `schedule_id` int(11) NOT NULL,
  `route_id` int(11) NOT NULL,
  `bus_id` int(11) NOT NULL,
  `conductor_id` int(11) NOT NULL,
  `departure_time` time NOT NULL,
  `arrival_time` time NOT NULL,
  `departure_date` date NOT NULL,
  `status` varchar(50) DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`schedule_id`, `route_id`, `bus_id`, `conductor_id`, `departure_time`, `arrival_time`, `departure_date`, `status`) VALUES
(1, 1, 3, 1, '06:00:00', '10:30:00', '2024-05-16', 'Active'),
(2, 1, 2, 1, '05:30:00', '09:30:00', '2024-05-17', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `seats`
--

CREATE TABLE `seats` (
  `seat_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `seat_number` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `seats`
--

INSERT INTO `seats` (`seat_id`, `booking_id`, `seat_number`) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 3, 3),
(4, 4, 17),
(5, 5, 31),
(6, 6, 11),
(7, 7, 2),
(8, 8, 40),
(9, 9, 21);

-- --------------------------------------------------------

--
-- Table structure for table `sub_routes`
--

CREATE TABLE `sub_routes` (
  `sr_id` int(11) NOT NULL,
  `route_id` int(12) NOT NULL,
  `origin` varchar(60) NOT NULL,
  `destination` varchar(60) NOT NULL,
  `fare` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `sub_routes`
--

INSERT INTO `sub_routes` (`sr_id`, `route_id`, `origin`, `destination`, `fare`) VALUES
(1, 1, 'Saranay', 'Laoag City', '170.00'),
(2, 1, 'Abaca', 'Laoag City', '120.00'),
(3, 1, 'Subec', 'Laoag City', '140.00'),
(4, 1, 'Nursery', 'Laoag City', '140.00'),
(5, 2, 'Pasaleng', 'Claveria', '70.00'),
(6, 2, 'Utol', 'Claveria', '120.00'),
(7, 1, 'Tarrag', 'Laoag City', '140.00'),
(8, 1, 'Mabnang', 'Laoag City', '250.00'),
(9, 1, 'Claveria', 'Laoag City', '250.00'),
(10, 1, 'Burgos Saoit', 'Laoag City', '80.00'),
(11, 1, 'Taggat', 'Laoag City', '250.00'),
(12, 1, 'Bago', 'Laoag City', '50.00'),
(13, 2, 'Baruyen', 'Claveria', '120.00'),
(14, 2, 'Dilavo', 'Claveria', '170.00'),
(15, 2, 'Taggat', 'Claveria', '20.00'),
(16, 2, 'Bubon', 'Claveria', '140.00'),
(17, 1, 'Capacuan', 'Laoag City', '250.00'),
(18, 2, 'Masikil', 'Claveria', '120.00'),
(19, 2, 'Caramuangen', 'Claveria', '80.00'),
(20, 1, 'Buraan', 'Laoag City', '80.00'),
(21, 2, 'Badduang', 'Claveria', '80.00'),
(22, 2, 'Cadcadir', 'Claveria', '50.00'),
(23, 2, 'Saranay', 'Claveria', '70.00'),
(24, 1, 'Cadaratan', 'Laoag City', '20.00'),
(25, 2, 'Bayog', 'Claveria', '140.00'),
(26, 2, 'Pasuquin', 'Claveria', '200.00'),
(27, 1, 'Caramuangen', 'Laoag City', '140.00'),
(28, 2, 'Bago', 'Claveria', '170.00'),
(29, 2, 'Kilkiling', 'Claveria', '20.00'),
(30, 1, 'Baccara', 'Laoag City', '20.00'),
(31, 2, 'Tabbug', 'Claveria', '70.00'),
(32, 1, 'Ayuyo', 'Laoag City', '170.00'),
(33, 2, 'Nagsurot', 'Claveria', '140.00'),
(34, 2, 'Mataruntong', 'Claveria', '70.00'),
(35, 1, 'Davila', 'Laoag City', '70.00'),
(36, 1, 'Nagsanga', 'Laoag City', '50.00'),
(37, 1, 'Pancian', 'Laoag City', '170.00'),
(38, 1, 'Malasin', 'Laoag City', '120.00'),
(39, 2, 'Capacuan', 'Claveria', '50.00'),
(40, 2, 'Claveria', 'Claveria', '250.00'),
(41, 2, 'Abaca', 'Claveria', '120.00'),
(42, 2, 'Buraan', 'Claveria', '140.00'),
(43, 2, 'Cadaratan', 'Claveria', '250.00'),
(44, 2, 'Sta. Praxedes', 'Claveria', '50.00'),
(45, 1, 'Portabaga', 'Laoag City', '250.00'),
(46, 2, 'Ayuyo', 'Claveria', '80.00'),
(47, 1, 'Baruyen', 'Laoag City', '120.00'),
(48, 2, 'Agua Grande', 'Claveria', '70.00'),
(49, 1, 'Utol', 'Laoag City', '120.00'),
(50, 2, 'Tarrag', 'Claveria', '80.00'),
(51, 2, 'Barit', 'Claveria', '250.00'),
(52, 1, 'Bayog', 'Laoag City', '80.00'),
(53, 2, 'Portabaga', 'Claveria', '50.00'),
(54, 2, 'Laoag', 'Claveria', '250.00'),
(55, 2, 'Mabnang', 'Claveria', '20.00'),
(56, 2, 'San Juan', 'Claveria', '50.00'),
(57, 1, 'Tulnagan', 'Laoag City', '70.00'),
(58, 1, 'Balaoi', 'Laoag City', '170.00'),
(59, 2, 'Union', 'Claveria', '50.00'),
(60, 1, 'Dilavo', 'Laoag City', '70.00'),
(61, 1, 'Nagabungan', 'Laoag City', '70.00'),
(62, 1, 'Manayon', 'Laoag City', '120.00'),
(63, 2, 'Burgos Saoit', 'Claveria', '140.00'),
(64, 1, 'Sta. Praxedes', 'Laoag City', '250.00'),
(65, 2, 'Baccara', 'Claveria', '250.00'),
(66, 2, 'Balaoi', 'Claveria', '70.00'),
(67, 1, 'Bangui', 'Laoag City', '120.00'),
(68, 1, 'Maoini', 'Laoag City', '140.00'),
(69, 1, 'Barit', 'Laoag City', '20.00'),
(70, 2, 'Davila', 'Claveria', '170.00'),
(71, 2, 'Pancian', 'Claveria', '70.00'),
(72, 1, 'Mataruntong', 'Laoag City', '170.00'),
(73, 2, 'Malasin', 'Claveria', '120.00'),
(74, 1, 'Kilkiling', 'Laoag City', '250.00'),
(75, 1, 'Cababaan', 'Laoag City', '50.00'),
(76, 1, 'Tabbug', 'Laoag City', '170.00'),
(77, 1, 'Gaoa', 'Laoag City', '170.00'),
(78, 1, 'Caruan', 'Laoag City', '50.00'),
(79, 1, 'Pasuquin', 'Laoag City', '50.00'),
(80, 2, 'Tulnagan', 'Claveria', '170.00'),
(81, 2, 'Gaoa', 'Claveria', '70.00'),
(82, 1, 'Lanao', 'Laoag City', '120.00'),
(83, 2, 'Maoini', 'Claveria', '80.00'),
(84, 2, 'Bangui', 'Claveria', '120.00'),
(85, 2, 'Ncc', 'Claveria', '140.00'),
(86, 1, 'Pasaleng', 'Laoag City', '170.00'),
(87, 2, 'Caruan', 'Claveria', '200.00'),
(88, 1, 'Union', 'Laoag City', '250.00'),
(89, 1, 'Nagsurot', 'Laoag City', '80.00'),
(90, 1, 'Ncc', 'Laoag City', '80.00'),
(91, 1, 'Bubon', 'Laoag City', '80.00'),
(92, 1, 'Cadcadir', 'Laoag City', '250.00'),
(93, 1, 'Masikil', 'Laoag City', '120.00'),
(94, 2, 'Subec', 'Claveria', '80.00'),
(95, 2, 'Nursery', 'Claveria', '80.00'),
(96, 2, 'Manayon', 'Claveria', '120.00'),
(97, 1, 'Lablabig', 'Laoag City', '250.00'),
(98, 2, 'Cababaan', 'Claveria', '200.00'),
(99, 1, 'Caramuangen', 'Laoag City', '140.00'),
(100, 2, 'Nagsanga', 'Claveria', '200.00'),
(101, 1, 'Badduang', 'Laoag City', '140.00'),
(102, 2, 'Lanao', 'Claveria', '120.00'),
(103, 1, 'San Juan', 'Laoag City', '250.00'),
(104, 2, 'Lablabig', 'Claveria', '50.00'),
(105, 2, 'Nagabungan', 'Claveria', '170.00'),
(106, 1, 'Agua Grande', 'Laoag City', '170.00'),
(107, 3, 'Dingras', 'Laoag City', '20.00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `acc_id` int(11) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contact` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `status` enum('Active','Inactive','Pending','Suspended') NOT NULL,
  `joinDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`acc_id`, `fullname`, `email`, `contact`, `address`, `username`, `password`, `status`, `joinDate`) VALUES
(1, 'WALK IN', 'N/A', 'N/A', 'N/A', '', NULL, '', '2024-05-14 23:05:37'),
(2, 'User 1', 'user1@gmail.com', '09381237123', 'Laoag City', 'user1', '$2b$12$40FH3OkAnEPVifkyFw/UC.vUtnQ806BRhB2p.cPAzkCrNhJHKgMfi', 'Active', '2024-05-14 23:21:39');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`);

--
-- Indexes for table `announcement`
--
ALTER TABLE `announcement`
  ADD PRIMARY KEY (`announcement_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `discount_id` (`discount_id`);

--
-- Indexes for table `buses`
--
ALTER TABLE `buses`
  ADD PRIMARY KEY (`bus_id`);

--
-- Indexes for table `conductors`
--
ALTER TABLE `conductors`
  ADD PRIMARY KEY (`cnd_id`),
  ADD UNIQUE KEY `email` (`email`,`contact`,`username`);

--
-- Indexes for table `discounts`
--
ALTER TABLE `discounts`
  ADD PRIMARY KEY (`discount_id`);

--
-- Indexes for table `inspectors`
--
ALTER TABLE `inspectors`
  ADD PRIMARY KEY (`ins_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `contact` (`contact`);

--
-- Indexes for table `inspector_report`
--
ALTER TABLE `inspector_report`
  ADD PRIMARY KEY (`ir_id`),
  ADD KEY `inspector_id` (`inspector_id`),
  ADD KEY `schedule_id` (`schedule_id`);

--
-- Indexes for table `pickup_passenger`
--
ALTER TABLE `pickup_passenger`
  ADD PRIMARY KEY (`psg_id`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `conductor_id` (`conductor_id`);

--
-- Indexes for table `routes`
--
ALTER TABLE `routes`
  ADD PRIMARY KEY (`route_id`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `route_id` (`route_id`),
  ADD KEY `bus_id` (`bus_id`),
  ADD KEY `conductor_id` (`conductor_id`);

--
-- Indexes for table `seats`
--
ALTER TABLE `seats`
  ADD PRIMARY KEY (`seat_id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `sub_routes`
--
ALTER TABLE `sub_routes`
  ADD PRIMARY KEY (`sr_id`),
  ADD KEY `route_id` (`route_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`acc_id`),
  ADD UNIQUE KEY `username` (`fullname`),
  ADD UNIQUE KEY `email` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `announcement`
--
ALTER TABLE `announcement`
  MODIFY `announcement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `buses`
--
ALTER TABLE `buses`
  MODIFY `bus_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `conductors`
--
ALTER TABLE `conductors`
  MODIFY `cnd_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `discounts`
--
ALTER TABLE `discounts`
  MODIFY `discount_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `inspectors`
--
ALTER TABLE `inspectors`
  MODIFY `ins_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `inspector_report`
--
ALTER TABLE `inspector_report`
  MODIFY `ir_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pickup_passenger`
--
ALTER TABLE `pickup_passenger`
  MODIFY `psg_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `routes`
--
ALTER TABLE `routes`
  MODIFY `route_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `seats`
--
ALTER TABLE `seats`
  MODIFY `seat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `sub_routes`
--
ALTER TABLE `sub_routes`
  MODIFY `sr_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=108;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `acc_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`schedule_id`),
  ADD CONSTRAINT `bookings_ibfk_5` FOREIGN KEY (`user_id`) REFERENCES `users` (`acc_id`),
  ADD CONSTRAINT `bookings_ibfk_6` FOREIGN KEY (`discount_id`) REFERENCES `discounts` (`discount_id`);

--
-- Constraints for table `inspector_report`
--
ALTER TABLE `inspector_report`
  ADD CONSTRAINT `inspector_report_ibfk_1` FOREIGN KEY (`inspector_id`) REFERENCES `inspectors` (`ins_id`),
  ADD CONSTRAINT `inspector_report_ibfk_2` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`schedule_id`);

--
-- Constraints for table `pickup_passenger`
--
ALTER TABLE `pickup_passenger`
  ADD CONSTRAINT `pickup_passenger_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`schedule_id`),
  ADD CONSTRAINT `pickup_passenger_ibfk_2` FOREIGN KEY (`conductor_id`) REFERENCES `conductors` (`cnd_id`);

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `routes` (`route_id`),
  ADD CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`bus_id`),
  ADD CONSTRAINT `schedules_ibfk_3` FOREIGN KEY (`conductor_id`) REFERENCES `conductors` (`cnd_id`);

--
-- Constraints for table `seats`
--
ALTER TABLE `seats`
  ADD CONSTRAINT `seats_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`);

--
-- Constraints for table `sub_routes`
--
ALTER TABLE `sub_routes`
  ADD CONSTRAINT `sub_routes_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `routes` (`route_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
