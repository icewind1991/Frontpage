-- phpMyAdmin SQL Dump
-- version 3.5.5
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jan 19, 2013 at 10:27 PM
-- Server version: 5.5.29-log
-- PHP Version: 5.4.11

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `frontpage`
--

-- --------------------------------------------------------

--
-- Table structure for table `authors`
--

CREATE TABLE IF NOT EXISTS `authors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(65) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2902 ;

-- --------------------------------------------------------

--
-- Table structure for table `domains`
--

CREATE TABLE IF NOT EXISTS `domains` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=365 ;

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE IF NOT EXISTS `positions` (
  `id` int(11) NOT NULL,
  `time` int(11) NOT NULL,
  `position` int(11) NOT NULL,
  `subreddit` int(11) NOT NULL,
  `up` int(11) NOT NULL,
  `down` int(11) NOT NULL,
  `comments` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE IF NOT EXISTS `posts` (
  `id` int(11) NOT NULL,
  `subreddit` int(11) NOT NULL,
  `author` int(11) NOT NULL,
  `create` int(11) NOT NULL,
  `self_length` int(11) NOT NULL,
  `title_length` int(11) NOT NULL,
  `type` tinyint(4) NOT NULL,
  `nsfw` tinyint(1) NOT NULL,
  `domain` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `post_ids`
--

CREATE TABLE IF NOT EXISTS `post_ids` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(8) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3343 ;

-- --------------------------------------------------------

--
-- Table structure for table `subreddits`
--

CREATE TABLE IF NOT EXISTS `subreddits` (
  `name` varchar(128) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=306 ;

-- --------------------------------------------------------

--
-- Table structure for table `subscribers`
--

CREATE TABLE IF NOT EXISTS `subscribers` (
  `id` int(11) NOT NULL,
  `time` int(11) NOT NULL,
  `count` int(11) NOT NULL,
  UNIQUE KEY `sub_id_time` (`id`,`time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
