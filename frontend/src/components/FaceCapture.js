import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

const FaceCapture = ({ onCapture, buttonText = 'Capturar' }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [descriptor, setDescriptor] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        setReady(true);
      } catch (err) {
        console.error('Error cargando modelos:', err);
        alert('Error al cargar modelos faciales. Recarga la página.');
      }
    };
    init();
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      alert('No se pudo acceder a la cámara. Asegúrate de haber dado permiso y de que ninguna otra app la esté usando.');
    }
  };

  const captureFace = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (!ready) {
      alert('Los modelos aún se están cargando. Espera un momento.');
      return;
    }
    if (!video.videoWidth || !video.videoHeight) {
      alert('La cámara aún no está lista. Espera un momento y vuelve a intentar.');
      return;
    }
    setCapturing(true);
    try {
      const detections = await faceapi.detectSingleFace(
        video,
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
    } catch (err) {
      console.error('Error en detección facial:', err);
      alert('Error al procesar la imagen: ' + err.message);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {!ready && <p style={{ color: '#f59e0b' }}>⏳ Cargando modelos faciales...</p>}
      <div style={{ position: 'relative' }}>
        <video ref={videoRef} autoPlay muted style={{ width: 400, height: 300, borderRadius: '8px' }} />
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: 400, height: 300 }} />
      </div>
      <button onClick={captureFace} disabled={capturing || !ready} style={{ marginTop: '12px' }}>
        {capturing ? '⏳ Procesando...' : !ready ? '⏳ Cargando...' : buttonText}
      </button>
      {descriptor && <p style={{ color: '#22c55e', marginTop: '8px' }}>✅ Rostro capturado</p>}
    </div>
  );
};

export default FaceCapture;