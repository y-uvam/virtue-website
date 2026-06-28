import React, { useEffect, useRef } from "react";

export const ShootingStarsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Grid spacing matches the pixel grid in the target visual reference
    const spacing = 45;

    // Handle window resize dynamically
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    interface ShootingStar {
      x: number;
      y: number;
      dx: number;
      dy: number;
      speed: number;
      color: string;
      progress: number;
      maxLength: number;
    }

    const stars: ShootingStar[] = [];
    const maxStars = 10;

    const spawnStar = () => {
      const cols = Math.floor(width / spacing);
      const rows = Math.floor(height / spacing);
      if (cols <= 0 || rows <= 0) return;

      let gridX = 0;
      let gridY = 0;
      let found = false;

      // Restrict spawning to the diagonal belt (bottom-left to top-right)
      for (let attempt = 0; attempt < 100; attempt++) {
        const cx = Math.floor(Math.random() * cols) * spacing;
        const cy = Math.floor(Math.random() * rows) * spacing;
        // Normal distance from bottom-left to top-right diagonal line
        const dist = Math.abs((cx / width) + (cy / height) - 1.0);
        if (dist < 0.28) {
          gridX = cx;
          gridY = cy;
          found = true;
          break;
        }
      }

      if (!found) return;

      // Choose a random direction along grid tracks (horizontal or vertical)
      const directions = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 },
      ];
      const dir = directions[Math.floor(Math.random() * directions.length)];

      // Use exactly primaryLight (#0EA5E9, blue) and secondary (#B91C1C, red) colors
      const color = Math.random() > 0.55 ? "#0EA5E9" : "#B91C1C";

      stars.push({
        x: gridX,
        y: gridY,
        dx: dir.dx,
        dy: dir.dy,
        speed: 1.0 + Math.random() * 2.0,
        color,
        progress: 0,
        maxLength: 20 + Math.random() * 25,
      });
    };

    // Canvas animation loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Grid of Dots (only within the diagonal belt)
      const cols = Math.ceil(width / spacing);
      const rows = Math.ceil(height / spacing);

      ctx.fillStyle = "rgba(148, 163, 184, 0.15)"; // Soft slate gray dot outline
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * spacing;
          const y = j * spacing;

          // Restrict dots to the diagonal belt
          const dist = Math.abs((x / width) + (y / height) - 1.0);
          if (dist > 0.32) continue; // Skip dots outside the belt

          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Update and draw glowing shooting star segments
      for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        star.progress += star.speed;

        // Head position
        const headX = star.x + star.dx * star.progress;
        const headY = star.y + star.dy * star.progress;

        // Check if head of the star has wandered too far from the belt
        const headDist = Math.abs((headX / width) + (headY / height) - 1.0);
        if (headDist > 0.35) {
          stars.splice(i, 1);
          continue;
        }

        // Tail position
        const currentLength = Math.min(star.progress, star.maxLength);
        const tailX = headX - star.dx * currentLength;
        const tailY = headY - star.dy * currentLength;

        // Draw line trace
        ctx.strokeStyle = star.color;
        ctx.lineWidth = 1.0;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.stroke();

        // Remove star if it leaves canvas boundaries
        const margin = 50;
        if (
          headX < -margin ||
          headX > width + margin ||
          headY < -margin ||
          headY > height + margin
        ) {
          stars.splice(i, 1);
        }
      }

      // Automatically spawn stars to maintain quantity
      if (stars.length < maxStars && Math.random() < 0.05) {
        spawnStar();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    // Pre-populate stars within the belt
    for (let i = 0; i < 5; i++) {
      spawnStar();
    }

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default ShootingStarsBackground;
