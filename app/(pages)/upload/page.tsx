'use client';

import ImageUploader from '../../components/ImageUploader';

export default function UploadPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Image Upload and Analysis</h1>
      <div className="mb-10">
        <ImageUploader />
      </div>
    </div>
  );
} 