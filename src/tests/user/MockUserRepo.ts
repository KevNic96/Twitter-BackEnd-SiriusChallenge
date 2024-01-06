// MockS3Repo.ts
export class MockS3UserRepo {
    async createPresigned(params: any): Promise<{ presignedUrl: string, profilePicture: string }> {
      // Lógica para simular la creación de una URL presignada en S3
      const presignedUrl = `https://mock-s3-exampleUrl.s3.amazonaws.com/${params.Key}`;
      const profilePicture = `https://mock-s3-profilePictureExample.s3.amazonaws.com/${params.Key}`;
  
      return { presignedUrl, profilePicture};
    }
  }