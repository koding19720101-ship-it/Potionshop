import React, { useRef, useEffect, useState } from 'react';
import { Ingredient, PhysicalIngredient } from '../types';
import { INGREDIENTS, blendColors } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Hammer, Trash2, Sparkles, Move } from 'lucide-react';

interface MortarCanvasProps {
  cuttingBoard: { [id: string]: number };
  onRemoveFromBoard: (id: string) => void;
  mortarEssence: { [id: string]: number };
  setMortarEssence: React.Dispatch<React.SetStateAction<{ [id: string]: number }>>;
  onPourToCauldron: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
}

export default function MortarCanvas({
  cuttingBoard,
  onRemoveFromBoard,
  mortarEssence,
  setMortarEssence,
  onPourToCauldron,
}: MortarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Physical items inside the mortar (Side View)
  const [physicalItems, setPhysicalItems] = useState<PhysicalIngredient[]>([]);
  
  // Pestle (절구공이) side-view position & dragging
  const pestlePos = useRef({ x: 150, y: 80 });
  const lastPestlePos = useRef({ x: 150, y: 80 });
  const isDraggingPestle = useRef(false);
  const [isPestleActive, setIsPestleActive] = useState(false);

  // Dragging states for individual herbs
  const mousePos = useRef({ x: 0, y: 0 });
  const draggingItemId = useRef<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Particles for grinding/crushing effects
  const particles = useRef<Particle[]>([]);

  // Mortar bowl geometry (Side-View Hemisphere)
  // mCenter represents the center of the hemisphere circle
  const mortarCenter = useRef({ x: 150, y: 130 });
  const mortarRadius = 85; // inner hemisphere radius

  // Track resizing to center the mortar inside the canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 300;
      
      // Position the mortar in the center of the workshop panel
      mortarCenter.current = { x: rect.width / 2, y: 130 };
      pestlePos.current = { x: rect.width / 2, y: 70 };
      lastPestlePos.current = { x: rect.width / 2, y: 70 };
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Drop an ingredient from the table into the mortar bowl
  const dropIngredient = (ing: Ingredient) => {
    if ((cuttingBoard[ing.id] || 0) <= 0) return;

    onRemoveFromBoard(ing.id);

    // Drop from top of the bowl with slight offset
    const startX = mortarCenter.current.x + (Math.random() * 20 - 10);
    const startY = 15; // drop from top center

    const newItem: PhysicalIngredient = {
      id: `${ing.id}-${Date.now()}-${Math.random()}`,
      ingredientId: ing.id,
      x: startX,
      y: startY,
      vx: (Math.random() * 0.4 - 0.2), // gentle initial side-to-side drift
      vy: 0.5, // gentle downward drop velocity
      radius: 16,
      color: ing.color,
      emoji: ing.emoji,
      crushProgress: 0,
      rotation: Math.random() * Math.PI * 2,
      angularVelocity: (Math.random() * 0.02 - 0.01), // gentle rotational spin
      isInsideMortar: false, // starts outside!
    };

    setPhysicalItems((prev) => [...prev, newItem]);
    createSplash(startX, startY, ing.color, 5);
  };

  // Create physical dust/liquid particles when grinding
  const createSplash = (x: number, y: number, color: string, count = 10) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 0.5;
      particles.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5, // slightly float upwards like dust
        radius: Math.random() * 3.5 + 1.2,
        color,
        alpha: 1.0,
        life: Math.random() * 25 + 15,
      });
    }
  };

  // Main 60FPS physics loop (Side-view physics with gravity & bowl container boundaries)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const updatePhysics = () => {
      const mCenter = mortarCenter.current;
      const r = mortarRadius;

      // 1. Update particles
      particles.current = particles.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= 1;
        p.alpha = Math.max(0, p.life / 35);
        return p.life > 0;
      });

      // Calculate pestle velocity vector
      const pestleVx = pestlePos.current.x - lastPestlePos.current.x;
      const pestleVy = pestlePos.current.y - lastPestlePos.current.y;
      const pestleSpeed = Math.sqrt(pestleVx * pestleVx + pestleVy * pestleVy);

      // Save current pestle pos as last for next tick
      lastPestlePos.current = { ...pestlePos.current };

      // 2. Update physical ingredients (Side-view with gravity & collisions)
      setPhysicalItems((prevItems) => {
        let itemsChanged = false;
        const updated = prevItems.map((item) => {
          // If this specific herb is currently being dragged by the mouse/touch, follow cursor
          if (draggingItemId.current === item.id) {
            itemsChanged = true;
            const targetX = mousePos.current.x - dragOffset.current.x;
            const targetY = mousePos.current.y - dragOffset.current.y;
            
            // Constrain mouse drag inside the canvas bounds to prevent going off-screen
            const clampedX = Math.max(item.radius, Math.min(canvas.width - item.radius, targetX));
            const clampedY = Math.max(item.radius, Math.min(canvas.height - item.radius, targetY));

            const nvx = (clampedX - item.x) * 0.45;
            const nvy = (clampedY - item.y) * 0.45;

            // Check if dragged inside mortar
            const isInside = (clampedX >= mCenter.x - r && clampedX <= mCenter.x + r && clampedY >= mCenter.y - 15);

            if (item.isPowderClump && clampedX < 45) {
              setTimeout(() => {
                onPourToCauldron();
              }, 0);
            }

            return {
              ...item,
              x: clampedX,
              y: clampedY,
              vx: nvx,
              vy: nvy,
              isInsideMortar: isInside,
            };
          }

          // Otherwise, apply normal gravity and physics:
          let nvy = item.vy + 0.14; // gentler, less heavy gravity pull
          let nvx = item.vx * 0.95;
          let nx = item.x + nvx;
          let ny = item.y + nvy;
          let nrot = item.rotation + item.angularVelocity;

          const isInside = !!item.isInsideMortar;

          if (isInside) {
            // CONSTRAINED INSIDE THE MORTAR BOWL
            const dx = nx - mCenter.x;
            const dy = ny - mCenter.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = r - item.radius;

            // Inside the lower hemisphere
            if (ny >= mCenter.y && dist > maxDist) {
              itemsChanged = true;
              const normX = dx / (dist || 1);
              const normY = dy / (dist || 1);
              
              nx = mCenter.x + normX * maxDist;
              ny = mCenter.y + normY * maxDist;

              const dot = nvx * normX + nvy * normY;
              nvx = (nvx - 2 * dot * normX) * 0.2;
              nvy = (nvy - 2 * dot * normY) * 0.2;

              nvx *= 0.85;
              nvy *= 0.85;
            }

            // Left & Right container vertical rim walls above mCenter.y
            if (ny < mCenter.y) {
              const leftRimX = mCenter.x - r + item.radius;
              const rightRimX = mCenter.x + r - item.radius;
              if (nx < leftRimX) {
                nx = leftRimX;
                nvx = -nvx * 0.2;
                itemsChanged = true;
              } else if (nx > rightRimX) {
                nx = rightRimX;
                nvx = -nvx * 0.2;
                itemsChanged = true;
              }

              // Prevent flying out of the top rim unless dragged out
              const topRim = mCenter.y - 15;
              if (ny < topRim) {
                ny = topRim;
                nvy = -nvy * 0.2;
                itemsChanged = true;
              }
            }

            // Collision with heavy Pestle Head (circle collision in side view)
            const pX = pestlePos.current.x;
            const pY = pestlePos.current.y;
            const pdx = nx - pX;
            const pdy = ny - pY;
            const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
            const pestleRadius = 26;
            const minPestleDist = item.radius + pestleRadius;

            if (pdist < minPestleDist) {
              itemsChanged = true;
              const pnormX = pdx / (pdist || 1);
              const pnormY = pdy / (pdist || 1);
              
              nx = pX + pnormX * minPestleDist;
              ny = pY + pnormY * minPestleDist;

              nvx = pnormX * (pestleSpeed * 0.3 + 1.2) + (Math.random() * 0.8 - 0.4);
              nvy = pnormY * (pestleSpeed * 0.3 + 1.2) + (Math.random() * 0.8 - 0.4);

              // Grinding / Squishing logic: pressed between wooden pestle and mortar wall
              const isAgainstWall = (ny >= mCenter.y && dist >= maxDist - 12);
              if (isAgainstWall && !item.isPowderClump) {
                const grindAmount = isDraggingPestle.current ? (pestleSpeed * 0.24 + 1.2) : 0.6;
                const prevProgress = item.crushProgress;
                item.crushProgress = Math.min(100, item.crushProgress + grindAmount);

                if (Math.floor(item.crushProgress / 20) > Math.floor(prevProgress / 20)) {
                  createSplash(item.x, item.y, item.color, 4);
                }
              }
            }
          } else {
            // OUTSIDE MORTAR BOWL (FALLS ON WORKBENCH / WOOD TABLE SURFACE)
            const tableY = canvas.height - item.radius - 10;

            // Table floor collision
            if (ny >= tableY) {
              ny = tableY;
              nvy = -nvy * 0.15; // light bounce
              nvx *= 0.85; // roll friction
              itemsChanged = true;
            }

            // Fall into the top mouth opening of the mortar
            if (nx >= mCenter.x - r + 5 && nx <= mCenter.x + r - 5 && ny >= mCenter.y - 15 && ny < mCenter.y) {
              return {
                ...item,
                isInsideMortar: true,
                x: nx,
                y: ny,
                vx: nvx,
                vy: nvy,
                rotation: nrot,
              };
            }

            // Collide with the OUTER stone/wood walls of the mortar bowl
            const dx = nx - mCenter.x;
            const dy = ny - mCenter.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const outerR = r + 12; // outer edge of bowl

            if (ny >= mCenter.y) {
              // Outer semicircle bowl surface
              if (dist < outerR + item.radius) {
                itemsChanged = true;
                const normX = dx / (dist || 1);
                const normY = dy / (dist || 1);
                nx = mCenter.x + normX * (outerR + item.radius);
                ny = mCenter.y + normY * (outerR + item.radius);
                const dot = nvx * normX + nvy * normY;
                nvx = (nvx - 2 * dot * normX) * 0.2;
                nvy = (nvy - 2 * dot * normY) * 0.2;
              }
            } else if (ny >= mCenter.y - 15) {
              // Vertical outer sides
              const leftOuter = mCenter.x - outerR - item.radius;
              const rightOuter = mCenter.x + outerR + item.radius;

              if (nx > leftOuter && nx < mCenter.x) {
                nx = leftOuter;
                nvx = -nvx * 0.2;
                itemsChanged = true;
              } else if (nx < rightOuter && nx > mCenter.x) {
                nx = rightOuter;
                nvx = -nvx * 0.2;
                itemsChanged = true;
              }
            }

            // Canvas boundaries
            if (nx < item.radius) {
              nx = item.radius;
              nvx = -nvx * 0.2;
              itemsChanged = true;
              if (item.isPowderClump) {
                setTimeout(() => {
                  onPourToCauldron();
                }, 0);
              }
            } else if (nx > canvas.width - item.radius) {
              nx = canvas.width - item.radius;
              nvx = -nvx * 0.2;
              itemsChanged = true;
            }
          }

          return {
            ...item,
            x: nx,
            y: ny,
            vx: nvx,
            vy: nvy,
            rotation: nrot,
          };
        });

        // Ball-to-ball elastic collisions
        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const b1 = updated[i];
            const b2 = updated[j];
            
            // Only collide with each other if both are inside, or both are outside
            if (!!b1.isInsideMortar !== !!b2.isInsideMortar) continue;

            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = b1.radius + b2.radius;

            if (dist < minDist) {
              itemsChanged = true;
              const overlap = minDist - dist;
              const nx = dx / (dist || 1);
              const ny = dy / (dist || 1);

              b1.x -= nx * overlap * 0.5;
              b1.y -= ny * overlap * 0.5;
              b2.x += nx * overlap * 0.5;
              b2.y += ny * overlap * 0.5;

              const kx = b1.vx - b2.vx;
              const ky = b1.vy - b2.vy;
              const p = nx * kx + ny * ky;

              b1.vx -= p * nx * 0.5;
              b1.vy -= p * ny * 0.5;
              b2.vx += p * nx * 0.5;
              b2.vy += p * ny * 0.5;
            }
          }
        }

        // Transform fully ground herbs into physical powder clumps
        const updatedWithClumps = updated.map((item) => {
          if (item.crushProgress >= 100 && !item.isPowderClump) {
            setMortarEssence((prev) => {
              const currentCount = prev[item.ingredientId] || 0;
              return {
                ...prev,
                [item.ingredientId]: currentCount + 1,
              };
            });
            createSplash(item.x, item.y, item.color, 15);
            return {
              ...item,
              id: `${item.ingredientId}-powder-${Date.now()}-${Math.random()}`,
              isPowderClump: true,
              crushProgress: 0,
              radius: 12, // smaller compacted clump
              emoji: '✨', // sparkle powder
              rotation: Math.random() * Math.PI * 2,
              angularVelocity: (Math.random() * 0.04 - 0.02),
            };
          }
          return item;
        });

        return updatedWithClumps;
      });
    };

    const draw = () => {
      const mCenter = mortarCenter.current;
      const r = mortarRadius;

      // Clear with transparency
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- Draw SIDE-VIEW Mortar Bowl (Clean U-shaped Bowl) ---
      // 1. Soft shadow cast by the mortar on the table
      ctx.beginPath();
      ctx.ellipse(mCenter.x, mCenter.y + r + 12, r - 10, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fill();

      // 2. Thick Outer body of mortar (Clean, elegant U-Shape silhouette with NO extra background stones)
      ctx.beginPath();
      // Start top-left rim
      ctx.moveTo(mCenter.x - r - 14, mCenter.y - 15);
      // Top-right rim straight line
      ctx.lineTo(mCenter.x + r + 14, mCenter.y - 15);
      // Straight line down to the beginning of the curve (y = mCenter.y)
      ctx.lineTo(mCenter.x + r + 14, mCenter.y);
      // Outer arc around the bottom (radius r + 14)
      ctx.arc(mCenter.x, mCenter.y, r + 14, 0, Math.PI, false);
      // Straight line back up to top-left rim
      ctx.lineTo(mCenter.x - r - 14, mCenter.y - 15);
      ctx.closePath();
      
      ctx.fillStyle = '#6e4a2b'; // Polished rich wood/terracotta body to match desk/workbench
      ctx.strokeStyle = '#3e2410'; // Deep dark boundary border
      ctx.lineWidth = 4;
      ctx.fill();
      ctx.stroke();

      // 3. Inner deep dark cavity/hemisphere (where herbs sit)
      ctx.beginPath();
      ctx.moveTo(mCenter.x - r, mCenter.y - 15);
      ctx.lineTo(mCenter.x + r, mCenter.y - 15);
      ctx.lineTo(mCenter.x + r, mCenter.y);
      ctx.arc(mCenter.x, mCenter.y, r, 0, Math.PI, false);
      ctx.lineTo(mCenter.x - r, mCenter.y - 15);
      ctx.closePath();
      ctx.fillStyle = '#22150b'; // Deep shadow interior
      ctx.fill();

      // 4. Draw accumulating ground herb powder at the bottom
      if (totalMortarEssenceCount > 0) {
        ctx.save();
        ctx.beginPath();
        // Draw a neat filled pile at the bottom curve of the bowl
        // Starting at left curved boundary
        ctx.arc(mCenter.x, mCenter.y, r - 2, Math.PI * 0.35, Math.PI * 0.65, false);
        ctx.lineTo(mCenter.x, mCenter.y + r - 4); // build pile peak
        ctx.closePath();
        
        ctx.fillStyle = blendedColor;
        ctx.globalAlpha = 0.85;
        ctx.fill();

        // High brightness sparkle highlights inside the powder pile
        ctx.beginPath();
        ctx.ellipse(mCenter.x, mCenter.y + r - 12, 35, 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();
        ctx.restore();
      }

      // 5. Draw physical falling/sliding botanical herbs
      physicalItems.forEach((item) => {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);

        // Soft drop shadow for the rotating emoji itself
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1.5;
        ctx.shadowOffsetY = 2.5;

        // Draw Botanical Emoji with physical rotation
        ctx.font = '28px sans-serif'; // Larger size since we have no circle constraint
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.emoji, 0, 0);

        ctx.restore();

        // Tiny medieval progress plate above each herb
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(item.x - 13, item.y - item.radius - 12, 26, 3.5);
        ctx.fillStyle = '#eab308'; // solid gold
        ctx.fillRect(item.x - 13, item.y - item.radius - 12, 26 * (item.crushProgress / 100), 3.5);
      });

      // 6. Draw floating particles/splatter dust
      particles.current.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // 7. Draw Pestle (절구공이 - Heavy wood handle seen from the side)
      // Tip is at pestlePos.current
      const pX = pestlePos.current.x;
      const pY = pestlePos.current.y;

      // Draw the pestle shaft extending upwards and slightly tilted
      const shaftLength = 110;
      const tiltAngle = -0.15; // slightly slanted wooden handle look
      const endX = pX + Math.sin(tiltAngle) * shaftLength;
      const endY = pY - Math.cos(tiltAngle) * shaftLength;

      ctx.save();
      // Drop shadow for pestle shaft
      ctx.beginPath();
      ctx.moveTo(pX + 5, pY + 5);
      ctx.lineTo(endX + 5, endY + 5);
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.stroke();

      // Actual wooden shaft
      ctx.beginPath();
      ctx.moveTo(pX, pY);
      ctx.lineTo(endX, endY);
      ctx.lineWidth = 13;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#5a3b22'; // rich walnut brown
      ctx.stroke();

      // Wooden highlight core
      ctx.beginPath();
      ctx.moveTo(pX - 1.5, pY);
      ctx.lineTo(endX - 1.5, endY);
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#7c5332'; // lighter cedar brown highlights
      ctx.stroke();

      // Brass collar ring at the handle tip
      ctx.beginPath();
      ctx.arc(endX, endY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ca8a04';
      ctx.fill();

      // Rounded heavy pestle base/head (Circle sitting inside the bowl hemisphere)
      ctx.beginPath();
      ctx.arc(pX, pY, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#855b38'; // heavy round wooden head
      ctx.strokeStyle = '#3a2412';
      ctx.lineWidth = 4;
      ctx.fill();
      ctx.stroke();

      // Shiny reflection curve on wood head
      ctx.beginPath();
      ctx.arc(pX - 7, pY - 7, 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fill();

      ctx.restore();
    };

    const tick = () => {
      updatePhysics();
      draw();
      animationId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [physicalItems, mortarEssence]);

  // Sync physical powder clumps with mortarEssence count
  useEffect(() => {
    const totalCount = Object.keys(mortarEssence).reduce((sum, key) => sum + (mortarEssence[key] || 0), 0);
    if (totalCount === 0) {
      setPhysicalItems((prev) => prev.filter((item) => !item.isPowderClump));
    }
  }, [mortarEssence]);

  // Touch and mouse dragging listeners for side-view pestle
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mousePos.current = { x, y };

    // Toggle release if already dragging the pestle
    if (isDraggingPestle.current) {
      isDraggingPestle.current = false;
      setIsPestleActive(false);
      return;
    }

    // 1. Check if user clicked on any physical ingredient to drag it!
    const clickedItem = physicalItems.find((item) => {
      const dist = Math.sqrt((x - item.x) ** 2 + (y - item.y) ** 2);
      return dist < item.radius + 15;
    });

    if (clickedItem) {
      draggingItemId.current = clickedItem.id;
      dragOffset.current = { x: x - clickedItem.x, y: y - clickedItem.y };
      return;
    }

    // 2. Otherwise check if user grabbed the pestle
    const pX = pestlePos.current.x;
    const pY = pestlePos.current.y;
    // User can grab the pestle handle or head (broad bounding box for ease of play)
    const dist = Math.sqrt((x - pX) ** 2 + (y - pY) ** 2);

    if (dist < 55) {
      isDraggingPestle.current = true;
      setIsPestleActive(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mousePos.current = { x, y };

    if (isDraggingPestle.current) {
      const mCenter = mortarCenter.current;
      const r = mortarRadius;

      // Constrain pestle position inside the hemisphere bowl
      const dx = x - mCenter.x;
      const dy = y - mCenter.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Max distance pestle head can go inside hemisphere
      const maxPestleTravel = r - 12;

      if (y >= mCenter.y && dist > maxPestleTravel) {
        const nx = dx / dist;
        const ny = dy / dist;
        pestlePos.current = {
          x: mCenter.x + nx * maxPestleTravel,
          y: mCenter.y + ny * maxPestleTravel,
        };
      } else {
        // Keep within mouth horizontal width
        const maxLeft = mCenter.x - r + 8;
        const maxRight = mCenter.x + r - 8;
        const clampedX = Math.max(maxLeft, Math.min(maxRight, x));
        // Keep vertical range cozy
        const clampedY = Math.max(30, Math.min(mCenter.y + r - 12, y));
        pestlePos.current = { x: clampedX, y: clampedY };
      }
    }
  };

  const handleMouseUpOrLeave = () => {
    // Only release the ingredient item on mouse up / leave, keep the pestle toggle active!
    draggingItemId.current = null;
  };

  // Mobile Touch events
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    mousePos.current = { x, y };

    // Toggle release if already dragging the pestle
    if (isDraggingPestle.current) {
      isDraggingPestle.current = false;
      setIsPestleActive(false);
      return;
    }

    // 1. Check if touch is on physical ingredient
    const clickedItem = physicalItems.find((item) => {
      const dist = Math.sqrt((x - item.x) ** 2 + (y - item.y) ** 2);
      return dist < item.radius + 15;
    });

    if (clickedItem) {
      draggingItemId.current = clickedItem.id;
      dragOffset.current = { x: x - clickedItem.x, y: y - clickedItem.y };
      return;
    }

    // 2. Otherwise check if touch is on pestle
    const pX = pestlePos.current.x;
    const pY = pestlePos.current.y;
    const dist = Math.sqrt((x - pX) ** 2 + (y - pY) ** 2);

    if (dist < 60) {
      isDraggingPestle.current = true;
      setIsPestleActive(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    mousePos.current = { x, y };

    if (isDraggingPestle.current) {
      const mCenter = mortarCenter.current;
      const r = mortarRadius;

      const dx = x - mCenter.x;
      const dy = y - mCenter.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxPestleTravel = r - 12;

      if (y >= mCenter.y && dist > maxPestleTravel) {
        const nx = dx / dist;
        const ny = dy / dist;
        pestlePos.current = {
          x: mCenter.x + nx * maxPestleTravel,
          y: mCenter.y + ny * maxPestleTravel,
        };
      } else {
        const maxLeft = mCenter.x - r + 8;
        const maxRight = mCenter.x + r - 8;
        const clampedX = Math.max(maxLeft, Math.min(maxRight, x));
        const clampedY = Math.max(30, Math.min(mCenter.y + r - 12, y));
        pestlePos.current = { x: clampedX, y: clampedY };
      }
    }
  };

  // Clear/empty the mortar
  const handleClearMortar = () => {
    physicalItems.forEach((it) => {
      createSplash(it.x, it.y, it.color, 8);
    });
    setPhysicalItems([]);
    setMortarEssence({});
  };

  const totalMortarEssenceCount = Object.keys(mortarEssence).reduce((sum, key) => sum + (mortarEssence[key] || 0), 0);
  const blendedColor = blendColors(mortarEssence);

  // Drag-and-drop end handler for the floating physical Powder Clump
  const handlePowderDragEnd = (event: any, info: any) => {
    // Check if the drop position coordinates is on the left side (Cauldron Area)
    const elementUnderCursor = document.elementFromPoint(info.point.x, info.point.y);
    const isDroppedOnCauldron =
      info.point.x < window.innerWidth * 0.48 ||
      (elementUnderCursor && (
        elementUnderCursor.id === 'cauldron-dropzone' ||
        elementUnderCursor.closest('#cauldron-container') ||
        elementUnderCursor.closest('#cauldron-dropzone')
      ));

    if (isDroppedOnCauldron) {
      onPourToCauldron();
    }
  };

  return (
    <div
      id="mortar-brew-container"
      className="flex flex-col text-[#4a2e1b] w-full relative"
    >

      {/* Physical wooden workbench table deck (Not modern cards/badges!) */}
      <div className="mb-4 bg-[#b58b53] border-4 border-[#523215] rounded-2xl p-3 shadow-inner relative overflow-hidden">
        {/* Deep wood grains */}
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, #3d2208, #3d2208 8px, transparent 8px, transparent 32px)'
        }} />
        
        <div className="text-[10px] font-bold text-[#321703] mb-2.5 flex justify-between items-center uppercase tracking-wider relative z-10">
          <span>🌿 작업대 위 약초 (클릭하여 절구통에 투하)</span>
        </div>

        {/* Physical-looking heaps/platters containing the herbs */}
        <div id="cutting-board-items" className="flex flex-wrap gap-4 min-h-[75px] items-center justify-center relative z-10">
          {INGREDIENTS.map((ing) => {
            const count = cuttingBoard[ing.id] || 0;
            if (count === 0) return null;
            return (
              <motion.button
                id={`cutting-item-${ing.id}`}
                key={ing.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => dropIngredient(ing)}
                className="flex flex-col items-center justify-center relative bg-[#eed6ab] border-2 border-[#5a3c21] rounded-xl px-4 py-2 min-w-[70px] shadow-lg hover:border-[#321703] cursor-pointer transition-all focus:outline-none"
                style={{
                  boxShadow: '0 5px 8px -1px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.4)'
                }}
              >
                {/* Ceramic interior border decoration */}
                <div className="absolute inset-1 border border-[#8a603a]/35 rounded-lg pointer-events-none" />
                <span className="text-3xl relative z-10 select-none">{ing.emoji}</span>
                <span className="text-[10px] font-extrabold text-[#321703] relative z-10 mt-1 truncate max-w-[65px] tracking-tight">
                  {ing.name}
                </span>
                
                {/* Vintage wooden quantity badge */}
                <div className="absolute -top-2.5 -right-2.5 bg-[#412108] text-[#fbf5e6] border-2 border-[#855c3c] w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-md font-mono">
                  {count}
                </div>
              </motion.button>
            );
          })}
          {Object.values(cuttingBoard).reduce((a, b) => a + b, 0) === 0 && (
            <div className="text-[11px] text-[#4a2e1b]/80 italic py-4 font-extrabold text-center relative z-10">
              만물상 서랍에서 약초를 구매해 주십시오.
            </div>
          )}
        </div>
      </div>

      {/* Interactive Physics Canvas representing the SIDE-VIEW mortar bowl */}
      <div
        ref={containerRef}
        className="relative bg-transparent h-[300px] flex items-center justify-center select-none w-full"
      >
        {/* Floating Empty Mortar Button if there are items */}
        {(physicalItems.length > 0 || totalMortarEssenceCount > 0) && (
          <button
            id="btn-clear-mortar"
            onClick={handleClearMortar}
            className="absolute top-2 right-2 flex items-center gap-1 bg-[#b94a4a] hover:bg-[#a13b3b] text-[#fbf5e6] text-[10px] font-bold px-2 py-1 rounded border border-[#4a1111] transition-all cursor-pointer shadow-sm z-20"
          >
            <Trash2 size={10} />
            <span>절구 비우기</span>
          </button>
        )}

        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUpOrLeave}
          className="block w-full h-full cursor-crosshair"
        />

        {/* 100% Custom Framer-Motion DRAGGABLE POWDER CLUMP (직접 잡아서 왼쪽 가마솥에 드래그) */}
        {totalMortarEssenceCount > 0 && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {/* Draggable clump floats at the center bottom above the powder bed */}
            <motion.div
              id="powder-clump"
              drag
              dragSnapToOrigin
              onDragEnd={handlePowderDragEnd}
              className="absolute pointer-events-auto cursor-grab active:cursor-grabbing flex flex-col items-center justify-center"
              style={{
                left: `${mortarCenter.current.x - 36}px`,
                top: `${mortarCenter.current.y + 40}px`, // position right over the powder bed
                width: '72px',
                height: '72px',
              }}
              whileHover={{ scale: 1.15 }}
              whileDrag={{ scale: 1.3, cursor: 'grabbing' }}
            >
              {/* Magic glowing dust pile clump */}
              <div
                className="w-14 h-11 rounded-full blur-[2px] shadow-2xl flex items-center justify-center relative animate-pulse border-2 border-white/50"
                style={{
                  backgroundColor: blendedColor,
                  boxShadow: `0 0 25px ${blendedColor}, inset 0 4px 10px rgba(255,255,255,0.7)`,
                }}
              >
                <span className="text-xl select-none">✨</span>
                
                <div className="absolute -bottom-1 flex gap-0.5 justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                </div>
              </div>

              {/* Herb powder name label */}
              <div className="bg-[#412108] text-[#fbf5e6] text-[8px] font-black px-1.5 py-0.5 rounded-md border border-[#855c3c] shadow-lg mt-1.5 whitespace-nowrap uppercase tracking-wider scale-95">
                가루 에센스 x{totalMortarEssenceCount} (가마솥으로 드래그!)
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Render current ground essence breakdown box (Parchment look) */}
      {totalMortarEssenceCount > 0 && (
        <motion.div
          id="mortar-essence-footer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 bg-[#fdf9ee] border-2 border-[#ca8a04]/40 p-3 rounded-2xl flex flex-col gap-1.5 shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-[#5c3e2b]">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <Sparkles size={11} className="text-emerald-600" />
              <span>빻아진 약초 가루</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {Object.keys(mortarEssence).map((id) => {
                const count = mortarEssence[id];
                if (count === 0) return null;
                const ing = INGREDIENTS.find((i) => i.id === id);
                return (
                  <span key={id} className="text-[9px] bg-[#ebdcb9] text-[#4a2c11] border border-[#8c6239]/30 px-2 py-0.5 rounded-md font-bold font-serif shadow-xs">
                    {ing?.emoji} {count}개분
                  </span>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
