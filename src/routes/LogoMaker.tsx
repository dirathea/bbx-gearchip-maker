import { useRef, useState, useCallback } from "react";
import {
  RotateCw,
  RotateCcw,
  Download,
  ImagePlus,
  X,
  ZoomIn,
  Move,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPalette } from "@/lib/palette";

type SpinDirection = "right" | "left";

interface LogoConfig {
  discColor: string;
  ringAccentColor: string;
  sweepColor: string;
  textColor: string;
  bgColor: string;
  spinDirection: SpinDirection;
  logoRotation: number;
  centerImage: string | null;
  imageScale: number;
  imageX: number;
  imageY: number;
}

const PRESETS = [
  { name: "Green", disc: "#459867", accent: "#377f55", sweep: "#fff", text: "#fff", bg: "#0a0a0a" },
  { name: "Gold", disc: "#99822d", accent: "#377f55", sweep: "#fff", text: "#181716", bg: "#0a0a0a" },
  { name: "Red", disc: "#99822d", accent: "#d22c1d", sweep: "#fff", text: "#181716", bg: "#0a0a0a" },
  { name: "Crimson", disc: "#7d1e1d", accent: "#d22c1d", sweep: "#fff", text: "#fff", bg: "#0a0a0a" },
  { name: "Blue", disc: "#204882", accent: "#509edd", sweep: "#fff", text: "#fff", bg: "#0a0a0a" },
  { name: "Yellow", disc: "#edd742", accent: "#d22c1d", sweep: "#fff", text: "#181716", bg: "#0a0a0a" },
  { name: "Purple", disc: "#6b21a8", accent: "#9333ea", sweep: "#fff", text: "#fff", bg: "#0a0a0a" },
  { name: "Black", disc: "#181716", accent: "#dc2626", sweep: "#fff", text: "#fff", bg: "#0a0a0a" },
];

const DEFAULT_CONFIG: LogoConfig = {
  discColor: "#459867",
  ringAccentColor: "#377f55",
  sweepColor: "#ffffff",
  textColor: "#ffffff",
  bgColor: "#0a0a0a",
  spinDirection: "right",
  logoRotation: 0,
  centerImage: null,
  imageScale: 1,
  imageX: 0,
  imageY: 0,
};

// SVG viewBox dimensions
const VIEW = 516;
const CENTER = VIEW / 2; // 258
const DISC_R = 186;

/**
 * Beyblade X Gear Bit Logo - based on official SVG template.
 */
