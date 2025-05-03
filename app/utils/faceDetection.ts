'use client';

let faceapi: any = null;
let modelsLoaded = false;

const initFaceApi = async () => {
  if (faceapi) return faceapi;
  
  try {
    faceapi = await import('face-api.js');
    return faceapi;
  } catch (error) {
    console.error('Error importing face-api.js:', error);
    throw error;
  }
};

export const serializeDetections = (detections: any[]) => {
  if (!detections || !Array.isArray(detections)) return [];
  
  return detections.map(detection => {
    try {
      const serializedDetection = {
        box: detection.detection ? {
          x: detection.detection.box.x,
          y: detection.detection.box.y,
          width: detection.detection.box.width,
          height: detection.detection.box.height
        } : null,
        landmarks: detection.landmarks ? {
          positions: detection.landmarks.positions.map((pos: any) => ({ x: pos.x, y: pos.y }))
        } : null,
        expressions: detection.expressions ? { ...detection.expressions } : null,
        age: detection.age,
        gender: detection.gender,
        genderProbability: detection.genderProbability
      };
      return serializedDetection;
    } catch (error) {
      console.error('Error serializing detection:', error);
      return null;
    }
  }).filter(Boolean);
};

export const loadModels = async () => {
  try {
    if (modelsLoaded) return true;
    
    if (typeof window === 'undefined') {
      console.log('Cannot load models in SSR context');
      return false;
    }

    await initFaceApi();
    
    await new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve(true);
      }
    });

    const MODEL_URL = '/models';
    console.log('Loading face-api.js models from:', MODEL_URL);
    
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      console.log('Loaded tinyFaceDetector model');
      
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      console.log('Loaded faceLandmark68Net model');
      
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      console.log('Loaded faceRecognitionNet model');
      
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      console.log('Loaded faceExpressionNet model');
      
      await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
      console.log('Loaded ageGenderNet model');
    } catch (modelError) {
      console.error('Error loading specific model:', modelError);
      throw modelError;
    }

    modelsLoaded = true;
    console.log('All face-api.js models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading face-api.js models:', error);
    return false;
  }
};

export const detectFaces = async (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
  if (!video || !canvas) return { detections: [], displaySize: { width: 0, height: 0 } };
  
  if (typeof window === 'undefined') {
    return { detections: [], displaySize: { width: 0, height: 0 } };
  }
  
  if (!modelsLoaded) {
    const success = await loadModels();
    if (!success) {
      console.error('Failed to load models in detectFaces');
      return { detections: [], displaySize: { width: 0, height: 0 } };
    }
  }

  try {
    const videoWidth = video.videoWidth || video.clientWidth;
    const videoHeight = video.videoHeight || video.clientHeight;
    const displaySize = { width: videoWidth, height: videoHeight };
    
    if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      faceapi.matchDimensions(canvas, displaySize);
    }

    const detectionOptions = new faceapi.TinyFaceDetectorOptions({ 
      inputSize: 160, 
      scoreThreshold: 0.4 
    });
    
    if (video.readyState !== 4) {
      console.log('Video not ready yet');
      return { detections: [], displaySize };
    }

    try {
      const detections = await faceapi.detectAllFaces(video, detectionOptions)
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      
      return { detections: resizedDetections, displaySize };
    } catch (detectionError) {
      console.error('Error in face detection:', detectionError);
      return { detections: [], displaySize };
    }
  } catch (error) {
    console.error('Error in detectFaces:', error);
    return { detections: [], displaySize: { width: 0, height: 0 } };
  }
};

export const drawDetections = (
  canvas: HTMLCanvasElement,
  detections: any[],
  displaySize: { width: number; height: number }
) => {
  if (!canvas || !detections || detections.length === 0 || !faceapi) return;

  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const lineWidth = Math.max(3, Math.min(5, Math.floor(canvas.width / 100)));
    const fontSize = Math.max(16, Math.min(30, Math.floor(canvas.width / 40)));
    const padding = Math.max(5, Math.min(10, Math.floor(canvas.width / 120)));

    detections.forEach((detection, index) => {
      if (!detection.detection || !detection.detection.box) {
        return;
      }

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
  } catch (error) {
    console.error('Error drawing detections:', error);
  }
};