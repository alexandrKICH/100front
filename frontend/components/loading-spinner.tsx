"use client"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function LoadingSpinner({ size = "md", text, className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} border-2 border-white/20 rounded-full animate-spin`}>
          <div className="absolute top-0 left-0 w-full h-full border-2 border-transparent border-t-white rounded-full animate-spin"></div>
        </div>
        <div
          className={`absolute inset-0 ${sizeClasses[size]} border-2 border-transparent border-t-purple-500 rounded-full animate-spin`}
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        ></div>
      </div>
      {text && <p className="text-white/70 text-sm animate-pulse">{text}</p>}
    </div>
  )
}