function BeybladeLogo({
  config,
  onImageDrag,
}: {
  config: LogoConfig;
  onImageDrag?: (dx: number, dy: number) => void;
}) {
  const {
    discColor, ringAccentColor, sweepColor, textColor, bgColor,
    spinDirection, logoRotation, centerImage, imageScale, imageX, imageY,
  } = config;
  const flip = spinDirection === "left";

  // Drag handling on the SVG
  const dragRef = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const getSvgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const transformed = pt.matrixTransform(ctm.inverse());
    return { x: transformed.x, y: transformed.y };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!centerImage) return;
    e.preventDefault();
    dragRef.current = true;
    const pt = getSvgPoint(e.clientX, e.clientY);
    lastPos.current = pt;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [centerImage, getSvgPoint]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current || !onImageDrag) return;
    e.preventDefault();
    const pt = getSvgPoint(e.clientX, e.clientY);
    const dx = pt.x - lastPos.current.x;
    const dy = pt.y - lastPos.current.y;
    lastPos.current = pt;
    onImageDrag(dx, dy);
  }, [getSvgPoint, onImageDrag]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  }, []);

  // Image dimensions in SVG units - base size covers the disc, scale multiplies
  const baseSize = DISC_R * 2 * 0.75; // 75% of disc by default, user scales up
  const imgSize = baseSize * imageScale;
  const imgX = CENTER - imgSize / 2 + imageX;
  const imgY = CENTER - imgSize / 2 + imageY;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className="h-full w-full touch-none select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* === ROTATABLE LOGO FRAME === */}
      <g transform={`rotate(${logoRotation} ${CENTER} ${CENTER})`}>
      <defs>
        {/* Clip everything to the outer circle */}
        <clipPath id="logoClip">
          <circle cx={CENTER} cy={CENTER} r={DISC_R} />
        </clipPath>
        {/* Clip user image to full logo circle */}
        <clipPath id="imageClip">
          <circle cx={CENTER} cy={CENTER} r={VIEW / 2} />
        </clipPath>
      </defs>

      {/* Background */}
      <rect width={VIEW} height={VIEW} rx={VIEW / 2} fill={bgColor} />

      {/* === FRAME (ring, disc, sweep - always same position) === */}
      {/* Disc fill + sweep (clipped) */}
      <g clipPath="url(#logoClip)">
        <circle cx={CENTER} cy={CENTER} r={DISC_R} fill={discColor} />
        <path
          d="M248,.19v62.06c-22.92,1.14-45.18,6.23-66.29,15.16-23.34,9.87-44.3,24-62.3,42s-32.13,38.96-42,62.3c-10.23,24.17-15.41,49.84-15.41,76.29,0,31.11,7.39,61.75,21.45,89.23l-45.09,26.03-8.66,5.01c.82,1.57,1.66,3.12,2.52,4.67.76,1.37,1.53,2.73,2.31,4.08l.04-.02,62.33-35.99c-1.67-2.88-3.26-5.81-4.77-8.79-12.88-25.28-20.13-53.91-20.13-84.22,0-99.36,77.93-180.54,176-185.73,3.31-.18,6.64-.27,10-.27V0c-3.35,0-6.68.06-10,.19Z"
          fill={sweepColor}
          opacity="0.85"
        />
      </g>

      {/* Outer black ring (~270° arc) */}
      <path
        d="M516,258c0,142.49-115.51,258-258,258-95.49,0-178.86-51.87-223.47-128.98l62.37-36.01c32.16,55.59,92.26,92.99,161.1,92.99,102.72,0,186-83.28,186-186,0-33.88-9.06-65.65-24.9-93.01-32.16-55.59-92.26-92.99-161.1-92.99V0c95.49,0,178.86,51.87,223.47,128.98,21.96,37.95,34.53,82.02,34.53,129.02Z"
        fill="#181716"
      />

      {/* Quarter accent arc (top-left) */}
      <path
        d="M258,0v72c-102.72,0-186,83.28-186,186,0,33.88,9.06,65.65,24.9,93.01l-62.37,36.01C12.57,349.07,0,305,0,258,0,115.51,115.51,0,258,0Z"
        fill={ringAccentColor}
      />


      {/* === SPIN-SPECIFIC ELEMENTS (fully decoupled) === */}
      {flip ? (
        // ── LEFT SPIN ──
        <>
          {/* Left border stroke: same as right spin (12oc → curve left → 8oc) */}
          <path
            d="M258,0 L258,72c-102.72,0-186,83.28-186,186,0,33.88,9.06,65.65,24.9,93.01 L34.53,387.02"
            fill="none"
            stroke={sweepColor}
            strokeWidth="8"
            strokeLinecap="butt"
          />

          {/* Connecting arc: 12oc → 4oc (moved from bottom to right side) */}
          <path
            d="M258,53 A205,205 0 0 1 435.5,360.5"
            fill="none"
            stroke={sweepColor}
            strokeWidth="10"
            strokeMiterlimit="10"
            opacity="1"
          />
        </>
      ) : (
        // ── RIGHT SPIN ──
        <>
          {/* Border stroke: 12oc → curve left → 8oc */}
          <path
            d="M258,0 L258,72c-102.72,0-186,83.28-186,186,0,33.88,9.06,65.65,24.9,93.01 L34.53,387.02"
            fill="none"
            stroke={sweepColor}
            strokeWidth="8"
            strokeLinecap="butt"
          />

          {/* Connecting arc: 8oc → 4oc along bottom */}
          <path
            d="M435.61,360.54c-8.87,15.31-19.81,29.56-32.65,42.41-38.72,38.72-90.2,60.04-144.96,60.04s-106.24-21.32-144.96-60.04c-12.85-12.85-23.78-27.1-32.65-42.41"
            fill="none"
            stroke={sweepColor}
            strokeWidth="10"
            strokeMiterlimit="10"
            opacity="1"
          />
        </>
      )}

      {/* === TEXT (shared, always readable) === */}
      <g fill={textColor} transform="matrix(1.025,0,0,1.025,-6.45,-6.45)">
          <path d="M196.09,32.49l9.71,27.94-18.57,6.46c-6.91,2.4-11.09,1.84-13.37-4.72-.7-2-.09-4.12.95-5.33-2.91.51-6.04-1.72-7.14-4.87-2.04-5.86-.32-9.48,8.89-12.69l19.52-6.79ZM192.94,46.04l-1.78-5.11-12.52,4.35c-3.25,1.13-4.08,2.32-3.47,4.07s1.84,2.22,5.24,1.04l12.52-4.35ZM196.7,56.86l-1.67-4.81-11.51,4c-2.2.77-2.71,2.06-2.2,3.52.5,1.45,1.67,2.06,3.82,1.31l11.56-4.02Z" />
          <path d="M154.65,48.33l14.68,25.67-26.13,14.94-3.13-5.47,19.64-11.23-2.47-4.32-16.1,9.21-3.16-5.52,16.1-9.21-2.76-4.83-19.64,11.23-3.16-5.52,26.13-14.94Z" />
          <path d="M110.34,77.35l6.98,8.26,24.46,3.9-7.29,6.16-16.24-3.21.33,16.65-7.29,6.16.36-24.87-6.98-8.26,5.67-4.79Z" />
          <path d="M86.44,99.16l22.98,18.61-12.38,15.28c-4.6,5.68-8.45,7.41-13.85,3.04-1.65-1.33-2.25-3.46-2-5.03-2.21,1.97-6.04,1.73-8.63-.37-4.82-3.9-5.27-7.89.86-15.46l13.01-16.06ZM90.91,112.33l-4.2-3.4-8.34,10.3c-2.17,2.68-2.24,4.12-.8,5.28s2.73.92,5-1.88l8.34-10.3ZM99.81,119.53l-3.95-3.2-7.67,9.47c-1.47,1.81-1.21,3.18-.02,4.15s2.5.87,3.94-.9l7.71-9.51Z" />
          <path d="M59.85,134.2l25.88,14.32-3.59,6.49-20.36-11.27-10.19,18.41-5.52-3.05,13.78-24.9Z" />
          <path d="M44.67,177.23l-3.88-4.64,2.9-8.76,21.3,26.82-2.05,6.18-33.1,8.8,9.15-27.64,5.43,6.62-3.38,10.21,15.09-3.64-11.47-13.94Z" />
          <path d="M29.2,208.75l29.32,3.92-2.37,17.7c-1.54,11.51-5.92,19.9-17.37,18.37-11.45-1.53-13.48-10.78-11.94-22.29l2.37-17.7ZM33.14,227.29c-.73,5.46-1.03,12.54,6.69,13.57s9.29-5.87,10.02-11.33l1.38-10.35-16.71-2.23-1.38,10.35Z" />
          <path d="M24.33,254.16l29.54-1.27,1.29,30.07-6.3.27-.97-22.61-4.98.21.8,18.53-6.35.27-.8-18.53-5.56.24.97,22.61-6.35.27-1.29-30.07Z" />
      </g>
      {/* X letter — black fill with white outline */}
      <path d="M32.87,331.53l11.41-16.62-18.18-8.83-3.39-12.76,25.69,13.73,14.96-23.69,3.39,12.76-10.81,15.68,17.15,8.17,3.43,12.9-24.79-13.27-15.44,24.83-3.43-12.9Z" fill="#181716" stroke={sweepColor} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" transform="matrix(1.025,0,0,1.025,-6.45,-6.45)" />

      </g>


      {/* === IMAGE (NOT rotated, clipped to outer circle) === */}
      {centerImage && (
        <image
          href={centerImage}
          x={imgX}
          y={imgY}
          width={imgSize}
          height={imgSize}
          preserveAspectRatio="xMidYMid meet"
          clipPath="url(#imageClip)"
          style={{ cursor: dragRef.current ? "grabbing" : "grab" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      )}

      {/* === SPEED ARROWS (on top of image, rotated with logo) === */}
      <g transform={`rotate(${logoRotation} ${CENTER} ${CENTER})`}>
        {flip ? (
          <g transform="matrix(0.5, 0.866, 0.866, -0.5, -94.43, 163.57)">
            <g fill="none" stroke={sweepColor} strokeWidth="33" strokeMiterlimit="10">
              <path d="M335.95,50.22c.62.23,1.25.47,1.87.71" />
              <path d="M345.23,53.94c7.38,3.16,14.56,6.71,21.51,10.62" strokeDasharray="4 6 10 8" />
              <path d="M370.21,66.56c44.9,26.37,79.7,68.09,97.19,117.95" strokeDasharray="4 8 4 6 10 8" />
              <path d="M468.69,188.31c.21.63.42,1.27.62,1.9" />
            </g>
            <polygon points="479.18,276 494.18,246 464.18,246" fill={sweepColor} />
            <polygon points="473.5,312.78 492.73,285.31 463.06,280.9" fill={sweepColor} />
            <polygon points="476.99,237.66 486.85,205.6 457.26,210.54" fill={sweepColor} />
          </g>
        ) : (
          <g>
            <g fill="none" stroke={sweepColor} strokeWidth="33" strokeMiterlimit="10">
              <path d="M335.95,50.22c.62.23,1.25.47,1.87.71" />
              <path d="M345.23,53.94c7.38,3.16,14.56,6.71,21.51,10.62" strokeDasharray="4 6 10 8" />
              <path d="M370.21,66.56c44.9,26.37,79.7,68.09,97.19,117.95" strokeDasharray="4 8 4 6 10 8" />
              <path d="M468.69,188.31c.21.63.42,1.27.62,1.9" />
            </g>
            <polygon points="479.18,276 494.18,246 464.18,246" fill={sweepColor} />
            <polygon points="473.5,312.78 492.73,285.31 463.06,280.9" fill={sweepColor} />
            <polygon points="476.99,237.66 486.85,205.6 457.26,210.54" fill={sweepColor} />
          </g>
        )}
      </g>


    </svg>
  );
}

