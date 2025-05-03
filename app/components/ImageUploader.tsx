'use client';

import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setDetectedFaces } from '../store/slices/webcamSlice';
import { loadModels } from '../utils/faceDetection';
import FaceInfoPanel from './FaceInfoPanel';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faceCount, setFaceCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const [isDetectionActive, setIsDetectionActive] = useState<boolean>(false);

  useEffect(() => {
    const loadFaceModels = async () => {
      try {
        await loadModels();
      } catch (err) {
        setError('Error loading face detection models. Please refresh and try again.');
      }
    };

    loadFaceModels();
  }, []);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFiles(event.target.files[0]);
    }
  };

  const handleFiles = (file: File) => {
    setError(null);
    setFaceCount(0);
    dispatch(setDetectedFaces([]));
    setIsDetectionActive(false);
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB. Please choose a smaller image.');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported.');
      return;
    }
    
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const processImage = async () => {
    if (!selectedImage || !imageRef.current || !canvasRef.current) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const faceapi = await import('face-api.js');
      
      const img = imageRef.current;
      const displaySize = { width: img.width, height: img.height };
      
      canvasRef.current.width = img.width;
      canvasRef.current.height = img.height;
      
      faceapi.matchDimensions(canvasRef.current, displaySize);
      
      const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();
      
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        const lineWidth = Math.max(3, Math.min(8, Math.floor(displaySize.width / 100)));
        const fontSize = Math.max(16, Math.min(24, Math.floor(displaySize.width / 40)));
        const padding = Math.max(5, Math.min(10, Math.floor(displaySize.width / 120)));
        
        resizedDetections.forEach((detection, index) => {
          if (!detection.detection || !detection.detection.box) return;
          
          const box = detection.detection.box;
          
          const adjustedBox = {
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height
          };
          
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = 'red';
          ctx.strokeRect(adjustedBox.x, adjustedBox.y, adjustedBox.width, adjustedBox.height);
          
          ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
          ctx.fillRect(adjustedBox.x, adjustedBox.y, adjustedBox.width, adjustedBox.height);
          
          const faceLabel = `FACE #${index + 1}`;
          ctx.font = `bold ${fontSize}px Arial`;
          const textMetrics = ctx.measureText(faceLabel);
          const textWidth = textMetrics.width + padding * 2;
          const textHeight = fontSize + padding;
          
          ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
          ctx.fillRect(adjustedBox.x, adjustedBox.y - textHeight, textWidth, textHeight);
          
          ctx.fillStyle = 'white';
          ctx.fillText(faceLabel, adjustedBox.x + padding, adjustedBox.y - padding);
          
          if (detection.gender && detection.age) {
            const infoText = `${Math.round(detection.age)} years, ${detection.gender}`;
            const infoMetrics = ctx.measureText(infoText);
            const infoWidth = infoMetrics.width + padding * 2;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(
              adjustedBox.x, 
              adjustedBox.y + adjustedBox.height, 
              infoWidth, 
              textHeight
            );
            
            ctx.fillStyle = 'white';
            ctx.fillText(
              infoText, 
              adjustedBox.x + padding, 
              adjustedBox.y + adjustedBox.height + fontSize - padding/2
            );
          }
        });
      }
      
      setFaceCount(resizedDetections.length);
      
      const serializedDetections = resizedDetections.map(detection => ({
        box: detection.detection?.box ? {
          x: detection.detection.box.x,
          y: detection.detection.box.y,
          width: detection.detection.box.width,
          height: detection.detection.box.height
        } : null,
        expressions: detection.expressions ? 
          Object.fromEntries(
            Object.entries(detection.expressions).map(([key, value]) => [key, Number(value)])
          ) : {},
        age: detection.age ? Math.round(detection.age) : null,
        gender: detection.gender || null,
        genderProbability: detection.genderProbability || null
      }));
      
      dispatch(setDetectedFaces(serializedDetections));
      setIsDetectionActive(true);
      
      if (resizedDetections.length === 0) {
        setError('No faces detected in the image.');
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Error processing image. Please try a different image.');
    } finally {
      setProcessing(false);
    }
  };

  const clearImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    setFaceCount(0);
    setError(null);
    dispatch(setDetectedFaces([]));
    setIsDetectionActive(false);
  };

  return (
    <div className="w-full ">
      <p className="text-gray-600 mb-8 max-w-3xl">
        Upload an image to analyze it for faces. The system will detect faces, estimate age and gender, 
        and analyze facial expressions. All processing happens in your browser - no images are sent to any server.
      </p>

      <div className="bg-white rounded-lg overflow-hidden mb-10">
        <div className="">
          <div 
            ref={dropZoneRef}
            onClick={handleClickUpload}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 mb-6 transition-colors text-center cursor-pointer
              ${isDragging ? 'bg-blue-50 border-blue-400' : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'}`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange}
              disabled={processing}
            />
            
            <div className="flex flex-col items-center justify-center">
              <Upload className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Drag & drop your image here</h3>
              <p className="text-sm text-gray-500 mb-2">
                or click to browse files
              </p>
              <p className="text-xs text-gray-400">
                Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
              </p>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {selectedImage && (
            <div className="mt-6">
              <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={processImage} 
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Detect Faces
                    </>
                  )}
                </button>
                <button 
                  className="px-4 py-2 border border-red-500 text-red-500 rounded-md font-medium hover:bg-red-50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={clearImage}
                  disabled={processing}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Image
                </button>
              </div>
              
              <div className="relative my-5 bg-gray-100 rounded-lg overflow-hidden shadow-inner">
                {processing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                    <div className="bg-white rounded-md px-4 py-2 flex items-center shadow-lg">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Image...
                    </div>
                  </div>
                )}
                <img 
                  ref={imageRef} 
                  src={selectedImage} 
                  alt="Uploaded" 
                  className="max-w-full h-auto max-h-[500px] mx-auto"
                  onLoad={() => {
                    if (imageRef.current && canvasRef.current) {
                      canvasRef.current.width = imageRef.current.width;
                      canvasRef.current.height = imageRef.current.height;
                    }
                  }}
                />
                <canvas 
                  ref={canvasRef} 
                  className="absolute top-0 left-0 w-full h-full pointer-events-none" 
                />
              </div>
              
              {faceCount > 0 && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <strong>{faceCount}</strong> {faceCount === 1 ? 'face' : 'faces'} detected in the image.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {isDetectionActive && <FaceInfoPanel />}
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Tips for best results:</h3>
        <ul className="list-disc ml-5 text-blue-700 space-y-1">
          <li>Use images with clear, well-lit faces</li>
          <li>For multiple faces, ensure all faces are clearly visible</li>
          <li>The system works best with front-facing portraits</li>
          <li>Maximum file size is 5MB</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUploader; 