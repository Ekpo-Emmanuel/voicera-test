'use client';

import WebcamComponent from './components/WebcamComponent';
import ImageUploader from './components/ImageUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="container mx-auto py-10 px-4">
      <Tabs defaultValue="webcam" className="">
        <TabsList className="grid w-fit grid-cols-2 mb-8">
          <TabsTrigger value="webcam">Webcam</TabsTrigger>
          <TabsTrigger value="image">Image Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="webcam">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Webcam Face Detection</h2>
            <WebcamComponent />
          </div>
        </TabsContent>
        <TabsContent value="image">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Image Upload Face Detection</h2>
            <ImageUploader />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
