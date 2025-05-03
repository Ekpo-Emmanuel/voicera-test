'use client';

import { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setWebcamActive, setPermission, setFaceDetectionActive, setDetectedFaces } from '../store/slices/webcamSlice';
import { loadModels, detectFaces } from '../utils/faceDetection';
import FaceInfoPanel from './FaceInfoPanel';
import { Button } from "@/components/ui/button";
import { Camera, Play, Square, Pause, Scan, CircleAlert } from "lucide-react";

const WebcamComponent = () => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useDispatch();
  const { isActive, isFaceDetectionActive } = useSelector((state: RootState) => state.webcam);
  const [modelsLoading, setModelsLoading] = useState<boolean>(false);
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [detectionCount, setDetectionCount] = useState<number>(0);
  const [rawDetections, setRawDetections] = useState<any[]>([]);
  const [isBrowser, setIsBrowser] = useState<boolean>(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    const updateCanvasDimensions = () => {
      if (webcamRef.current && canvasRef.current) {
        const video = webcamRef.current;
        const videoWidth = video.videoWidth || video.clientWidth;
        const videoHeight = video.videoHeight || video.clientHeight;
        
        console.log('Updating canvas dimensions:', videoWidth, videoHeight);
        
        const canvas = canvasRef.current;
        canvas.width = videoWidth;
        canvas.height = videoHeight;
      }
    };

    if (webcamRef.current) {
      webcamRef.current.addEventListener('loadedmetadata', updateCanvasDimensions);
      webcamRef.current.addEventListener('resize', updateCanvasDimensions);
      
      if (webcamRef.current.readyState >= 2) {
        updateCanvasDimensions();
      }
    }

    return () => {
      if (webcamRef.current) {
        webcamRef.current.removeEventListener('loadedmetadata', updateCanvasDimensions);
        webcamRef.current.removeEventListener('resize', updateCanvasDimensions);
      }
    };
  }, [webcamRef.current, canvasRef.current, isActive]);

  useEffect(() => {
    const loadFaceApiModels = async () => {
      if (!isBrowser) return;
      
      try {
        setModelsLoading(true);
        setError(null);
        console.log('Starting to load face detection models...');
        const success = await loadModels();
        
        if (success) {
          console.log('Models loaded successfully');
          setModelsLoaded(true);
        } else {
          throw new Error('Failed to load models');
        }
      } catch (error) {
        console.error('Error loading face-api models:', error);
        setError('Failed to load face recognition models. Please refresh and try again.');
      } finally {
        setModelsLoading(false);
      }
    };

    loadFaceApiModels();
  }, [isBrowser]);

  useEffect(() => {
    return () => {
      if (isBrowser && webcamRef.current && webcamRef.current.srcObject) {
        const stream = webcamRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isBrowser]);

  const drawFaceBoxes = (canvas: HTMLCanvasElement, detections: any[]) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const lineWidth = Math.max(3, Math.min(5, Math.floor(canvas.width / 100)));
    const fontSize = Math.max(16, Math.min(30, Math.floor(canvas.width / 40)));
    const padding = Math.max(5, Math.min(10, Math.floor(canvas.width / 120)));
    
    detections.forEach((detection, index) => {
      if (!detection.detection || !detection.detection.box) return;
      
      const box = detection.detection.box;
      
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = 'red';
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      
      ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
      ctx.fillRect(box.x, box.y, box.width, box.height);
      
      const faceLabel = `FACE #${index + 1}`;
      ctx.font = `bold ${fontSize}px Arial`;
      const textMetrics = ctx.measureText(faceLabel);
      const textWidth = textMetrics.width + padding * 2;
      const textHeight = fontSize + padding;
      
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.fillRect(box.x, box.y - textHeight, textWidth, textHeight);
      
      ctx.fillStyle = 'white';
      ctx.fillText(faceLabel, box.x + padding, box.y - padding);
      
      if (detection.age && detection.gender) {
        const infoText = `${Math.round(detection.age)} years, ${detection.gender}`;
        const infoMetrics = ctx.measureText(infoText);
        const infoWidth = infoMetrics.width + padding * 2;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(
          box.x, 
          box.y + box.height, 
          infoWidth, 
          textHeight
        );
        
        ctx.fillStyle = 'white';
        ctx.fillText(
          infoText, 
          box.x + padding, 
          box.y + box.height + fontSize - padding/2
        );
      }
    });
  };

  useEffect(() => {
    let animationFrameId: number | null = null;
    let isDetecting = false;

    const runFaceDetection = async () => {
      if (isDetecting) return;
      
      if (
        webcamRef.current && 
        canvasRef.current &&
        isActive && 
        isFaceDetectionActive && 
        modelsLoaded
      ) {
        try {
          isDetecting = true;
          
          const { detections, displaySize } = await detectFaces(webcamRef.current, canvasRef.current);
          
          if (detections && Array.isArray(detections)) {
            setRawDetections(detections);
            setDetectionCount(detections.length);
            
            if (canvasRef.current) {
              drawFaceBoxes(canvasRef.current, detections);
            }

            try {
              const serialized = detections.map(detection => ({
                box: detection.detection && detection.detection.box ? {
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
              
              console.log('Serialized detections for Redux:', serialized);
              
              dispatch(setDetectedFaces(serialized));
            } catch (serializationError) {
              console.error('Error serializing detections:', serializationError);
            }
          }
          
          isDetecting = false;
          
          if (isActive && isFaceDetectionActive && modelsLoaded) {
            animationFrameId = requestAnimationFrame(runFaceDetection);
          }
        } catch (error) {
          console.error('Error in face detection loop:', error);
          isDetecting = false;
          
          if (isActive && isFaceDetectionActive && modelsLoaded) {
            setTimeout(() => {
              animationFrameId = requestAnimationFrame(runFaceDetection);
            }, 1000);
          }
        }
      } else if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        isDetecting = false;
      }
    };

    if (isActive && isFaceDetectionActive && modelsLoaded) {
      console.log('Face detection activated');
      animationFrameId = requestAnimationFrame(runFaceDetection);
    } else {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      
      if (!isFaceDetectionActive) {
        setDetectionCount(0);
      }
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isActive, isFaceDetectionActive, modelsLoaded, dispatch]);

  const handleVideoLoaded = () => {
    if (webcamRef.current && canvasRef.current) {
      console.log('Video loaded, dimensions:', webcamRef.current.videoWidth, webcamRef.current.videoHeight);
      
      const videoWidth = webcamRef.current.videoWidth || webcamRef.current.clientWidth;
      const videoHeight = webcamRef.current.videoHeight || webcamRef.current.clientHeight;
      
      console.log('Setting canvas dimensions immediately to:', videoWidth, videoHeight);
      
      if (canvasRef.current) {
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
      }
    }
  };

  const startWebcam = async () => {
    if (!isBrowser) {
      setError('Camera access is only available in browser environments');
      return;
    }
    
    try {
      setError(null);
      console.log('Requesting webcam access...');
      
      if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('BROWSER_COMPATIBILITY');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        console.log('Webcam started successfully');
        dispatch(setWebcamActive(true));
        dispatch(setPermission(true));
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      dispatch(setPermission(false));
      
      const error = err as { message?: string; name?: string };
      
      if (error.message === 'BROWSER_COMPATIBILITY') {
        setError('Camera API is not available in your browser or current environment. Please use a modern browser with HTTPS.');
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setError('Permission to access camera was denied. Please allow camera access to use this feature.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setError('No camera detected. Please connect a camera and try again.');
      } else {
        setError(`Camera error: ${error.message || 'Unknown error occurred'}`);
      }
    }
  };

  const stopWebcam = () => {
    if (webcamRef.current && webcamRef.current.srcObject) {
      const stream = webcamRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      webcamRef.current.srcObject = null;
      console.log('Webcam stopped');
      dispatch(setWebcamActive(false));
      dispatch(setFaceDetectionActive(false));
      setDetectionCount(0);
      setRawDetections([]);
    }
  };

  const toggleFaceDetection = () => {
    console.log('Toggling face detection:', !isFaceDetectionActive);
    
    if (isFaceDetectionActive) {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      
      dispatch(setDetectedFaces([]));
    }
    
    dispatch(setFaceDetectionActive(!isFaceDetectionActive));
  };

  return (
    <div className={`grid ${isFaceDetectionActive ? 'lg:grid-cols-[1.4fr_0.6fr]' : 'grid-cols-1'} gap-4`}>
      <div className="w-full max-w-4xl">
        <div className="w-full relative aspect-video rounded-lg overflow-hidden transition-transform bg-black">
          {isBrowser && (
            <>
              <video
                ref={webcamRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={handleVideoLoaded}
                onPlay={handleVideoLoaded}
                className={`w-full h-full object-cover bg-black block ${isActive ? '' : 'hidden'}`}
              />
              <canvas 
                ref={canvasRef} 
                className="absolute top-0 left-0 w-full h-full z-[30] pointer-events-none" 
              />
            </>
          )}

          {!isBrowser && (
            <div className="w-full h-full bg-white flex flex-col items-center justify-center rounded-lg text-gray-600 font-medium border">
              <CircleAlert className="w-12 h-12 mb-4 text-gray-500" />
              <p className='text-sm'>Camera features are only available in browser environments</p>
            </div>
          )}

          {isBrowser && !isActive && (
            <div className="w-full h-full bg-white flex flex-col items-center justify-center rounded-lg text-gray-600 font-medium border">
              <Camera className="w-12 h-12 mb-4 text-gray-500" />
              <p className='text-sm'>Click "Start Webcam" to activate your camera</p>
            </div>
          )}

          {isActive && isFaceDetectionActive && (
            <div className="absolute top-0 right-0 m-3 bg-black/70 text-white font-semibold rounded-full py-2 px-4 text-sm z-[100] flex items-center shadow-md">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Faces detected: {detectionCount}
            </div>
          )}
          
          {isActive && !isFaceDetectionActive && (
            <div className="absolute top-0 right-0 m-3 bg-black/70 text-white font-semibold rounded-full py-2 px-4 text-sm z-[100] flex items-center shadow-md">
              <span className="inline-block w-2 h-2 bg-amber-500 mr-2"></span>
              Detection paused
            </div>
          )}
        </div>

        <div className="mt-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center mb-4">
              <CircleAlert className='w-4 h-4 mr-2' />
              <span className='text-sm'>{error}</span>
            </div>
          )}

          {modelsLoading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md flex items-center mb-4">
              <svg className="animate-spin -ml-1 mr-4 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className='text-sm'>Loading face detection models... This may take a moment.</span>
            </div>
          )}

          {isBrowser && (
            <div className="flex flex-col sm:flex-row gap-3">
              {!isActive ? (
                <Button className="flex items-center justify-center" onClick={startWebcam} disabled={modelsLoading}>
                  <Play className="h-4 w-4" /> Start Webcam
                </Button>
              ) : (
                <>
                  <Button variant="destructive" className="flex items-center justify-center" onClick={stopWebcam}>
                    <Square className="h-4 w-4" /> Stop Webcam
                  </Button>
                  <Button 
                    variant={isFaceDetectionActive ? "outline" : "default"}
                    className="flex items-center justify-center"
                    onClick={toggleFaceDetection}
                    disabled={!modelsLoaded}
                  >
                    {isFaceDetectionActive ? (
                      <><Pause className="h-4 w-4" /> Pause Detection</>
                    ) : (
                      <><Scan className="h-4 w-4" /> Resume Detection</>
                    )}
                  </Button>
                </>
              )}
            </div>
          )}

          {isBrowser && isActive && isFaceDetectionActive && !detectionCount && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md flex items-center mt-4">
              <CircleAlert className='w-4 h-4 mr-2' />
              <span className='text-sm'>No faces detected. Please make sure your face is visible to the camera.</span>
            </div>
          )}
        </div>
      </div>
      {isFaceDetectionActive && <FaceInfoPanel />}
    </div>
  );
};

export default WebcamComponent; 