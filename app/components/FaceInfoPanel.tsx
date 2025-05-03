'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, Smile, AlertCircle } from "lucide-react";

const FaceInfoPanel: React.FC = () => {
  const { detectedFaces, isFaceDetectionActive, isActive } = useSelector((state: RootState) => state.webcam);

  if (!isFaceDetectionActive) {
    return null;
  }

  const getDominantExpression = (expressions: Record<string, number>) => {
    if (!expressions) return null;
    
    const dominant = Object.keys(expressions).reduce((a, b) => 
      expressions[a] > expressions[b] ? a : b, '');
    
    return dominant.charAt(0).toUpperCase() + dominant.slice(1);
  };

  const getExpressionEmoji = (expression: string): string => {
    const emojiMap: Record<string, string> = {
      'neutral': '😐',
      'happy': '😊',
      'sad': '😢',
      'angry': '😠',
      'fearful': '😨',
      'disgusted': '🤢',
      'surprised': '😲'
    };
    
    return emojiMap[expression.toLowerCase()] || '';
  };

  const formatConfidence = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getExpressionColor = (expression: string): string => {
    const colorMap: Record<string, string> = {
      'neutral': 'bg-slate-500',
      'happy': 'bg-green-500',
      'sad': 'bg-blue-500',
      'angry': 'bg-red-500',
      'fearful': 'bg-purple-500',
      'disgusted': 'bg-amber-500',
      'surprised': 'bg-pink-500'
    };
    
    return colorMap[expression.toLowerCase()] || 'bg-gray-500';
  };

  return (
    <div className="w-full bg-white rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        Face Detection Results
        <Badge variant="outline" className="ml-2">{detectedFaces?.length || 0}</Badge>
      </h3>
      
      <div className="grid grid-cols-1 gap-4">
        {(!detectedFaces || detectedFaces.length === 0) ? (
          <Card className="overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-10 w-10 text-slate-400 mb-2" />
              <h4 className="text-lg font-medium text-slate-700">No faces detected</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-md">
                Try adjusting lighting conditions, camera angle, or upload a different image.
              </p>
            </CardContent>
          </Card>
        ) : (
          detectedFaces.map((face, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-muted py-2">
                <CardTitle className="text-sm font-medium">Face #{index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {face.age && face.gender && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold mb-2 flex items-center">
                      <User className="h-4 w-4 mr-1" /> Person Details
                    </h5>
                    <div className="flex items-center mb-3">
                      <div className="flex justify-center items-center bg-muted rounded-full mr-3 h-10 w-10">
                        {face.gender.toLowerCase() === 'male' ? '👨' : '👩'}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{Math.round(face.age)} years old</div>
                        <div className="flex items-center">
                          <span className="capitalize text-xs text-muted-foreground">{face.gender}</span>
                          {face.genderProbability && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {formatConfidence(face.genderProbability)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {face.expressions && (
                  <div>
                    <h5 className="text-sm font-semibold mb-2 flex items-center">
                      <Smile className="h-4 w-4 mr-1" /> Emotion Analysis
                      {getDominantExpression(face.expressions) && (
                        <span className="ml-2 text-lg" aria-hidden="true">
                          {getExpressionEmoji(getDominantExpression(face.expressions) || '')}
                        </span>
                      )}
                    </h5>
                    
                    <div className="mb-4 pb-2 border-b">
                      <div className="flex items-center mb-1">
                        <Badge className="mr-2 bg-green-500">Dominant</Badge>
                        <div className="font-medium capitalize text-sm">
                          {getDominantExpression(face.expressions)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {Object.entries(face.expressions)
                        .sort(([, valueA], [, valueB]) => Number(valueB) - Number(valueA))
                        .map(([expression, value]) => (
                          <div key={expression} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="capitalize text-xs text-muted-foreground">{expression}</span>
                              <Badge variant="outline" className="text-xs">{formatConfidence(Number(value))}</Badge>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${face.expressions && expression === getDominantExpression(face.expressions)?.toLowerCase() 
                                  ? getExpressionColor(expression) 
                                  : "bg-slate-400"}`}
                                style={{ width: `${Number(value) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FaceInfoPanel; 