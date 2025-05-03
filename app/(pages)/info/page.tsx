'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InfoPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">About Face Recognition</h1>
      <p className="text-gray-600 mb-8 max-w-3xl">
        Learn how our facial recognition system works and how to get the best results.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Technical details about the facial recognition system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This application uses face-api.js, a JavaScript API built on TensorFlow.js core, optimized for face
              detection and recognition in the browser.
            </p>

            <div>
              <h3 className="text-lg font-medium mb-2">Features:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Face detection with bounding boxes</li>
                <li>Facial landmark detection (68 points)</li>
                <li>Age and gender estimation</li>
                <li>Emotion recognition</li>
                <li>Image upload and processing</li>
              </ul>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md text-sm">
              <p className="italic text-muted-foreground">
                The models have been trained on diverse datasets but may have limitations in certain lighting
                conditions or with certain facial features.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>How to use the facial recognition application</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Activate Camera</h3>
                  <p className="text-sm text-muted-foreground">
                    Click "Start Webcam" to enable your device's camera
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Upload Image</h3>
                  <p className="text-sm text-muted-foreground">
                    Alternatively, upload an image and click "Detect Faces" to analyze it
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                  3
                </div>
                <div>
                  <h3 className="font-medium">View Results</h3>
                  <p className="text-sm text-muted-foreground">Face detection boxes will appear around detected faces with age and gender information</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                  4
                </div>
                <div>
                  <h3 className="font-medium">Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                  Detailed facial analysis will appear below the image with emotion detection
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Privacy Information</h2>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <p className="text-green-800 mb-2">
            <strong>Your privacy is important to us:</strong>
          </p>
          <ul className="list-disc ml-5 text-green-700 space-y-1">
            <li>All processing happens directly in your browser</li>
            <li>No images or face data are sent to any server</li>
            <li>No personal information is stored or collected</li>
            <li>The app works offline after initial load</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 