function ColorInput({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-neutral-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs uppercase text-neutral-500">{value}</span>
        <label className="relative cursor-pointer">
          <div className="h-8 w-8 rounded-lg border border-neutral-700" style={{ backgroundColor: value }} />
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
        </label>
      </div>
    </div>
  );
}

export function LogoMaker() {
  const [config, setConfig] = useState<LogoConfig>(DEFAULT_CONFIG);
  const [activeColorTab, setActiveColorTab] = useState<"presets" | "custom">("presets");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback(
    <K extends keyof LogoConfig>(key: K, value: LogoConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const [autoDetecting, setAutoDetecting] = useState(false);
  const [printSize, setPrintSize] = useState("UX");
  const [showPrintHelp, setShowPrintHelp] = useState(false);

  const applyAutoTheme = useCallback(async (imageSrc: string) => {
    setAutoDetecting(true);
    try {
      const palette = await getPalette(imageSrc, { count: 5 });
      if (palette.length < 2) return;

      const luminance = (rgb: number[]) =>
        (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
      const isLight = luminance(palette[0].rgb) > 0.5;

      setConfig((prev) => ({
        ...prev,
        discColor: palette[0].hex,
        ringAccentColor: palette[2]?.hex || palette[1].hex,
        textColor: isLight ? "#181716" : "#ffffff",
        bgColor: isLight ? "#fafafa" : "#0a0a0a",
      }));
    } finally {
      setAutoDetecting(false);
    }
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setConfig((prev) => ({
        ...prev,
        centerImage: src,
        imageScale: 1,
        imageX: 0,
        imageY: 0,
      }));
      // Auto-detect theme on upload
      applyAutoTheme(src);
    };
    reader.readAsDataURL(file);
  }, [applyAutoTheme]);

  const handleImageDrag = useCallback((dx: number, dy: number) => {
    setConfig((prev) => ({
      ...prev,
      imageX: prev.imageX + dx,
      imageY: prev.imageY + dy,
    }));
  }, []);



  const handleDownload = useCallback(() => {
    const svg = document.querySelector("svg[viewBox='0 0 516 516']");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1024, 1024);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        link.download = "beyblade-x-logo.png";
        link.href = URL.createObjectURL(blob);
        link.click();
      }, "image/png");
    };
    img.src = url;
  }, []);

  const handleSvgDownload = useCallback(() => {
    const svg = document.querySelector("svg[viewBox='0 0 516 516']");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.download = "beyblade-x-logo.svg";
    link.href = URL.createObjectURL(blob);
    link.click();
  }, []);

  const handlePrintDownload = useCallback((type: string) => {
    const sizeMap: Record<string, number> = { BX: 16, UX: 17, CX: 16 };
    const sizeMm = sizeMap[type] || 17;
    const svg = document.querySelector("svg[viewBox='0 0 516 516']");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    // sizeMm + 2mm bleed, at 300 DPI
    const totalMm = sizeMm + 2;
    const px = Math.round((totalMm / 25.4) * 300);
    const canvas = document.createElement("canvas");
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, px, px);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, px, px);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        link.download = `beyblade-x-logo-print-${sizeMm}mm-300dpi.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
      }, "image/png");
    };
    img.src = url;
  }, []);

  return (
    <div className="mx-auto max-w-md min-h-dvh flex flex-col">
      <header className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight">⚡ BBX Chip Maker</h1>
          <a
            href="https://buymeacoffee.com/dirathea"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors"
          >
            ☕ Buy me a coffee
          </a>
        </div>
        <button onClick={() => setConfig(DEFAULT_CONFIG)} className="text-xs text-neutral-500 hover:text-neutral-300">
          Reset
        </button>
      </header>

      {/* Logo Preview */}
      <div className="px-6 py-8 flex justify-center">
        <div className="aspect-square w-full max-w-[320px]">
          <BeybladeLogo config={config} onImageDrag={handleImageDrag} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 px-5 pb-6 space-y-5">
        {/* Spin Direction */}
        <div>
          <div className="text-sm font-medium mb-2 text-neutral-300">Spin Direction</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => update("spinDirection", "right")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all border",
                config.spinDirection === "right" ? "bg-red-600 text-white border-red-500" : "bg-neutral-900 text-neutral-400 border-neutral-800"
              )}
            >
              <RotateCw size={18} /> Right Spin
            </button>
            <button
              onClick={() => update("spinDirection", "left")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all border",
                config.spinDirection === "left" ? "bg-blue-600 text-white border-blue-500" : "bg-neutral-900 text-neutral-400 border-neutral-800"
              )}
            >
              <RotateCcw size={18} /> Left Spin
            </button>
          </div>
        </div>

        {/* Logo Rotation */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-300 flex items-center gap-2">
              <RotateCw size={16} /> Logo Rotation
            </span>
            <span className="font-mono text-xs text-neutral-500">{config.logoRotation}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={config.logoRotation}
            onChange={(e) => update("logoRotation", parseInt(e.target.value))}
            className="w-full accent-red-500"
          />
        </div>

        {/* Center Image */}
        <div>
          <div className="text-sm font-medium mb-2 text-neutral-300">Center Image</div>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-neutral-900 border border-neutral-800 py-3 text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-all"
            >
              <ImagePlus size={18} /> {config.centerImage ? "Change Image" : "Upload Image"}
            </button>
            {config.centerImage && (
              <button
                onClick={() => update("centerImage", null)}
                className="rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-3 text-neutral-400 hover:text-red-400 transition-all"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Image Controls - only show when image is uploaded */}
        {config.centerImage && (
          <div className="space-y-4 rounded-xl bg-neutral-900/50 p-4 border border-neutral-800">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Move size={14} /> Drag image on logo to reposition
            </div>
            {/* Scale slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400 flex items-center gap-2">
                  <ZoomIn size={16} /> Scale
                </span>
                <span className="font-mono text-xs text-neutral-500">{config.imageScale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.25"
                max="4"
                step="0.05"
                value={config.imageScale}
                onChange={(e) => update("imageScale", parseFloat(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
            {/* Position reset */}
            <button
              onClick={() => { update("imageX", 0); update("imageY", 0); }}
              className="w-full text-xs text-neutral-500 hover:text-neutral-300 py-1"
            >
              Center Position
            </button>
            {/* Auto-detect theme from image */}
            <button
              onClick={() => config.centerImage && applyAutoTheme(config.centerImage)}
              disabled={autoDetecting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600/20 border border-purple-800 hover:bg-purple-600/30 disabled:opacity-50 py-2 text-xs font-medium text-purple-300 transition-all"
            >
              <Wand2 size={14} />
              {autoDetecting ? "Detecting..." : "Auto-Detect Theme"}
            </button>
          </div>
        )}

        {/* Colors */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-neutral-300">Colors</div>
            <div className="flex gap-1 rounded-lg bg-neutral-900 p-0.5">
              <button
                onClick={() => setActiveColorTab("presets")}
                className={cn("rounded-md px-3 py-1 text-xs font-medium transition-all", activeColorTab === "presets" ? "bg-neutral-700 text-white" : "text-neutral-500")}
              >
                Presets
              </button>
              <button
                onClick={() => setActiveColorTab("custom")}
                className={cn("rounded-md px-3 py-1 text-xs font-medium transition-all", activeColorTab === "custom" ? "bg-neutral-700 text-white" : "text-neutral-500")}
              >
                Custom
              </button>
            </div>
          </div>

          {activeColorTab === "presets" ? (
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setConfig((prev) => ({ ...prev, discColor: preset.disc, ringAccentColor: preset.accent, sweepColor: preset.sweep, textColor: preset.text }))}
                  className={cn("flex flex-col items-center gap-1 rounded-lg p-2 border transition-all", config.discColor === preset.disc ? "border-white bg-neutral-900" : "border-neutral-800 hover:border-neutral-700")}
                >
                  <div className="h-8 w-8 rounded-full border border-neutral-700" style={{ backgroundColor: preset.disc }} />
                  <span className="text-[10px] text-neutral-500">{preset.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3 rounded-xl bg-neutral-900/50 p-4 border border-neutral-800">
              <ColorInput label="Disc" value={config.discColor} onChange={(v) => update("discColor", v)} />
              <ColorInput label="Accent Ring" value={config.ringAccentColor} onChange={(v) => update("ringAccentColor", v)} />
              <ColorInput label="Sweep Lines" value={config.sweepColor} onChange={(v) => update("sweepColor", v)} />
              <ColorInput label="Text" value={config.textColor} onChange={(v) => update("textColor", v)} />
              <ColorInput label="Background" value={config.bgColor} onChange={(v) => update("bgColor", v)} />
            </div>
          )}
        </div>

        {/* Downloads */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <select
              value={printSize}
              onChange={(e) => setPrintSize(e.target.value)}
              className="flex-1 rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2.5 text-xs text-neutral-400"
            >
              <option value="BX">BX (Basic)</option>
              <option value="UX">UX (Unique)</option>
              <option value="CX">CX (Custom)</option>
            </select>
            <button
              onClick={() => setShowPrintHelp(true)}
              className="rounded-xl bg-neutral-900 border border-neutral-800 px-3 py-2.5 text-xs text-neutral-500 hover:text-neutral-300"
            >
              ?
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-500 py-3 text-xs font-bold text-white transition-all"
            >
              <Download size={16} /> PNG
            </button>
            <button
              onClick={() => handlePrintDownload(printSize)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 py-3 text-xs font-medium text-neutral-300 transition-all"
            >
              <Download size={16} /> Print
            </button>
            <button
              onClick={handleSvgDownload}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 py-3 text-xs font-medium text-neutral-300 transition-all"
            >
              <Download size={16} /> SVG
            </button>
          </div>
        </div>

        {/* Print Help Modal */}
        {showPrintHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowPrintHelp(false)}>
            <div className="mx-4 max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-5" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-200">Print Sizes</h3>
                <button onClick={() => setShowPrintHelp(false)} className="text-neutral-500 hover:text-neutral-300">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-2 text-xs text-neutral-400">
                <div className="flex justify-between"><span className="font-medium text-neutral-300">BX (Basic)</span><span>16mm diameter (0.63")</span></div>
                <div className="flex justify-between"><span className="font-medium text-neutral-300">UX (Unique)</span><span>17mm diameter (0.67")</span></div>
                <div className="flex justify-between"><span className="font-medium text-neutral-300">CX (Custom)</span><span>16mm diameter (0.63")</span></div>
              </div>
              <p className="mt-4 text-xs text-neutral-500">
                Print Ready PNG includes 2mm bleed at 300 DPI with white background. For professional printing, use SVG Vector format.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
