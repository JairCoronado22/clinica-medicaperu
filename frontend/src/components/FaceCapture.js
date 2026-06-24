import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

const FaceCapture = ({ onCapture, label = 'Capturar rostro', buttonText = 'Capturar' }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [descriptor, setDescriptor] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    };
    loadModels();
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const captureFace = async () => {
    if (!videoRef.current) return;
    const detections = await faceapi.detectSingleFace(
      videoRef.current,
      new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
    ).withFaceLandmarks().withFaceDescriptor();

    if (detections) {
      const desc = Array.from(detections.descriptor);
      setDescriptor(desc);
      if (onCapture) onCapture(desc);
      // Dibujar en canvas para feedback
      const canvas = canvasRef.current;
      const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);
      const resized = faceapi.resizeResults(detections, displaySize);
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceLandmarks(canvas, resized);
    } else {
      alert('No se detectó ningún rostro. Intenta de nuevo.');
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ width: 400, height: 300 }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', width: 400, height: 300 }} />
      <button onClick={captureFace}>{buttonText}</button>
      {descriptor && <p>Rostro capturado</p>}
    </div>
  );
};

export default FaceCapture;