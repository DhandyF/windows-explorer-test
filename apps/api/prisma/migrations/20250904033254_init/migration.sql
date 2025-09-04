-- CreateTable
CREATE TABLE `Folder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `parent_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Folder_path_key`(`path`),
    INDEX `Folder_parent_id_idx`(`parent_id`),
    INDEX `Folder_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FileItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `folder_id` INTEGER NOT NULL,
    `file_type` VARCHAR(191) NULL,
    `file_size` INTEGER NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FileItem_path_key`(`path`),
    INDEX `FileItem_folder_id_idx`(`folder_id`),
    INDEX `FileItem_name_idx`(`name`),
    INDEX `FileItem_file_type_idx`(`file_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Folder` ADD CONSTRAINT `Folder_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `Folder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileItem` ADD CONSTRAINT `FileItem_folder_id_fkey` FOREIGN KEY (`folder_id`) REFERENCES `Folder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
