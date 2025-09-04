import type { Folder, FileItem } from "../types";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

function mapFolder(row: any): Folder {
  return {
    id: row.id,
    name: row.name,
    path: row.path,
    parent_id: row.parentId ?? null,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    children: [],
  };
}

function mapFile(row: any): FileItem {
  return {
    id: row.id,
    name: row.name,
    folder_id: row.folderId,
    file_type: row.fileType ?? null,
    file_size: row.fileSize,
    path: row.path,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export class DatabaseService {
  /**
   * Return a hierarchical tree of folders (roots with nested children).
   */
  static async getAllFolders(): Promise<Folder[]> {
    const rows = await prisma.folder.findMany({
      orderBy: { name: "asc" },
    });

    // map to DTO
    const mapped = rows.map(mapFolder);

    // index by id and build children
    const byId = new Map<number, Folder>();
    for (const f of mapped) {
      f.children = [];
      byId.set(f.id, f);
    }

    const roots: Folder[] = [];
    for (const f of mapped) {
      if (f.parent_id == null) {
        roots.push(f);
      } else {
        byId.get(f.parent_id)?.children?.push(f);
      }
    }
    return roots;
  }

  /** Return only the direct subfolders of a folder (flat list). */
  static async getSubfolders(folderId: number): Promise<Folder[]> {
    const rows = await prisma.folder.findMany({
      where: { parentId: folderId },
      orderBy: { name: "asc" },
    });
    return rows.map(mapFolder).map(f => ({ ...f, children: [] }));
  }

  /** Return only the files in a folder (flat list). */
  static async getFilesInFolder(folderId: number): Promise<FileItem[]> {
    const rows = await prisma.fileItem.findMany({
      where: { folderId },
      orderBy: [{ fileType: "asc" }, { name: "asc" }],
    });
    return rows.map(mapFile);
  }

  /** Return a single folder by id (no children attached). */
  static async getFolderById(folderId: number): Promise<Folder | null> {
    const row = await prisma.folder.findUnique({ where: { id: folderId } });
    return row ? { ...mapFolder(row), children: [] } : null;
  }

  /** Create new folder */
  static async createFolder(parentId: number | null, name: string): Promise<Folder> {
    const safe = name.replace(/[\\/]+/g, '-').trim();
    if (!safe) throw new Error('Folder name required');

    let parentPath = '';
    if (parentId != null) {
      const parent = await prisma.folder.findUnique({ where: { id: parentId } });
      if (!parent) throw new Error('Parent folder not found');
      parentPath = parent.path;
    }

    const path = parentId == null ? `/${safe}` : `${parentPath}/${safe}`;

    try {
      const created = await prisma.folder.create({
        data: { name: safe, path, parentId: parentId ?? null }
      });
      return mapFolder(created);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        // unique constraint on `path`
        const err = new Error('A folder with this name already exists here');
        (err as any).status = 409;
        throw err;
      }
      throw e;
    }
  }

  static async createFile(folderId: number, name: string, fileType?: string | null, fileSize?: number): Promise<FileItem> {
    const folder = await prisma.folder.findUnique({ where: { id: folderId } })
    if (!folder) throw Object.assign(new Error('Parent folder not found'), { status: 404 })

    // sanitize & derive
    const safe = name.replace(/[\\/]+/g, '-').trim()
    if (!safe) throw Object.assign(new Error('File name required'), { status: 400 })

    // derive fileType from extension if not provided
    let ext: string | null = null
    const dot = safe.lastIndexOf('.')
    if (dot > 0 && dot < safe.length - 1) ext = safe.slice(dot + 1).toLowerCase()
    const type = (fileType ?? ext ?? null)
    const size = Number.isFinite(fileSize) ? Number(fileSize) : 0

    const path = `${folder.path}/${safe}`

    try {
      const created = await prisma.fileItem.create({
        data: {
          name: safe,
          folderId,
          fileType: type,
          fileSize: size,
          path
        }
      })
      // return snake_case DTO
      return {
        id: created.id,
        name: created.name,
        folder_id: created.folderId,
        file_type: created.fileType ?? null,
        file_size: created.fileSize,
        path: created.path,
        created_at: created.createdAt.toISOString(),
        updated_at: created.updatedAt.toISOString(),
      }
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw Object.assign(new Error('A file with this name already exists here'), { status: 409 })
      }
      throw e
    }
  }
}
