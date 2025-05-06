"use client";
import { useState } from "react";
import { Star } from "lucide-react";

const App = () => {
  const [liked, setLiked] = useState(false);

  const toggleLike = () => {
    setLiked(!liked);
  };

  return (
    <button onClick={toggleLike}>
      {liked ? (
        <Star className="text-foreground/75" fill="currentColor" />
      ) : (
        <Star className="text-foreground/75" />
      )}
    </button>
  );
};

export default App;
