"use client";

import { useRef } from "react";

interface UploadBoxProps {
  label: string;
  onFileSelect: (file: File) => void;
  fileName?: string;
}

export default function UploadBox({ label, onFileSelect, fileName }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-label-caps text-slate-600 px-2">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="w-full h-32 bg-neu-bg rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform hover:border-amber-400"
        style={{ boxShadow: "inset 5px 5px 10px #D1D9E6, inset -5px -5px 10px #FFFFFF" }}
      >
        <div className="w-12 h-12 rounded-full bg-neu-bg neu-button flex items-center justify-center text-amber-500">
          <span className="material-symbols-outlined">photo_camera</span>
        </div>
        <span className="text-body-md font-medium text-slate-600">
          {fileName || "Choose Screenshot"}
        </span>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }} />
      </div>
    </div>
  );
}
