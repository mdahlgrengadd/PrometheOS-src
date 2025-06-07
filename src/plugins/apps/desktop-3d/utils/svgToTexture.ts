import { LucideIcon } from 'lucide-react';
import * as THREE from 'three';

/**
 * Synchronous version that creates a texture with geometric icon representations
 * This is the main function used by the IconInstances component
 */
export const createIconTextureSync = (
  IconComponent: LucideIcon,
  size = 256,
  iconSize = 128,
  backgroundColor = "rgba(74, 158, 255, 0.1)", // Light blue background
  iconColor = "#ffffff"
): THREE.Texture => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("Could not get 2D rendering context");
  }

  // Create background
  if (backgroundColor !== "transparent") {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);
  }
  
  // Get icon name for geometric representation
  const iconName = IconComponent.displayName || IconComponent.name || "Icon";
  
  // Setup drawing context
  ctx.fillStyle = iconColor;
  ctx.strokeStyle = iconColor;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  
  const centerX = size / 2;
  const centerY = size / 2;
  const iconRadius = iconSize / 2;
    // Draw geometric representation based on icon name
  drawSimpleIcon(ctx, iconName, centerX, centerY, iconRadius);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.flipY = true; // Fix upside down issue
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
};

/**
 * Draws a simple geometric representation of common icons
 */
