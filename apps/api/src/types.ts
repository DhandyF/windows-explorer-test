// Shared types
export interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  path: string;
  created_at: string;
  updated_at: string;
  children?: Folder[];
}

export interface FileItem {
  id: number;
  name: string;
  folder_id: number;
  file_type: string | null;
  file_size: number;
  path: string;
  created_at: string;
  updated_at: string;
}
