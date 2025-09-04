import { Elysia, t } from "elysia";
import { DatabaseService } from "../services/database.service";

export const explorerRoutes = new Elysia({ prefix: "/api" })
  .get("/folders", async () => {
    const data = await DatabaseService.getAllFolders();
    return data;
  })
  .get(
    "/folders/:id",
    async ({ params, set }) => {
      const id = Number(params.id);
      if (Number.isNaN(id)) {
        set.status = 400;
        return { error: "Invalid folder id" };
      }
      const folder = await DatabaseService.getFolderById(id);
      if (!folder) {
        set.status = 404;
        return { error: "Folder not found" };
      }
      return folder;
    },
    { params: t.Object({ id: t.String() }) }
  )
  .get(
    "/folders/:id/subfolders",
    async ({ params, set }) => {
      const id = Number(params.id);
      if (Number.isNaN(id)) {
        set.status = 400;
        return { error: "Invalid folder id" };
      }
      return DatabaseService.getSubfolders(id);
    },
    { params: t.Object({ id: t.String() }) }
  )
  .get(
    "/folders/:id/files",
    async ({ params, set }) => {
      const id = Number(params.id);
      if (Number.isNaN(id)) {
        set.status = 400;
        return { error: "Invalid folder id" };
      }
      return DatabaseService.getFilesInFolder(id);
    },
    { params: t.Object({ id: t.String() }) }
  )
  .post(
    '/folders',
    async ({ body, set }) => {
      try {
        const { parentId = null, name } = body as { parentId?: number | null; name: string }
        const created = await DatabaseService.createFolder(parentId, name)
        set.status = 201
        return created
      } catch (e: any) {
        set.status = e?.status || 400
        return { error: e?.message || 'Failed to create folder' }
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 255 }),
        parentId: t.Optional(t.Number())
      })
    }
  )
  .post(
    '/files',
    async ({ body, set }) => {
      try {
        const { folderId, name, fileType = undefined, fileSize = undefined } = body as {
          folderId: number; name: string; fileType?: string | null; fileSize?: number
        }
        const created = await DatabaseService.createFile(folderId, name, fileType, fileSize)
        set.status = 201
        return created
      } catch (e: any) {
        set.status = e?.status || 400
        return { error: e?.message || 'Failed to create file' }
      }
    },
    {
      body: t.Object({
        folderId: t.Number(),
        name: t.String({ minLength: 1, maxLength: 255 }),
        fileType: t.Optional(t.Union([t.Null(), t.String()])),
        fileSize: t.Optional(t.Number())
      })
    }
  );
