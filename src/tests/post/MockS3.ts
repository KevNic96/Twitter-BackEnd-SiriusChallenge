// MockS3Repo.ts
export class MockS3Repo {
    async createPresignedPost(params: any): Promise<{ presignedUrl: string, fileUrl: string }> {
      // Lógica para simular la creación de una URL presignada en S3
      const presignedUrl = `https://mock-s3-bucket.s3.amazonaws.com/${params.Key}`;
      const fileUrl = `https://mock-s3-bucket.s3.amazonaws.com/${params.Key}`;
  
      return { presignedUrl, fileUrl};
    }
  }