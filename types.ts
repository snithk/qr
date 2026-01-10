
export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  data: string; // Base64
  rawFile: File;
}

export interface ShareResult {
  url: string;
  expiry: string;
  key: string;
}

export interface FileInsights {
  title: string;
  description: string;
  category: string;
}

export interface UserFile {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  public_url: string;
  created_at: string;
}