const drawSimpleIcon = (
  ctx: CanvasRenderingContext2D,
  iconName: string,
  centerX: number,
  centerY: number,
  radius: number
) => {
  const size = radius * 0.8; // Make icons larger (was 0.6)
  
  switch (iconName.toLowerCase()) {
    case 'filetext':
    case 'file':
      // Document icon
      ctx.fillRect(centerX - size/2, centerY - size/2, size, size * 1.2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(centerX - size/3, centerY - size/4, size/1.5, 2);
      ctx.fillRect(centerX - size/3, centerY - size/8, size/1.5, 2);
      ctx.fillRect(centerX - size/3, centerY, size/1.5, 2);
      break;
      
    case 'calculator':
      // Calculator icon
      ctx.fillRect(centerX - size/2, centerY - size/2, size, size * 1.2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      // Draw calculator buttons
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const x = centerX - size/3 + col * size/4;
          const y = centerY - size/6 + row * size/4;
          ctx.fillRect(x, y, size/8, size/8);
        }
      }
      break;
      
    case 'image':
    case 'imageicon':
      // Image icon
      ctx.fillRect(centerX - size/2, centerY - size/2, size, size);
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.beginPath();
      ctx.arc(centerX - size/4, centerY - size/4, size/8, 0, Math.PI * 2);
      ctx.fill();
      // Mountain shape
      ctx.beginPath();
      ctx.moveTo(centerX - size/2, centerY + size/2);
      ctx.lineTo(centerX - size/4, centerY);
      ctx.lineTo(centerX, centerY + size/4);
      ctx.lineTo(centerX + size/2, centerY + size/2);
      ctx.fill();
      break;
      
    case 'terminal':
      // Terminal icon
      ctx.fillRect(centerX - size/2, centerY - size/2, size, size);
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      // Draw prompt cursor
      ctx.fillRect(centerX - size/3, centerY - size/6, 2, size/4);
      // Draw some text lines
      ctx.fillRect(centerX - size/4, centerY - size/6, size/3, 2);
      ctx.fillRect(centerX - size/6, centerY, size/4, 2);
      break;
      
    case 'settings':
      // Settings gear icon
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.beginPath();
      // Draw gear teeth
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.rect(-size/8, -size/2, size/4, size/6);
      }
      ctx.fill();
      // Inner circle
      ctx.beginPath();
      ctx.arc(0, 0, size/3, 0, Math.PI * 2);
      ctx.fill();
      // Center hole
      ctx.fillStyle = "rgba(74, 158, 255, 0.1)";
      ctx.beginPath();
      ctx.arc(0, 0, size/6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
      
    case 'music':
      // Music note icon
      ctx.beginPath();
      ctx.arc(centerX - size/4, centerY + size/4, size/6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(centerX - size/6, centerY - size/2, 3, size);
      // Flag
      ctx.beginPath();
      ctx.moveTo(centerX - size/6, centerY - size/2);
      ctx.lineTo(centerX + size/4, centerY - size/4);
      ctx.lineTo(centerX + size/4, centerY);
      ctx.lineTo(centerX - size/6, centerY - size/4);
      ctx.fill();
      break;
      
    case 'folder':
      // Folder icon
      ctx.fillRect(centerX - size/2, centerY - size/4, size, size/2);
      ctx.fillRect(centerX - size/2, centerY - size/3, size/3, size/6);
      break;
      
    case 'mail':
      // Email icon
      ctx.fillRect(centerX - size/2, centerY - size/3, size, size/1.5);
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.beginPath();
      ctx.moveTo(centerX - size/2, centerY - size/3);
      ctx.lineTo(centerX, centerY);
      ctx.lineTo(centerX + size/2, centerY - size/3);
      ctx.fill();
      break;
      
    case 'globe':
    case 'web':
      // Globe icon
      ctx.beginPath();
      ctx.arc(centerX, centerY, size/2, 0, Math.PI * 2);
      ctx.stroke();
      // Meridians
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, size/4, size/2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, size/2, size/4, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
      
    case 'calendar':
      // Calendar icon
      ctx.fillRect(centerX - size/2, centerY - size/2, size, size);
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      // Calendar grid
      for (let i = 1; i < 3; i++) {
        ctx.fillRect(centerX - size/2, centerY - size/2 + i * size/3, size, 2);
        ctx.fillRect(centerX - size/2 + i * size/3, centerY - size/2, 2, size);
      }
      break;
      
    case 'share2':
      // Share icon - connecting circles
      ctx.beginPath();
      ctx.arc(centerX + size/3, centerY - size/3, size/8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX - size/3, centerY, size/8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX + size/3, centerY + size/3, size/8, 0, Math.PI * 2);
      ctx.fill();
      // Connecting lines
      ctx.beginPath();
      ctx.moveTo(centerX - size/5, centerY - size/12);
      ctx.lineTo(centerX + size/5, centerY - size/4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX - size/5, centerY + size/12);
      ctx.lineTo(centerX + size/5, centerY + size/4);
      ctx.stroke();
      break;
      
    case 'camera':
      // Camera icon
      ctx.fillRect(centerX - size/2, centerY - size/3, size, size/1.5);
      ctx.beginPath();
      ctx.arc(centerX, centerY, size/4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillRect(centerX - size/3, centerY - size/2, size/3, size/6);
      break;
      
    case 'gamepad2':
      // Gamepad icon
      ctx.fillRect(centerX - size/2, centerY - size/4, size, size/2);
      // D-pad
      ctx.fillRect(centerX - size/3, centerY - size/8, size/12, size/4);
      ctx.fillRect(centerX - size/2.5, centerY - size/12, size/4, size/6);
      // Buttons
      ctx.beginPath();
      ctx.arc(centerX + size/4, centerY - size/8, size/12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX + size/3, centerY + size/8, size/12, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'messagesquare':
      // Message/Chat icon
      ctx.fillRect(centerX - size/2, centerY - size/3, size, size/1.5);
      // Chat tail
      ctx.beginPath();
      ctx.moveTo(centerX - size/4, centerY + size/6);
      ctx.lineTo(centerX - size/3, centerY + size/3);
      ctx.lineTo(centerX - size/6, centerY + size/6);
      ctx.fill();
      break;
      
    case 'code':
      // Code brackets
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX - size/4, centerY - size/3);
      ctx.lineTo(centerX - size/2, centerY);
      ctx.lineTo(centerX - size/4, centerY + size/3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX + size/4, centerY - size/3);
      ctx.lineTo(centerX + size/2, centerY);
      ctx.lineTo(centerX + size/4, centerY + size/3);
      ctx.stroke();
      break;
      
    case 'map':
      // Map icon
      ctx.beginPath();
      ctx.moveTo(centerX - size/2, centerY + size/3);
      ctx.lineTo(centerX - size/6, centerY - size/3);
      ctx.lineTo(centerX + size/6, centerY + size/3);
      ctx.lineTo(centerX + size/2, centerY - size/3);
      ctx.stroke();
      // Fold lines
      ctx.beginPath();
      ctx.moveTo(centerX - size/6, centerY - size/3);
      ctx.lineTo(centerX - size/6, centerY + size/3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX + size/6, centerY - size/3);
      ctx.lineTo(centerX + size/6, centerY + size/3);
      ctx.stroke();
      break;
      
    case 'stickynote':
      // Sticky note
      ctx.fillRect(centerX - size/2, centerY - size/2, size, size);
      // Folded corner
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.beginPath();
      ctx.moveTo(centerX + size/2, centerY - size/2);
      ctx.lineTo(centerX + size/4, centerY - size/2);
      ctx.lineTo(centerX + size/2, centerY - size/4);
      ctx.fill();
      break;
      
    case 'shoppingbag':
      // Shopping bag
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX - size/3, centerY - size/4);
      ctx.lineTo(centerX - size/2, centerY + size/2);
      ctx.lineTo(centerX + size/2, centerY + size/2);
      ctx.lineTo(centerX + size/3, centerY - size/4);
      ctx.stroke();
      // Handle
      ctx.beginPath();
      ctx.arc(centerX, centerY - size/6, size/4, 0, Math.PI);
      ctx.stroke();
      break;
      
    case 'fileimage':
      // File with image
      ctx.fillRect(centerX - size/2, centerY - size/2, size, size * 1.2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      // Image preview
      ctx.fillRect(centerX - size/3, centerY - size/6, size/1.5, size/3);
      ctx.beginPath();
      ctx.arc(centerX - size/6, centerY - size/12, size/12, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'zap':
      // Lightning bolt
      ctx.beginPath();
      ctx.moveTo(centerX - size/6, centerY - size/2);
      ctx.lineTo(centerX - size/3, centerY);
      ctx.lineTo(centerX, centerY - size/6);
      ctx.lineTo(centerX + size/6, centerY + size/2);
      ctx.lineTo(centerX + size/3, centerY);
      ctx.lineTo(centerX, centerY + size/6);
      ctx.closePath();
      ctx.fill();
      break;
      
    default:
      // Default icon - simple circle with letter
      ctx.beginPath();
      ctx.arc(centerX, centerY, size/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(74, 158, 255, 0.8)";
      ctx.font = `${size/2}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(iconName.charAt(0).toUpperCase(), centerX, centerY);
      break;
  }
};

/**
 * Creates a simple texture with text fallback
 */
export const createTextTexture = (
  text: string,
  size = 256,
  backgroundColor = "rgba(74, 158, 255, 0.2)",
  textColor = "#ffffff"
): THREE.Texture => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("Could not get 2D rendering context");
  }

  // Background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, size, size);
  
  // Text
  ctx.fillStyle = textColor;
  ctx.font = `bold ${size / 6}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, size / 2, size / 2);
    const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.flipY = true; // Fix upside down issue
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  
  return texture;
};
