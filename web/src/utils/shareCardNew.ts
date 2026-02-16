export async function generateShareCard(
  achievement: {
    icon: string;
    name: string;
    description: string;
  }
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Card dimensions (Instagram square)
  canvas.width = 1080;
  canvas.height = 1080;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#10b981'); // primary green
  gradient.addColorStop(1, '#059669'); // darker green
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // White card
  ctx.fillStyle = 'white';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;
  roundRect(ctx, 120, 200, 840, 680, 40);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Achievement icon (large emoji)
  ctx.font = '200px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(achievement.icon, canvas.width / 2, 480);

  // "Achievement Unlocked" text
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 40px Inter, system-ui, sans-serif';
  ctx.fillText('ACHIEVEMENT UNLOCKED', canvas.width / 2, 580);

  // Achievement name
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 60px Inter, system-ui, sans-serif';
  ctx.fillText(achievement.name, canvas.width / 2, 670);

  // Achievement description
  ctx.fillStyle = '#6b7280';
  ctx.font = '36px Inter, system-ui, sans-serif';
  ctx.fillText(achievement.description, canvas.width / 2, 730);

  // Logo/branding at bottom
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 32px Inter, system-ui, sans-serif';
  ctx.fillText('🌱 The 30 Club', canvas.width / 2, 820);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

// Helper to draw rounded rectangles
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}