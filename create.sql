DROP TABLE IF EXISTS `tbl_block_index_info_puppy`;
CREATE TABLE
  `tbl_block_index_info_puppy` (
    `id` int (11) NOT NULL AUTO_INCREMENT,
    `block` bigint (20) DEFAULT NULL,
    `flag` int (2) DEFAULT '0' COMMENT '是否处理过',
    PRIMARY KEY (`id`),
    UNIQUE KEY `tbl_current_block_id_uindex` (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `tbl_current_block_puppy`;
CREATE TABLE
  `tbl_current_block_puppy` (
    `id` int (11) NOT NULL AUTO_INCREMENT,
    `block` bigint (20) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `tbl_current_block_id_uindex` (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `tbl_drc_balance_puppy`;
CREATE TABLE
  `tbl_drc_balance_puppy` (
    `id` bigint (20) NOT NULL AUTO_INCREMENT,
    `address` varchar(200) DEFAULT NULL,
    `tick` varchar(20) DEFAULT NULL,
    `balance` decimal(30, 8) DEFAULT NULL,
    `time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `tbl_drc_balance_id_uindex` (`id`),
    KEY `tbl_db__index_at` (`address`, `tick`),
    KEY `tbl_db_ndex_add` (`address`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `tbl_drc_info_puppy`;
CREATE TABLE
  `tbl_drc_info_puppy` (
    `id` int (11) NOT NULL AUTO_INCREMENT,
    `tick` varchar(10) DEFAULT NULL,
    `owener_address` varchar(200) DEFAULT NULL,
    `deploy_time` timestamp NULL DEFAULT NULL,
    `max` bigint (30) DEFAULT '0',
    `lim` bigint (30) DEFAULT '0',
    `mint_val` bigint (30) DEFAULT '0',
    `mint_over` int (30) DEFAULT '0',
    `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `tbl_drc_info_id_uindex` (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `tbl_transfer_info_puppy`;
CREATE TABLE
  `tbl_transfer_info_puppy` (
    `id` int (11) NOT NULL AUTO_INCREMENT,
    `address` varchar(200) DEFAULT NULL,
    `amt` decimal(30, 8) DEFAULT NULL,
    `txnid` varchar(200) DEFAULT NULL,
    `crate_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `flag` int (11) DEFAULT '0',
    `tick` varchar(10) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `tbl_transfer_info_id_uindex` (`id`),
    KEY `tbl_tf_index_address` (`address`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `tbl_tx_info_puppy`;
CREATE TABLE
  `tbl_tx_info_puppy` (
    `id` bigint (20) NOT NULL AUTO_INCREMENT,
    `content` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `address` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `txnid` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `txnid_pre` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '输入交易的关联id',
    `block` int (11) DEFAULT NULL,
    `flag` int (11) DEFAULT '0' COMMENT '是否处理过',
    `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `tx_index` int (11) DEFAULT NULL,
    `op` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `tbl_tx_info_id_uindex` (`id`),
    KEY `tbl_tx_info__block` (`block`),
    KEY `tbl_tx_info__ad` (`address`),
    KEY `tbl_tx_info__txid` (`txnid`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `tbl_tx_transfer_info_puppy`;
CREATE TABLE
  `tbl_tx_transfer_info_puppy` (
    `id` bigint (20) NOT NULL AUTO_INCREMENT,
    `sender` varchar(100) DEFAULT NULL,
    `receiver` varchar(100) DEFAULT NULL,
    `txid` varchar(200) DEFAULT NULL,
    `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `tick` varchar(10) DEFAULT NULL,
    `amt` decimal(30, 8) DEFAULT '0',
    PRIMARY KEY (`id`),
    UNIQUE KEY `tbl_tx_transfer_info_id_uindex` (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

insert into
  tbl_current_block_puppy (id, block)
values
  (1, 1);