import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";

interface UPIQRCodeProps {
  link: string;
  refId: string;
}

export default function UPIQRCode({ link, refId }: UPIQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = () => {
    const canvas = document.querySelector(`#upi-qr-${refId}`) as HTMLCanvasElement;
    if (!canvas) return;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = `UPI_${refId}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center gap-3 p-2">
      <QRCodeCanvas
        id={`upi-qr-${refId}`}
        value={link}
        size={180}
        includeMargin
      />
      <button
        onClick={handleDownload}
        className="rounded-lg bg-emerald-600 px-4 py-3 text-white text-sm hover:bg-emerald-700 touch-friendly min-h-[48px] min-w-[120px]"
      >
        Download QR
      </button>
    </div>
  );
}
