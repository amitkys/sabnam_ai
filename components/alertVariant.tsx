// import React, { useState } from "react";
// import { Maximize, X, Monitor } from "lucide-react";

// // Enhanced Alert components (using the improved version)
// const alertVariants = {
//   default: "bg-background text-foreground border-border",
//   destructive:
//     "border-red-200 bg-red-50 text-red-900 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-200",
//   warning:
//     "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200",
//   success:
//     "border-green-200 bg-green-50 text-green-900 dark:border-green-800/50 dark:bg-green-950/30 dark:text-green-200",
//   info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800/50 dark:bg-blue-950/30 dark:text-blue-200",
// };

// const Alert = ({ className = "", variant = "default", children, ...props }) => (
//   <div
//     className={`relative w-full rounded-lg border px-3 sm:px-4 py-2 sm:py-3 text-sm transition-all duration-200 ${alertVariants[variant]} ${className}`}
//     role="alert"
//     {...props}
//   >
//     {children}
//   </div>
// );

// const AlertTitle = ({ className = "", children, ...props }) => (
//   <h5
//     className={`mb-1 font-semibold leading-none tracking-tight text-sm sm:text-base ${className}`}
//     {...props}
//   >
//     {children}
//   </h5>
// );

// const Button = ({
//   size = "default",
//   variant = "default",
//   className = "",
//   children,
//   ...props
// }) => {
//   const sizeClasses = {
//     sm: "px-2 sm:px-3 py-1.5 text-xs sm:text-sm",
//     default: "px-3 sm:px-4 py-2 text-sm",
//     lg: "px-4 sm:px-6 py-2.5 sm:py-3 text-base",
//   };

//   const variantClasses = {
//     default: "bg-primary text-primary-foreground hover:bg-primary/90",
//     ghost: "hover:bg-accent hover:text-accent-foreground",
//     outline:
//       "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
//   };

//   return (
//     <button
//       className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// };

// // Main responsive component
// export default function ResponsiveFullscreenAlert() {
//   const [showFullscreenAlert, setShowFullscreenAlert] = useState(true);

//   const enterFullscreen = () => {
//     if (document.documentElement.requestFullscreen) {
//       document.documentElement.requestFullscreen();
//     } else if (document.documentElement.webkitRequestFullscreen) {
//       document.documentElement.webkitRequestFullscreen();
//     } else if (document.documentElement.msRequestFullscreen) {
//       document.documentElement.msRequestFullscreen();
//     }
//     setShowFullscreenAlert(false);
//   };

//   if (!showFullscreenAlert) return null;

//   return (
//     <div className="p-4 max-w-4xl mx-auto">
//       {/* Main Alert */}
//       <Alert
//         className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6"
//         variant="info"
//       >
//         <div className="flex items-start sm:items-center gap-3">
//           <Monitor className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5 sm:mt-0" />
//           <div className="min-w-0 flex-1">
//             <AlertTitle>Enhance Your Experience</AlertTitle>
//             <div className="text-xs sm:text-sm opacity-80 mt-1">
//               Switch to fullscreen mode for a better viewing experience
//             </div>
//           </div>
//         </div>

//         <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:shrink-0">
//           <Button
//             className="w-full sm:w-auto justify-center sm:justify-start"
//             size="sm"
//             onClick={enterFullscreen}
//           >
//             <Maximize className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
//             <span className="sm:inline">Go Fullscreen</span>
//           </Button>
//           <Button
//             className="w-full sm:w-auto justify-center sm:justify-start sm:px-2"
//             size="sm"
//             variant="ghost"
//             onClick={() => setShowFullscreenAlert(false)}
//           >
//             <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-0" />
//             <span className="sm:hidden ml-1.5">Dismiss</span>
//           </Button>
//         </div>
//       </Alert>

//       {/* Demo of other alert variants */}
//       <div className="space-y-4">
//         <Alert className="flex items-center justify-between" variant="success">
//           <div className="flex items-center gap-3">
//             <div className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
//             <div>
//               <AlertTitle>Success!</AlertTitle>
//               <div className="text-xs sm:text-sm opacity-80">
//                 Your changes have been saved successfully.
//               </div>
//             </div>
//           </div>
//           <Button className="hidden sm:flex" size="sm" variant="ghost">
//             <X className="h-4 w-4" />
//           </Button>
//         </Alert>

//         <Alert className="flex flex-col sm:flex-row gap-3" variant="warning">
//           <div className="flex items-start gap-3 flex-1">
//             <div className="w-2 h-2 bg-amber-500 rounded-full shrink-0 mt-2" />
//             <div className="min-w-0">
//               <AlertTitle>Warning</AlertTitle>
//               <div className="text-xs sm:text-sm opacity-80 mt-1">
//                 This action cannot be undone. Please review your changes before
//                 proceeding.
//               </div>
//             </div>
//           </div>
//           <div className="flex gap-2 sm:shrink-0">
//             <Button className="flex-1 sm:flex-none" size="sm" variant="outline">
//               Review
//             </Button>
//             <Button className="flex-1 sm:flex-none" size="sm">
//               Continue
//             </Button>
//           </div>
//         </Alert>

//         <Alert
//           className="flex flex-col sm:flex-row sm:items-center gap-3"
//           variant="destructive"
//         >
//           <div className="flex items-start sm:items-center gap-3 flex-1">
//             <div className="w-2 h-2 bg-red-500 rounded-full shrink-0 mt-0.5 sm:mt-0" />
//             <div className="min-w-0">
//               <AlertTitle>Error</AlertTitle>
//               <div className="text-xs sm:text-sm opacity-80 mt-1">
//                 Something went wrong. Please try again or contact support.
//               </div>
//             </div>
//           </div>
//           <Button className="w-full sm:w-auto" size="sm" variant="outline">
//             Try Again
//           </Button>
//         </Alert>
//       </div>
//     </div>
//   );
// }
