import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { BrowserMultiFormatReader } from "@zxing/library";

interface BarcodeScannerProps {
  onResult: (result: string) => void;
  onError: (error: Error) => void;
  onClose: () => void;
}

const BarcodeScanner = ({
  onResult,
  onError,
  onClose,
}: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    const startScanning = async () => {
      try {
        setIsScanning(true);
        setError("");

        // Создаем экземпляр сканера
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        // Получаем доступ к камере
        const videoDevices = await reader.listVideoInputDevices();
        if (videoDevices.length === 0) {
          throw new Error("Камера не найдена");
        }

        // Используем заднюю камеру, если доступна
        const backCamera =
          videoDevices.find(
            (device) =>
              device.label.toLowerCase().includes("back") ||
              device.label.toLowerCase().includes("rear"),
          ) || videoDevices[0];

        // Начинаем сканирование
        const result = await reader.decodeOnceFromVideoDevice(
          backCamera.deviceId,
          videoRef.current!,
        );

        if (result) {
          onResult(result.getText());
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Ошибка доступа к камере";
        setError(errorMessage);
        onError(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setIsScanning(false);
      }
    };

    startScanning();

    // Очистка при размонтировании
    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, [onResult, onError]);

  const handleClose = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Icon name="Camera" className="text-purple-600" />
              <span>Сканирование кода</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                autoPlay
                playsInline
              />
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-purple-500 rounded-lg w-48 h-32 relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-purple-500"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-purple-500"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-purple-500"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-purple-500"></div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div className="text-center text-sm text-gray-600">
              Наведите камеру на штрих-код или QR-код
            </div>

            <Button variant="outline" onClick={handleClose} className="w-full">
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BarcodeScanner;
