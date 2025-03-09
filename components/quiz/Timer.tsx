import { useState, useEffect, memo } from "react";
import { formatTime } from "@/lib/utiles/quiz-utiles";

interface TimerProps {
  initialTime: number;
}

export const Timer = memo(({ initialTime }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(intervalId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [initialTime]);

  return (
    <div className="text-center border rounded-md py-1 px-3 dark:border-gray-700">
      {formatTime(timeLeft)}
    </div>
  );
});

Timer.displayName = "Timer";