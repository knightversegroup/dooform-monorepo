import { http } from './client';

export interface DocumentSignatureDto {
  id: string;
  userId: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  imagePath: string;
  signedAt: string;
}

export function listSignatures(documentId: string) {
  return http.get<{ data: DocumentSignatureDto[] }>(
    `/v1/documents/${documentId}/signatures`
  );
}

export function createSignature(
  documentId: string,
  input: {
    imageBlob: Blob;
    pageIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }
) {
  const formData = new FormData();
  formData.append('image', input.imageBlob, 'signature.png');
  formData.append('pageIndex', String(input.pageIndex));
  formData.append('x', String(input.x));
  formData.append('y', String(input.y));
  formData.append('width', String(input.width));
  formData.append('height', String(input.height));
  return http.post<DocumentSignatureDto>(
    `/v1/documents/${documentId}/signatures`,
    { formData }
  );
}

export function deleteSignature(documentId: string, signatureId: string) {
  return http.delete<{ ok: true }>(
    `/v1/documents/${documentId}/signatures/${signatureId}`
  );
}
