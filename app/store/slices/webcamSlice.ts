import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DetectedFace {
  box?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  expressions?: Record<string, number>;
  age?: number | null;
  gender?: string | null;
  genderProbability?: number | null;
}

interface WebcamState {
  isActive: boolean;
  hasPermission: boolean | null;
  isFaceDetectionActive: boolean;
  detectedFaces: DetectedFace[];
}

const initialState: WebcamState = {
  isActive: false,
  hasPermission: null,
  isFaceDetectionActive: false,
  detectedFaces: [],
};

export const webcamSlice = createSlice({
  name: 'webcam',
  initialState,
  reducers: {
    setWebcamActive: (state, action: PayloadAction<boolean>) => {
      state.isActive = action.payload;
    },
    setPermission: (state, action: PayloadAction<boolean>) => {
      state.hasPermission = action.payload;
    },
    setFaceDetectionActive: (state, action: PayloadAction<boolean>) => {
      state.isFaceDetectionActive = action.payload;
    },
    setDetectedFaces: (state, action: PayloadAction<DetectedFace[]>) => {
      state.detectedFaces = action.payload;
    },
  },
});

export const {
  setWebcamActive,
  setPermission,
  setFaceDetectionActive,
  setDetectedFaces,
} = webcamSlice.actions;

export default webcamSlice.reducer; 