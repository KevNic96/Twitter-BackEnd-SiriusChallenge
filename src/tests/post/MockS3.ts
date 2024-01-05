// MockS3Repo.ts
export class MockS3Repo {
    createPresignedPost(params: any): Promise<{ url: string; fields: Record<string, string> }> {
      // Lógica para simular la creación de una URL presignada en S3
      const presignedUrl = 'mocked-presigned-url';
      const fields = { Key: 'mocked-filename' };
  
      return Promise.resolve({ url: presignedUrl, fields });
    }
  }