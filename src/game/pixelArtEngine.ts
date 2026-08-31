import { ChildProfile, SceneType } from '../types';
import { BIMESTRES_INFO, MATERIAS } from '../data/constants';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'smoke' | 'leaf' | 'petal' | 'sparkle' | 'dust' | 'water_ripple' | 'fire' | 'light_mote';
}

export class PixelArtRenderer {
  private particles: Particle[] = [];
  private animTick: number = 0;

  constructor() {}

  public updateParticles() {
    this.animTick++;

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.type === 'leaf' || p.type === 'petal') {
        p.x += Math.sin(p.life * 0.05) * 0.8;
      }
      if (p.type === 'smoke' || p.type === 'water_ripple') {
        p.size += 0.08;
      }
      if (p.type === 'fire') {
        p.y -= 0.3;
        p.size = Math.max(0.5, p.size - 0.05);
      }
      if (p.type === 'light_mote') {
        p.x += Math.sin(p.life * 0.08) * 0.4;
      }

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  public addFootstepDust(x: number, y: number) {
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + 2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.3 - 0.1,
        size: Math.random() * 2 + 2,
        color: '#d4b886',
        alpha: 0.6,
        life: 0,
        maxLife: 20,
        type: 'dust',
      });
    }
  }

  public addChimneySmoke(x: number, y: number) {
    if (this.animTick % 16 === 0) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 4,
        y: y,
        vx: (Math.random() - 0.5) * 0.3 + 0.2,
        vy: -Math.random() * 0.6 - 0.4,
        size: Math.random() * 3 + 4,
        color: '#e2e8f0',
        alpha: 0.75,
        life: 0,
        maxLife: 85,
        type: 'smoke',
      });
    }
  }

  public addFireParticle(x: number, y: number) {
    if (this.animTick % 4 === 0) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.6 - Math.random() * 0.5,
        size: 3 + Math.random() * 3,
        color: ['#f97316', '#eab308', '#ef4444', '#fbbf24'][Math.floor(Math.random() * 4)],
        alpha: 0.9,
        life: 0,
        maxLife: 30,
        type: 'fire',
      });
    }
  }

  // NO SNOW: replaced with golden knowledge sparkles, fresh breeze and petals
  public addSeasonalParticles(width: number, height: number, season: string) {
    if (this.particles.length > 70) return;

    if (season === 'otono' && Math.random() < 0.25) {
      this.particles.push({
        x: Math.random() * width,
        y: -10,
        vx: 0.8 + Math.random() * 0.5,
        vy: 1 + Math.random() * 0.8,
        size: 3 + Math.random() * 2,
        color: ['#ea580c', '#d97706', '#ca8a04', '#b45309'][Math.floor(Math.random() * 4)],
        alpha: 0.85,
        life: 0,
        maxLife: 300,
        type: 'leaf',
      });
    } else if (season === 'primavera' && Math.random() < 0.2) {
      this.particles.push({
        x: Math.random() * width,
        y: -10,
        vx: 0.5 + Math.random() * 0.4,
        vy: 0.8 + Math.random() * 0.5,
        size: 2.5 + Math.random() * 2,
        color: ['#f472b6', '#fda4af', '#fbcfe8', '#ffffff'][Math.floor(Math.random() * 4)],
        alpha: 0.8,
        life: 0,
        maxLife: 320,
        type: 'petal',
      });
    } else {
      // Verano / Invierno (Sin nieve: brisa dorada y partículas de conocimiento)
      if (Math.random() < 0.15) {
        this.particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.3 - Math.random() * 0.4,
          size: 2 + Math.random() * 2,
          color: ['#fef08a', '#38bdf8', '#4ade80', '#fbbf24'][Math.floor(Math.random() * 4)],
          alpha: 0.85,
          life: 0,
          maxLife: 160,
          type: 'light_mote',
        });
      }
    }
  }

  // --- RENDER SCENE 1: LA CASA DEL NIÑO (HABITACIÓN INFANTIL ACOGEDORA Y LLENA DE DETALLES) ---
  public renderHouseInterior(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    profile: ChildProfile,
    habitBoardWidth?: number,
    habitBoardHeight?: number
  ) {
    const isGirl = profile.gender === 'girl';
    const wallHeight = 145;

    // 1. Back Wall (Girl: Soft Rose & Lavender Pastel / Boy: Sky-Blue & Royal Blue)
    const wallGrad = ctx.createLinearGradient(0, 0, 0, wallHeight);
    if (isGirl) {
      wallGrad.addColorStop(0, '#831843');
      wallGrad.addColorStop(0.35, '#be185d');
      wallGrad.addColorStop(0.75, '#db2777');
      wallGrad.addColorStop(1, '#f472b6');
    } else {
      wallGrad.addColorStop(0, '#1e3a5f');
      wallGrad.addColorStop(0.4, '#2563eb');
      wallGrad.addColorStop(1, '#3b82f6');
    }
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, width, wallHeight);

    // Cute Wallpaper Pattern (Hearts & Sparkle Stars for girl / Stars & Clouds for boy)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    for (let wy = 16; wy < wallHeight - 16; wy += 28) {
      for (let wx = 16; wx < width; wx += 44) {
        const offset = ((wy / 28) % 2 === 0 ? 0 : 22);
        if (isGirl) {
          // Cute little pixel heart
          ctx.fillRect(wx + offset - 2, wy, 2, 2);
          ctx.fillRect(wx + offset + 2, wy, 2, 2);
          ctx.fillRect(wx + offset - 3, wy + 2, 8, 2);
          ctx.fillRect(wx + offset - 2, wy + 4, 6, 2);
          ctx.fillRect(wx + offset - 1, wy + 6, 4, 2);
          ctx.fillRect(wx + offset, wy + 8, 2, 2);
        } else {
          // Small 4-point pixel star
          ctx.fillRect(wx + offset, wy, 2, 6);
          ctx.fillRect(wx + offset - 2, wy + 2, 6, 2);
        }
      }
    }

    // Wooden Ceiling Beam & Baseboard Dado Rail
    ctx.fillStyle = isGirl ? '#581c87' : '#451a03';
    ctx.fillRect(0, 0, width, 14); // Ceiling molding
    ctx.fillStyle = isGirl ? '#86198f' : '#78350f';
    ctx.fillRect(0, wallHeight - 10, width, 10); // Wooden chair rail / dado
    ctx.fillStyle = isGirl ? '#3b0764' : '#381604';
    ctx.fillRect(0, wallHeight - 2, width, 2);

    // Wall Timber Vertical Studs
    for (let bx = 0; bx < width; bx += 130) {
      ctx.fillStyle = isGirl ? 'rgba(88, 28, 135, 0.22)' : 'rgba(30, 27, 75, 0.25)';
      ctx.fillRect(bx, 14, 8, wallHeight - 24);
    }

    // 2. Playful Festive Pennant Bunting (Guirnalda de banderines de colores)
    this.renderPennantBunting(ctx, 0, width, 14, isGirl);

    // 3. Bright Cozy Light-Colored Floor (Piso Claro Luminoso)
    const floorGrad = ctx.createLinearGradient(0, wallHeight, 0, height);
    if (isGirl) {
      floorGrad.addColorStop(0, '#fff1f2');
      floorGrad.addColorStop(0.25, '#ffe4e6');
      floorGrad.addColorStop(0.7, '#fce7f3');
      floorGrad.addColorStop(1, '#f5d0fe');
    } else {
      floorGrad.addColorStop(0, '#fefcf8');
      floorGrad.addColorStop(0.25, '#faf5ea');
      floorGrad.addColorStop(0.7, '#f3ebd9');
      floorGrad.addColorStop(1, '#ebe0cb');
    }
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, wallHeight, width, height - wallHeight);

    // Bright White / Cream Baseboard Molding along the wall base
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, wallHeight - 12, width, 12);
    ctx.fillStyle = isGirl ? '#fbcfe8' : '#e5decf';
    ctx.fillRect(0, wallHeight - 12, width, 2);
    ctx.fillStyle = isGirl ? '#f472b6' : '#d4cbb8';
    ctx.fillRect(0, wallHeight - 1, width, 1);

    // Elegant Light Porcelain / Soft Pastel Grid Tiles (Piso de cerámicos claros)
    const tileSize = 32;
    for (let ty = wallHeight; ty < height; ty += tileSize) {
      const rowIdx = Math.floor((ty - wallHeight) / tileSize);
      for (let tx = 0; tx < width; tx += tileSize) {
        const colIdx = Math.floor(tx / tileSize);
        const isAlt = (rowIdx + colIdx) % 2 === 0;

        ctx.fillStyle = isAlt
          ? 'rgba(255, 255, 255, 0.55)'
          : (isGirl ? 'rgba(253, 232, 240, 0.4)' : 'rgba(235, 222, 203, 0.35)');
        ctx.fillRect(tx, ty, tileSize, tileSize);

        // Delicate tile bevel highlight at top/left
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillRect(tx + 1, ty + 1, tileSize - 2, 1);
        ctx.fillRect(tx + 1, ty + 1, 1, tileSize - 2);

        // Soft grout lines
        ctx.strokeStyle = isGirl ? 'rgba(244, 114, 182, 0.3)' : 'rgba(195, 180, 160, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx + 0.5, ty + 0.5, tileSize, tileSize);
      }
    }

    // Soft Light Sunbeam Reflections on the light floor
    const sunbeamGrad1 = ctx.createRadialGradient(230, 240, 5, 230, 240, 75);
    sunbeamGrad1.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
    sunbeamGrad1.addColorStop(0.6, 'rgba(254, 240, 138, 0.12)');
    sunbeamGrad1.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = sunbeamGrad1;
    ctx.beginPath();
    ctx.ellipse(230, 250, 85, 45, -0.2, 0, Math.PI * 2);
    ctx.fill();

    const sunbeamGrad2 = ctx.createRadialGradient(530, 240, 5, 530, 240, 75);
    sunbeamGrad2.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
    sunbeamGrad2.addColorStop(0.6, 'rgba(254, 240, 138, 0.12)');
    sunbeamGrad2.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = sunbeamGrad2;
    ctx.beginPath();
    ctx.ellipse(530, 250, 85, 45, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 4. Two Bright Sunny Windows with Cozy Yellow/Cyan/Pink Curtains & Animated Clouds
    this.renderKidWindow(ctx, 195, 20, 68, 70, isGirl, 0);
    this.renderKidWindow(ctx, 495, 20, 68, 70, isGirl, 35);

    // 5. Wall Decorations: Space / Unicorn Posters, Corkboard & Floating Shelves
    this.renderKidWallDecorations(ctx, isGirl);

    // 5b. Cuadro grande HABITOS en la pared central (interactivo) - configurable desde Ajustes & PIN
    {
      const bw = Math.max(80, Math.min(260, Math.round(habitBoardWidth ?? 140)));
      const bh = Math.max(40, Math.min(160, Math.round(habitBoardHeight ?? 72)));
      this.renderHabitBoard(ctx, 330, 38, bw, bh, isGirl);
    }

    // 6. Kid's Creative & Homework Desk on the Left Wall
    this.renderKidDesk(ctx, 35, 175, isGirl);

    // 7. Tall Bookshelf & Board Game Cubby between windows
    this.renderKidBookshelf(ctx, 315, 18, 130, 115, isGirl);

    // 8. Kid's Bed with Star Duvet & Plush Teddy Bear on the Right
    this.renderKidBed(ctx, width - 145, 150, 105, 125, isGirl);

    // 9. Bedside Nightstand with Glowing Mushroom / Fairy Lamp
    this.renderBedsideNightstand(ctx, width - 185, 155, isGirl);

    // 10. Open Wooden Toy Chest with Toys (Baúl de Juguetes)
    this.renderToyChest(ctx, width - 140, 310, isGirl);

    // 11. Large Play Rug in the Center
    this.renderKidPlayRug(ctx, width / 2, 335, isGirl);

    // 12. Exit Bedroom Door to Plaza at bottom
    this.renderExitDoor(ctx, width / 2 - 58, height - 76, 116, 76);

    // 13. Father/Mother NPC Greeting in the bedroom
    this.renderParent(ctx, width / 2 - 80, 260, 'father');
    this.renderComicBubble(
      ctx,
      width / 2 - 110,
      230,
      `¡Buen día, ${profile.name}!`,
      'Revisá tus tareas [M] o salí a la Plaza'
    );

    // Add ambient dust motes in sunbeams
    if (this.animTick % 35 === 0) {
      this.addSunbeamParticle(230 + Math.random() * 40, 90 + Math.random() * 120);
      this.addSunbeamParticle(530 + Math.random() * 40, 90 + Math.random() * 120);
    }
  }

  // --- RENDER SCENE 2: PLAZA CENTRAL (7 CAMINOS RADIALES DESDE EL CÍRCULO CENTRAL O PORTAL KINDER) ---
  public renderPlazaScene(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    season: string,
    profile?: ChildProfile
  ) {
    // 1. Lush Minish Cap Grass Base with checkerboard texture & flowers
    this.renderGrassBackground(ctx, width, height, season);

    const centerX = 400;
    const centerY = 310;
    const plazaRadius = 115;
    const isKinder = profile?.gradeLevel === 'kinder';

    if (isKinder) {
      const kPortalX = 400;
      const kPortalY = 490;
      // Camino orgánico de piedra/tierra hacia Kinder
      this.renderStonePath(ctx, centerX, centerY, kPortalX, kPortalY, 46);
      // Rainbow pavers for Kinder - piedras de colores con borde irregular
      const colors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a855f7'];
      for (let s = 1; s <= 7; s++) {
        const sy = centerY + s * 22;
        const sx = centerX + (s % 2 === 0 ? 6 : -6) + (this.hash2(s * 13, s * 7) - 0.5) * 4;
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.beginPath();
        ctx.ellipse(sx, sy + 2, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colors[s % colors.length];
        ctx.beginPath();
        // piedra irregular con esquinas suavizadas
        ctx.roundRect(sx - 7, sy - 6, 14, 11, 3);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        // highlight
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(sx - 5, sy - 4, 6, 1.5);
      }
    } else {
      // 7 Caminos radiales orgánicos de piedra/tierra
      MATERIAS.forEach((mat) => {
        this.renderStonePath(ctx, centerX, centerY, mat.portalX, mat.portalY, 34);
      });
    }

    // 3. Camino norte a casa — piedra clara irregular
    this.renderStonePath(ctx, centerX, centerY, centerX, 45, 40, true);

    // 4. Plaza central — empedrado irregular detallado
    // Sombra difusa bajo la plaza (profundidad)
    ctx.fillStyle = 'rgba(20, 25, 15, 0.25)';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 14, plazaRadius + 18, plazaRadius * 0.42 + 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Base tierra compacta
    ctx.fillStyle = '#7a5a32';
    ctx.beginPath();
    ctx.arc(centerX, centerY, plazaRadius + 12, 0, Math.PI * 2);
    ctx.fill();

    // Anillo exterior de piedra
    ctx.fillStyle = '#5a6575';
    ctx.beginPath();
    ctx.arc(centerX, centerY, plazaRadius + 5, 0, Math.PI * 2);
    ctx.fill();

    // Empedrado: relleno con gradiente y piedras irregulares
    const stoneGrad = ctx.createRadialGradient(centerX - 18, centerY - 22, 10, centerX, centerY, plazaRadius);
    stoneGrad.addColorStop(0, '#e8eef5');
    stoneGrad.addColorStop(0.45, '#d2dae6');
    stoneGrad.addColorStop(0.85, '#b8c2d0');
    stoneGrad.addColorStop(1, '#9aa5b5');
    ctx.fillStyle = stoneGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, plazaRadius, 0, Math.PI * 2);
    ctx.fill();

    // Borde interno sutil
    ctx.strokeStyle = 'rgba(90,101,117,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, plazaRadius - 1, 0, Math.PI * 2);
    ctx.stroke();

    // Piedras irregulares del empedrado — distribución radial con jitter determinista
    const stoneColors = ['#f1f5f9', '#e2e8f0', '#cbd5e1', '#dde3ec', '#f8fafc'];
    for (let ring = 1; ring <= 4; ring++) {
      const r = 18 + ring * 22;
      const count = Math.floor((r * 2 * Math.PI) / 18);
      for (let i = 0; i < count; i++) {
        const baseTheta = (i / count) * Math.PI * 2;
        const jTheta = (this.hash2(ring * 10 + i, ring * 7) - 0.5) * 0.18;
        const jR = (this.hash2(ring * 13, i * 11) - 0.5) * 10;
        const theta = baseTheta + jTheta;
        const rr = r + jR;
        const cx = centerX + Math.cos(theta) * rr;
        const cy = centerY + Math.sin(theta) * rr * 0.92; // leve perspectiva
        const w = 6 + this.hash2(i * 3, ring * 19) * 5;
        const h = 4 + this.hash2(i * 7, ring * 23) * 3.5;
        const rot = theta + this.hash2(i * 17, ring * 3) * 0.5;
        const col = stoneColors[Math.floor(this.hash2(i * 11, ring * 31) * stoneColors.length) % stoneColors.length];

        // sombra de la piedra
        ctx.fillStyle = 'rgba(60,70,85,0.18)';
        ctx.beginPath();
        ctx.ellipse(cx + 1, cy + 1.5, w * 0.55, h * 0.45, rot, 0, Math.PI * 2);
        ctx.fill();

        // piedra
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.ellipse(cx, cy, w * 0.5, h * 0.42, rot, 0, Math.PI * 2);
        ctx.fill();

        // highlight superior
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.beginPath();
        ctx.ellipse(cx - 1, cy - 1, w * 0.22, h * 0.18, rot, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Piedras pequeñas de relleno aleatorio dentro de la plaza
    for (let p = 0; p < 28; p++) {
      const px = this.hash2(p * 41, p * 59);
      const py = this.hash2(p * 73, p * 37);
      const ang = px * Math.PI * 2;
      const rad = py * (plazaRadius - 14);
      const cx = centerX + Math.cos(ang) * rad;
      const cy = centerY + Math.sin(ang) * rad * 0.92;
      if (Math.sqrt((cx - centerX) ** 2 + (cy - centerY) ** 2) > plazaRadius - 6) continue;
      const s = 2 + px * 2.5;
      ctx.fillStyle = 'rgba(120,130,145,0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, s, s * 0.7, px * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Central 3-Phase Fountain (Overworld.png Asset Style)
    this.renderFountain(ctx, centerX, centerY);

    // 6. North House Facade & Sign
    this.renderHouseFacade(ctx, centerX - 60, -30, 120, 75, '🏠 Tu Casa', '#2563eb');

    // 7. Market Stall with Striped Blue/White Awning (Overworld.png Asset)
    this.renderMarketStall(ctx, 585, 120);

    // 8. Portals
    if (isKinder) {
      this.renderRadialPortal(ctx, 400, 490, '🎈 Kinder', '#e11d48');
    } else {
      // Render the 7 Radial Subject Themed Portals at the ends of the 7 roads with Kingdom Banners
      MATERIAS.forEach((mat) => {
        this.renderRadialPortal(ctx, mat.portalX, mat.portalY, mat.shortName, mat.color);
      });
    }

    // 9. Lush Decorative Trees & Gardens between the radiating spokes
    this.renderTree(ctx, 310, 100, season);
    this.renderTree(ctx, 490, 100, season);
    this.renderTree(ctx, 700, 240, season);
    this.renderTree(ctx, 680, 420, season);
    this.renderTree(ctx, 330, 500, season);
    this.renderTree(ctx, 110, 420, season);
    this.renderTree(ctx, 90, 200, season);

    // Decorative street lanterns near central circle with warm glowing illumination
    this.renderLantern(ctx, centerX - 85, centerY - 65);
    this.renderLantern(ctx, centerX + 85, centerY - 65);
    this.renderLantern(ctx, centerX - 85, centerY + 65);
    this.renderLantern(ctx, centerX + 85, centerY + 65);

    // Flower patches, barrels, crates & wooden benches from Overworld.png
    this.renderFlowerPatch(ctx, 290, 220);
    this.renderFlowerPatch(ctx, 510, 230);
    this.renderFlowerPatch(ctx, 500, 390);
    this.renderFlowerPatch(ctx, 290, 390);
    this.renderWoodenBench(ctx, centerX - 65, centerY + 80);
    this.renderWoodenBench(ctx, centerX + 25, centerY + 80);
    this.renderTownCratesAndBarrels(ctx, 540, 150);

    // 10. Viñeteado sutil + sombreado ambiental (profundidad)
    this.renderVignette(ctx, width, height);

    // 11. Dynamic World Animation: Flying birds across the sky
    this.renderFlyingBirds(ctx, width, height);
  }

  // --- HELPER: viñeteado sutil para profundidad ---
  private renderVignette(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const grad = ctx.createRadialGradient(width * 0.5, height * 0.5, Math.min(width, height) * 0.45, width * 0.5, height * 0.5, Math.max(width, height) * 0.85);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.75, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(18, 28, 15, 0.28)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    // luz superior sutil
    const topLight = ctx.createLinearGradient(0, 0, 0, 120);
    topLight.addColorStop(0, 'rgba(255,255,255,0.06)');
    topLight.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = topLight;
    ctx.fillRect(0, 0, width, 90);
  }

  // --- HELPER: camino de piedra/tierra orgánico con borde irregular y piedritas ---
  private renderStonePath(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, width: number, lightVariant: boolean = false) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return;
    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;
    const wHalf = width / 2;
    const seg = Math.ceil(len / 14);
    // generar borde irregular con hash
    const leftPts: { x: number; y: number }[] = [];
    const rightPts: { x: number; y: number }[] = [];
    for (let i = 0; i <= seg; i++) {
      const t = i / seg;
      const bx = x1 + dx * t;
      const by = y1 + dy * t;
      const jitter = (this.hash2(t * 97, width * 13) - 0.5) * (width * 0.18);
      const j2 = (this.hash2(t * 53 + 10, width * 7) - 0.5) * (width * 0.14);
      leftPts.push({ x: bx + px * (wHalf + jitter), y: by + py * (wHalf + jitter) });
      rightPts.push({ x: bx + px * (-wHalf + j2), y: by + py * (-wHalf + j2) });
    }
    // sombra sutil del camino
    ctx.fillStyle = 'rgba(45, 30, 12, 0.18)';
    ctx.beginPath();
    ctx.moveTo(leftPts[0].x + 2, leftPts[0].y + 3);
    for (let i = 1; i < leftPts.length; i++) ctx.lineTo(leftPts[i].x + 2, leftPts[i].y + 3);
    for (let i = rightPts.length - 1; i >= 0; i--) ctx.lineTo(rightPts[i].x + 2, rightPts[i].y + 3);
    ctx.closePath();
    ctx.fill();

    // borde tierra oscuro irregular
    ctx.fillStyle = lightVariant ? '#9a8a6a' : '#7a5a32';
    ctx.beginPath();
    ctx.moveTo(leftPts[0].x, leftPts[0].y);
    for (let i = 1; i < leftPts.length; i++) ctx.lineTo(leftPts[i].x, leftPts[i].y);
    for (let i = rightPts.length - 1; i >= 0; i--) ctx.lineTo(rightPts[i].x, rightPts[i].y);
    ctx.closePath();
    ctx.fill();

    // relleno central piedra — con margen interno
    const innerLeft = leftPts.map((p, i) => {
      const t = i / seg;
      const inset = 4 + this.hash2(t * 33, 1) * 2;
      const cx = x1 + dx * t + px * inset;
      const cy = y1 + dy * t + py * inset;
      return { x: cx + px * (wHalf - 6), y: cy + py * (wHalf - 6) };
    });
    const innerRight = rightPts.map((p, i) => {
      const t = i / seg;
      const inset = 4 + this.hash2(t * 33 + 5, 2) * 2;
      const cx = x1 + dx * t + px * inset;
      const cy = y1 + dy * t + py * inset;
      return { x: cx + px * (-wHalf + 6), y: cy + py * (-wHalf + 6) };
    });
    // gradiente piedra
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const stoneBase = ctx.createLinearGradient(midX - px * wHalf, midY - py * wHalf, midX + px * wHalf, midY + py * wHalf);
    if (lightVariant) {
      stoneBase.addColorStop(0, '#d8d0c0');
      stoneBase.addColorStop(0.5, '#e8ddd0');
      stoneBase.addColorStop(1, '#c8beb0');
    } else {
      stoneBase.addColorStop(0, '#c9b896');
      stoneBase.addColorStop(0.5, '#e0d3b2');
      stoneBase.addColorStop(1, '#b8a98a');
    }
    ctx.fillStyle = stoneBase;
    ctx.beginPath();
    ctx.moveTo(innerLeft[0].x, innerLeft[0].y);
    for (let i = 1; i < innerLeft.length; i++) ctx.lineTo(innerLeft[i].x, innerLeft[i].y);
    for (let i = innerRight.length - 1; i >= 0; i--) ctx.lineTo(innerRight[i].x, innerRight[i].y);
    ctx.closePath();
    ctx.fill();

    // piedritas / losetas irregulares sobre el camino
    const pebbleColors = lightVariant ? ['#f1ece2', '#e6ddd0', '#d6c9b5', '#c9bca8'] : ['#e8dcc0', '#d9c9a8', '#c9b896', '#a99578'];
    const pebbleCount = Math.floor(len / 16);
    for (let s = 0; s < pebbleCount; s++) {
      const t = (s + 0.5) / pebbleCount;
      const jitterT = (this.hash2(s * 19, width) - 0.5) * 0.08;
      const tt = Math.max(0.08, Math.min(0.92, t + jitterT));
      const bx = x1 + dx * tt;
      const by = y1 + dy * tt;
      const lateral = (this.hash2(s * 31, width * 2) - 0.5) * (width - 14);
      const cx = bx + px * lateral;
      const cy = by + py * lateral;
      const pw = 5 + this.hash2(s * 7, width * 3) * 5;
      const ph = 3 + this.hash2(s * 11, width * 5) * 3;
      const rot = this.hash2(s * 23, width * 7) * Math.PI;
      const col = pebbleColors[Math.floor(this.hash2(s * 13, width) * pebbleColors.length) % pebbleColors.length];
      // sombra piedrita
      ctx.fillStyle = 'rgba(90, 70, 40, 0.18)';
      ctx.beginPath();
      ctx.ellipse(cx + 0.8, cy + 1, pw * 0.5, ph * 0.5, rot, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(cx, cy, pw * 0.48, ph * 0.48, rot, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.ellipse(cx - 0.7, cy - 0.6, pw * 0.18, ph * 0.18, rot, 0, Math.PI * 2);
      ctx.fill();
    }

    // surcos de desgaste centrales sutiles
    ctx.strokeStyle = lightVariant ? 'rgba(120,110,95,0.12)' : 'rgba(90,65,30,0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= seg; i++) {
      const t = i / seg;
      const bx = x1 + dx * t + px * (this.hash2(t * 77, width) - 0.5) * 3;
      const by = y1 + dy * t + py * (this.hash2(t * 77, width) - 0.5) * 3;
      if (i === 0) ctx.moveTo(bx, by);
      else ctx.lineTo(bx, by);
    }
    ctx.stroke();
  }

  // --- HELPER: avenida piano 3D con grosor y teclas blancas/negras con profundidad ---
  private renderPianoAvenue(ctx: CanvasRenderingContext2D, y: number, width: number) {
    const h = 34; // alto de teclas blancas
    const thickness = 10; // grosor lateral visible (efecto 3D referencia)
    const whiteKeyW = 22;
    const keys = Math.ceil(width / whiteKeyW) + 2;
    // Sombra bajo el piano
    ctx.fillStyle = 'rgba(12,14,18,0.28)';
    ctx.beginPath(); ctx.ellipse(width/2, y + h + thickness + 4, width*0.48, 12, 0, 0, Math.PI*2); ctx.fill();
    // Lateral / canto inferior (madera oscura)
    ctx.fillStyle = '#2a2f3a';
    ctx.fillRect(-10, y + h, width+20, thickness);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-10, y + h + thickness - 2, width+20, 2);
    // Teclas blancas con degradado y veta
    for (let k = -1; k < keys; k++) {
      const x = k * whiteKeyW;
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, '#fefefe');
      grad.addColorStop(0.35, '#f8fafc');
      grad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, whiteKeyW - 1, h);
      // línea divisoria y bisel superior
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(x + whiteKeyW - 1, y, 1, h);
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.fillRect(x+1, y, whiteKeyW-3, 1);
      // lateral de tecla (grosor)
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x, y + h, whiteKeyW - 1, thickness - 2);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x + whiteKeyW - 1, y + h, 1, thickness - 2);
    }
    // Teclas negras alzadas
    const blackPattern = [1,1,0,1,1,1,0]; // patrón por octava (7 blancas)
    for (let k = -1; k < keys; k++) {
      const mod = ((k % 7) + 7) % 7;
      if (blackPattern[mod] === 0) continue;
      const x = k * whiteKeyW + whiteKeyW - 7;
      // sombra de tecla negra
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(x+1, y+1, 12, h*0.62 + 1);
      // tecla negra
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y, 12, Math.floor(h*0.62));
      // bisel superior negra
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y, 12, 2);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(x+2, y+2, 2, Math.floor(h*0.62)-4);
    }
    // Bordes tierra/cesped del piano (como en referencia: tierra bajo el piano con hierba irregular)
    ctx.fillStyle = '#7a5a32';
    ctx.fillRect(-10, y + h + thickness, width+20, 8);
    ctx.fillStyle = '#b8a98a';
    // césped irregular encima y debajo del piano
    for (let i=0;i<width;i+=18){
      const j = (this.hash2(i*0.3, y)-0.5)*4;
      ctx.fillStyle = i%36===0 ? '#4e8c33' : '#5a9e3a';
      ctx.fillRect(i, y-6+j, 10, 6);
      ctx.fillRect(i, y+h+thickness+6+j, 10, 5);
    }
  }

  // --- ENGLISH TOWN: escena exclusiva GBA HD (solo materia ingles) ---
  private renderEnglishTownMateriaMap(ctx: CanvasRenderingContext2D, width: number, height: number, unlockedCityMax: number, season: string) {
    // 1. Suelo pasto vibrante texturizado (GBA)
    this.renderGrassBackground(ctx, width, height, season);
    // velo ambient por estación
    let ambient = season === 'verano' ? 'rgba(255,230,160,0.10)' : season === 'otono' ? 'rgba(255,180,80,0.12)' : season === 'invierno' ? 'rgba(180,210,255,0.08)' : 'rgba(160,255,180,0.07)';
    ctx.fillStyle = ambient; ctx.fillRect(0,0,width,height);

    const pathY = 282;
    // 2. Camino adoquines textura orgánica con letras grabadas
    // Base tierra irregular
    ctx.fillStyle = 'rgba(90,72,40,0.22)';
    ctx.beginPath();
    ctx.ellipse(width/2, pathY+18, width*0.48, 18, 0,0,Math.PI*2); ctx.fill();
    // Adoquines
    const cobbleW = 16, cobbleH = 12;
    const cols = Math.ceil(width / cobbleW) + 1;
    const rows = 3;
    const words = ['HELLO','CAT','SUN','DOG','BOOK','STAR'];
    const letters = ['A','B','C','D'];
    for (let r=0;r<rows;r++){
      for (let c=-1;c< cols;c++){
        const x = c*cobbleW + (r%2? cobbleW/2:0) + (this.hash2(c*13+r*17, r*7)-0.5)*2;
        const y = pathY - 14 + r*cobbleH + (this.hash2(c*7+r*11, c*3)-0.5)*1.5;
        const isDark = (c+r)%2===0;
        ctx.fillStyle = isDark ? '#c9b8a0' : '#e0d3b8';
        ctx.beginPath(); ctx.roundRect(x, y, cobbleW-1.5, cobbleH-1.5, 2.5); ctx.fill();
        ctx.strokeStyle = 'rgba(90,72,40,0.18)'; ctx.lineWidth=0.6; ctx.stroke();
        // letras grabadas aleatorias (12% lleva letra/palabra)
        const h = this.hash2(c*19+r*33, 99);
        if (h < 0.06) {
          ctx.fillStyle = 'rgba(90,65,30,0.55)';
          ctx.font = 'bold 7px monospace';
          ctx.textAlign='center';
          const txt = h < 0.03 ? letters[Math.floor(this.hash2(c*5,r*9)*letters.length)%letters.length] : words[Math.floor(this.hash2(c*11,r*13)*words.length)%words.length].slice(0,3);
          ctx.fillText(txt, x+cobbleW/2, y+cobbleH/2+2.5);
          ctx.textAlign='start';
        } else {
          // desgaste sutil
          ctx.fillStyle = 'rgba(255,255,255,0.28)';
          ctx.fillRect(x+2, y+1.5, cobbleW-6, 0.8);
        }
      }
    }
    // Bordes orgánicos del camino
    ctx.strokeStyle='rgba(95,72,32,0.22)'; ctx.lineWidth=1.1;
    ctx.beginPath(); ctx.moveTo(-10, pathY-16); for(let x=0;x<width+10;x+=16){ ctx.lineTo(x, pathY-16+(this.hash2(x*0.6, pathY)-0.5)*4);} ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10, pathY+20); for(let x=0;x<width+10;x+=16){ ctx.lineTo(x, pathY+20+(this.hash2(x*0.6+50, pathY)-0.5)*4);} ctx.stroke();
    // Terraplén
    ctx.fillStyle='#9c7a3c'; ctx.fillRect(0, pathY+18, width, 6);

    // Portón Plaza
    this.renderWoodenGate(ctx, 10, pathY-45, '◀ Volver a Plaza');

    // Entidades para Y-sorting: edificios + árboles
    type Entity = { y:number, draw:()=>void, shadow:()=>void };
    const entities: Entity[] = [];
    const citiesX = [180,370,560,720];
    // Prepara edificios (y ~126)
    BIMESTRES_INFO.forEach((bInfo, idx)=>{
      const cx = citiesX[idx];
      const isUnlocked = bInfo.id <= unlockedCityMax;
      const y = 126;
      entities.push({
        y: y+76,
        shadow: ()=>{
          ctx.fillStyle='rgba(0,0,0,0.20)';
          ctx.beginPath(); ctx.ellipse(cx, y+76+6, 46, 12,0,0,Math.PI*2); ctx.fill();
        },
        draw: ()=> this.renderEnglishHouse(ctx, cx, y, isUnlocked, idx+1)
      });
      // sendero corto a puerta
      if (isUnlocked) {
        ctx.fillStyle='rgba(0,0,0,0.10)';
        ctx.beginPath(); ctx.ellipse(cx, 214, 24, 8,0,0,Math.PI*2); ctx.fill();
      }
    });
    // Árboles / arbustos
    const treePos = [[70,60],[720,70],[120,360],[680,360]];
    treePos.forEach(([tx,ty])=>{
      entities.push({
        y: ty+38,
        shadow: ()=>{
          ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(tx, ty+38, 22, 8,0,0,Math.PI*2); ctx.fill();
        },
        draw: ()=> this.renderTree(ctx, tx, ty, season)
      });
    });
    // Ordena por y y dibuja sombras primero, luego entidades
    entities.sort((a,b)=> a.y - b.y);
    entities.forEach(e=> e.shadow());
    entities.forEach(e=> e.draw());

    // Decoración orgánica: flores, rocas, farolas amarillas (sin notas)
    this.renderLantern(ctx, 95, pathY-16);
    this.renderLantern(ctx, 285, pathY-16);
    this.renderLantern(ctx, 475, pathY-16);
    this.renderLantern(ctx, 665, pathY-16);
    // Flores/rocas dispersas
    for(let i=0;i<14;i++){
      const fx = 40 + this.hash2(i*31, i*17)* (width-80);
      const fy = 60 + this.hash2(i*73, i*29)* 120;
      if (fy> 200 && fy < 260) continue; // evita camino
      const kind = this.hash2(i*11,i*7);
      if (kind < 0.5){
        // flor pequeña
        ctx.fillStyle = ['#fde68a','#f9a8d4','#93c5fd'][Math.floor(kind*3)%3];
        ctx.beginPath(); ctx.arc(fx, fy, 2.2,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#fef08a'; ctx.beginPath(); ctx.arc(fx,fy,0.9,0,Math.PI*2); ctx.fill();
      } else {
        // roca
        ctx.fillStyle='rgba(100,116,139,0.55)';
        ctx.beginPath(); ctx.ellipse(fx,fy, 3+this.hash2(i*19,9)*2, 2,0,0,Math.PI*2); ctx.fill();
      }
    }

    // Cartel superior "Welcome to English Town" con bandera UK
    this.renderEnglishHeader(ctx, width/2, 30);

    // Iluminación ambient global ya aplicada arriba + viñeteado suave
    this.renderVignette(ctx, width, height);
  }

  private renderEnglishHeader(ctx: CanvasRenderingContext2D, x:number, y:number){
    const w=260, h=28;
    // fondo pill
    ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.roundRect(x-w/2, y-h/2+3, w, h, 14); ctx.fill();
    ctx.fillStyle='#0f172a'; ctx.beginPath(); ctx.roundRect(x-w/2, y-h/2, w, h, 14); ctx.fill();
    ctx.strokeStyle='#f59e0b'; ctx.lineWidth=1.6; ctx.stroke();
    // bandera UK simplificada 18x12
    const fx = x - 98, fy = y - 6;
    ctx.fillStyle='#1d4ed8'; ctx.fillRect(fx, fy, 18, 12);
    ctx.strokeStyle='#ffffff'; ctx.lineWidth=1.8; ctx.strokeRect(fx, fy, 18, 12);
    ctx.strokeStyle='#dc2626'; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx+18, fy+12); ctx.moveTo(fx+18, fy); ctx.lineTo(fx, fy+12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fx+9, fy); ctx.lineTo(fx+9, fy+12); ctx.moveTo(fx, fy+6); ctx.lineTo(fx+18, fy+6); ctx.stroke();
    // texto
    ctx.fillStyle='#fffbeb'; ctx.font='bold 13px system-ui, sans-serif'; ctx.textAlign='center';
    ctx.fillText('Welcome to English Town', x+10, y+4.5);
    ctx.textAlign='start';
  }

  private renderEnglishHouse(ctx: CanvasRenderingContext2D, x:number, y:number, isUnlocked:boolean, idx:number){
    const w=92, h=76, cx=x-w/2;
    // Desaturación 60% si bloqueada
    const desat = !isUnlocked;
    const wallLight = desat ? '#cbd5e1' : '#faf6ee';
    const wallStone = desat ? '#94a3b8' : '#e7dcc8';
    const wood = desat ? '#6b7280' : '#8b5a2b';
    const roof = desat ? '#64748b' : '#c0392b';
    const roofDark = desat ? '#475569' : '#922b21';
    ctx.save();
    if (desat){ ctx.globalAlpha=0.72; }
    // Muros piedra clara con entramado madera
    ctx.fillStyle=wallLight; ctx.beginPath(); ctx.roundRect(cx, y+24, w, h-24, 4); ctx.fill();
    // juntas piedra sutil
    ctx.strokeStyle= desat ? 'rgba(100,116,139,0.22)' : 'rgba(180,160,130,0.22)';
    ctx.lineWidth=0.7;
    for(let by=y+32; by< y+h-4; by+=10){ ctx.beginPath(); ctx.moveTo(cx+4, by); ctx.lineTo(cx+w-4, by); ctx.stroke(); }
    // entramado madera
    ctx.fillStyle=wood; ctx.fillRect(cx, y+24, w, 4); ctx.fillRect(cx, y+h-18, w, 4);
    ctx.fillRect(cx, y+24, 4, h-24); ctx.fillRect(cx+w-4, y+24, 4, h-24);
    ctx.fillRect(cx+w/2-2, y+24, 4, h-24);
    // Teja roja con relieve
    ctx.fillStyle=roof; ctx.beginPath(); ctx.moveTo(cx-6, y+26); ctx.lineTo(x, y-16); ctx.lineTo(cx+w+6, y+26); ctx.fill();
    ctx.fillStyle=roofDark; ctx.beginPath(); ctx.moveTo(cx-6, y+26); ctx.lineTo(x, y-16+6); ctx.lineTo(x-8, y+26); ctx.fill();
    // tejas líneas
    ctx.strokeStyle= desat ? 'rgba(0,0,0,0.18)' : 'rgba(100,20,10,0.18)';
    ctx.lineWidth=0.8;
    for(let ty=y-8; ty< y+24; ty+=6){ const t = (ty - (y-8))/(y+24-(y-8)); const lx = cx-4 + t*(x - (cx-4)); const rx = cx+w+4 - t*(cx+w+4 - x); ctx.beginPath(); ctx.moveTo(lx, ty); ctx.lineTo(rx, ty); ctx.stroke(); }
    // Chimenea piedra clara
    ctx.fillStyle= desat ? '#6b7280' : '#d5c4a8'; ctx.fillRect(x+22, y-8, 10, 20);
    ctx.fillStyle= desat ? '#475569' : '#a08b6f'; ctx.fillRect(x+22, y-10, 10, 4);
    // Ventanas blancas con cruz
    const winY = y+36;
    for(let wx of [cx+12, cx+w-26]){
      ctx.fillStyle= desat ? '#e5e7eb' : '#ffffff'; ctx.fillRect(wx, winY, 14, 14);
      ctx.fillStyle='#1e293b'; ctx.strokeStyle='#334155'; ctx.lineWidth=0.8; ctx.strokeRect(wx, winY, 14, 14);
      ctx.fillStyle='#1e293b'; ctx.fillRect(wx+6, winY, 2, 14); ctx.fillRect(wx, winY+6, 14, 2);
      if(!desat){
        const glow = 0.45+ Math.sin(this.animTick*0.08 + x)*0.10;
        ctx.fillStyle=`rgba(254,240,138,${glow})`; ctx.fillRect(wx+2, winY+2, 10, 10);
      }
    }
    // Puerta arqueada azul marino con herraje dorado
    ctx.fillStyle= desat ? '#334155' : '#1e3a5f'; ctx.beginPath(); ctx.roundRect(x-13, y+h-28, 26, 28, [10,10,0,0]); ctx.fill();
    ctx.strokeStyle= desat ? '#64748b' : '#c9a86a'; ctx.lineWidth=1.4; ctx.stroke();
    if(!desat){
      ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(x+7, y+h-16, 2,0,Math.PI*2); ctx.fill();
    } else {
      ctx.fillStyle='#ef4444'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center'; ctx.fillText('🔒', x, y+h-8); ctx.textAlign='start';
    }
    // Cabina telefónica roja británica cerca de entrada (solo ciudad 1 activa como muestra)
    if(idx===1 && !desat){
      const bx = cx -18, by = y+h-22;
      ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(bx+7, by+16, 9, 4,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#dc2626'; ctx.fillRect(bx, by, 14, 16);
      ctx.fillStyle='#7f1d1d'; ctx.fillRect(bx, by, 14, 2);
      ctx.fillStyle='#fecaca'; ctx.fillRect(bx+2, by+3, 10, 8);
      ctx.strokeStyle='#ffffff'; ctx.lineWidth=0.7; ctx.strokeRect(bx+2, by+3, 10, 8);
      ctx.fillStyle='#ffffff'; ctx.font='bold 5px sans-serif'; ctx.textAlign='center'; ctx.fillText('PHONE', bx+7, by+8); ctx.textAlign='start';
      // cúpula
      ctx.fillStyle='#991b1b'; ctx.beginPath(); ctx.arc(bx+7, by, 7, Math.PI,0); ctx.fill();
    }
    // Placa nombre
    ctx.fillStyle='rgba(0,0,0,0.38)'; ctx.beginPath(); ctx.roundRect(x-54, y+h+10, 108, 24, 7); ctx.fill();
    ctx.fillStyle= desat ? '#1e293b' : '#0f172a'; ctx.beginPath(); ctx.roundRect(x-54, y+h+8, 108, 24, 7); ctx.fill();
    ctx.strokeStyle= desat ? '#64748b' : '#f59e0b'; ctx.lineWidth=1.3; ctx.stroke();
    const names = ['City One','City Two','City Three','City Four'];
    const months = ['Feb - Apr','May - Jun','Jul - Sep','Oct - Nov'];
    ctx.fillStyle= desat ? '#cbd5e1' : '#fde68a'; ctx.font='bold 11px system-ui, sans-serif'; ctx.textAlign='center';
    ctx.fillText(names[idx-1]||`City ${idx}`, x, y+h+19);
    ctx.fillStyle= desat ? '#94a3b8' : '#fde68a'; ctx.font='600 8px system-ui, sans-serif';
    ctx.fillText(months[idx-1]||'', x, y+h+26); ctx.textAlign='start';
    ctx.restore();
  }

  // --- PREMIUM THEMATIC TOWN para Historia/Lenguaje/Arte/Matemáticas (GBA HD, solo esas 4) ---
  private renderPremiumThematicTown(ctx: CanvasRenderingContext2D, width:number, height:number, unlockedCityMax:number, season:string, materiaId:string){
    const materia = MATERIAS.find(m=> m.id===materiaId) || MATERIAS[0];
    // Suelo pasto vibrante GBA
    this.renderGrassBackground(ctx, width, height, season);
    let ambient = season==='verano' ? 'rgba(255,230,160,0.10)' : season==='otono' ? 'rgba(255,180,80,0.12)' : season==='invierno' ? 'rgba(180,210,255,0.08)' : 'rgba(160,255,180,0.07)';
    ctx.fillStyle=ambient; ctx.fillRect(0,0,width,height);

    const pathY=282;
    // Camino adoquines con grabados temáticos
    let letters:string[]=[], words:string[]=[];
    if(materiaId==='matematicas'){ letters=['1','2','3','+','×','π']; words=['SUM','123','PI']; }
    else if(materiaId==='lenguaje'){ letters=['A','B','C','E']; words=['HELLO','ABC','LEE']; }
    else if(materiaId==='historia'){ letters=['I','V','X']; words=['PAZ','LEY','REY']; }
    else if(materiaId==='luces'){ letters=['R','G','B']; words=['ART','LUZ','COL']; }
    else { letters=['A','B']; words=['HI']; }
    ctx.fillStyle='rgba(90,72,40,0.22)'; ctx.beginPath(); ctx.ellipse(width/2, pathY+18, width*0.48, 18,0,0,Math.PI*2); ctx.fill();
    const cobbleW=16, cobbleH=12, cols=Math.ceil(width/cobbleW)+1, rows=3;
    for(let r=0;r<rows;r++){
      for(let c=-1;c<cols;c++){
        const x=c*cobbleW + (r%2? cobbleW/2:0) + (this.hash2(c*13+r*17, r*7)-0.5)*2;
        const y=pathY-14 + r*cobbleH + (this.hash2(c*7+r*11, c*3)-0.5)*1.5;
        const isDark=(c+r)%2===0;
        ctx.fillStyle=isDark ? '#c9b8a0' : '#e0d3b8';
        ctx.beginPath(); ctx.roundRect(x, y, cobbleW-1.5, cobbleH-1.5, 2.5); ctx.fill();
        ctx.strokeStyle='rgba(90,72,40,0.18)'; ctx.lineWidth=0.6; ctx.stroke();
        const h=this.hash2(c*19+r*33, 99);
        if(h<0.07){
          ctx.fillStyle='rgba(90,65,30,0.55)'; ctx.font='bold 7px monospace'; ctx.textAlign='center';
          const txt = h<0.035 ? letters[Math.floor(this.hash2(c*5,r*9)*letters.length)%letters.length] : words[Math.floor(this.hash2(c*11,r*13)*words.length)%words.length].slice(0,3);
          ctx.fillText(txt, x+cobbleW/2, y+cobbleH/2+2.5); ctx.textAlign='start';
        } else {
          ctx.fillStyle='rgba(255,255,255,0.28)'; ctx.fillRect(x+2, y+1.5, cobbleW-6, 0.8);
        }
      }
    }
    ctx.strokeStyle='rgba(95,72,32,0.22)'; ctx.lineWidth=1.1;
    ctx.beginPath(); ctx.moveTo(-10, pathY-16); for(let x=0;x<width+10;x+=16){ ctx.lineTo(x, pathY-16+(this.hash2(x*0.6, pathY)-0.5)*4);} ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10, pathY+20); for(let x=0;x<width+10;x+=16){ ctx.lineTo(x, pathY+20+(this.hash2(x*0.6+50, pathY)-0.5)*4);} ctx.stroke();
    ctx.fillStyle='#9c7a3c'; ctx.fillRect(0, pathY+18, width, 6);
    this.renderWoodenGate(ctx, 10, pathY-45, '◀ Volver a Plaza');

    // Y-sorting entidades: edificios + árboles
    type Entity={ y:number, draw:()=>void, shadow:()=>void };
    const entities:Entity[]=[];
    const citiesX=[180,370,560,720];
    BIMESTRES_INFO.forEach((bInfo, idx)=>{
      const cx=citiesX[idx];
      const isUnlocked=bInfo.id <= unlockedCityMax;
      const y=126;
      entities.push({
        y: y+76,
        shadow: ()=>{ ctx.fillStyle='rgba(0,0,0,0.20)'; ctx.beginPath(); ctx.ellipse(cx, y+76+6, 46, 12,0,0,Math.PI*2); ctx.fill(); },
        draw: ()=> this.renderThemedCityBuilding(ctx, cx, y, bInfo.label, bInfo.name, bInfo.months, isUnlocked, isUnlocked, materiaId, idx+1, materia.color)
      });
      if(isUnlocked){
        ctx.fillStyle='rgba(0,0,0,0.10)'; ctx.beginPath(); ctx.ellipse(cx, 214, 24, 8,0,0,Math.PI*2); ctx.fill();
      }
    });
    const treePos=[[70,60],[720,70],[120,360],[680,360]];
    treePos.forEach(([tx,ty])=>{
      entities.push({
        y: ty+38,
        shadow: ()=>{ ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(tx, ty+38, 22, 8,0,0,Math.PI*2); ctx.fill(); },
        draw: ()=> this.renderTree(ctx, tx, ty, season)
      });
    });
    entities.sort((a,b)=> a.y - b.y);
    entities.forEach(e=> e.shadow());
    entities.forEach(e=> e.draw());

    this.renderLantern(ctx, 95, pathY-16);
    this.renderLantern(ctx, 285, pathY-16);
    this.renderLantern(ctx, 475, pathY-16);
    this.renderLantern(ctx, 665, pathY-16);
    for(let i=0;i<14;i++){
      const fx=40 + this.hash2(i*31,i*17)*(width-80);
      const fy=60 + this.hash2(i*73,i*29)*120;
      if(fy>200 && fy<260) continue;
      const kind=this.hash2(i*11,i*7);
      if(kind<0.5){
        ctx.fillStyle=['#fde68a','#f9a8d4','#93c5fd'][Math.floor(kind*3)%3];
        ctx.beginPath(); ctx.arc(fx,fy,2.2,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#fef08a'; ctx.beginPath(); ctx.arc(fx,fy,0.9,0,Math.PI*2); ctx.fill();
      } else {
        ctx.fillStyle='rgba(100,116,139,0.55)';
        ctx.beginPath(); ctx.ellipse(fx,fy,3+this.hash2(i*19,9)*2,2,0,0,Math.PI*2); ctx.fill();
      }
    }
    // Header temático (no "Welcome" sino nombre materia, para diferenciar de Inglés)
    this.renderMateriaHeaderPill(ctx, width/2, 30, materia.name, materia.color);
    this.renderVignette(ctx, width, height);
  }

  // Animated Birds flying across the sky with natural wing flapping
  private renderFlyingBirds(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const time = this.animTick * 0.05;
    const birds = [
      { speed: 1.2, yBase: 45, size: 4, offset: 0 },
      { speed: 1.0, yBase: 65, size: 3.5, offset: 120 },
      { speed: 1.4, yBase: 30, size: 3, offset: 260 },
      { speed: 0.9, yBase: 85, size: 4.5, offset: 380 },
    ];

    birds.forEach((b, idx) => {
      const bx = ((this.animTick * b.speed + b.offset) % (width + 100)) - 50;
      const by = b.yBase + Math.sin(time + idx) * 6;
      const flap = Math.sin(this.animTick * 0.25 + idx * 2) * b.size;

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      // Left wing
      ctx.moveTo(bx - b.size * 2, by - flap);
      ctx.quadraticCurveTo(bx - b.size, by + 1, bx, by);
      // Right wing
      ctx.quadraticCurveTo(bx + b.size, by + 1, bx + b.size * 2, by - flap);
      ctx.stroke();
    });
  }

  // Ornate Medieval/Fantasy Carved Signboard at the edge of the 7 paths
  private renderRadialPortal(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    shortName: string,
    color: string
  ) {
    const pw = 126;
    const ph = 50;
    const px = x - pw / 2;
    const py = y - ph / 2;

    // 1. Soft Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y + ph / 2 + 5, 58, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Wooden Support Posts on Left & Right with Iron Bracket Footings
    const postW = 8;
    const postLeftX = px + 12;
    const postRightX = px + pw - 20;

    // Wooden Posts
    ctx.fillStyle = '#451a03';
    ctx.fillRect(postLeftX, py + 8, postW, ph);
    ctx.fillRect(postRightX, py + 8, postW, ph);

    ctx.fillStyle = '#78350f';
    ctx.fillRect(postLeftX + 2, py + 8, postW - 4, ph);
    ctx.fillRect(postRightX + 2, py + 8, postW - 4, ph);

    // Iron Bracket Footings
    ctx.fillStyle = '#334155';
    ctx.fillRect(postLeftX - 2, py + ph + 2, postW + 4, 5);
    ctx.fillRect(postRightX - 2, py + ph + 2, postW + 4, 5);

    // 3. Wooden Signboard Main Plaque (Warm Dark Oak with Inner Carving)
    // Outer Border / Shadow
    ctx.fillStyle = '#1e0f06';
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 8);
    ctx.fill();

    // Polished Wood Fill
    const woodGrad = ctx.createLinearGradient(px, py, px, py + ph);
    woodGrad.addColorStop(0, '#78350f');
    woodGrad.addColorStop(0.5, '#5c2b09');
    woodGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = woodGrad;
    ctx.beginPath();
    ctx.roundRect(px + 2, py + 2, pw - 4, ph - 4, 7);
    ctx.fill();

    // Subtle Wood Grain Planks Line
    ctx.strokeStyle = '#381604';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 6, py + ph / 2 - 1);
    ctx.lineTo(px + pw - 6, py + ph / 2 - 1);
    ctx.stroke();

    // 4. Ornate Gold Filigree Bezel / Trim
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(px + 3, py + 3, pw - 6, ph - 6, 6);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(px + 5, py + 5, pw - 10, ph - 10, 4);
    ctx.stroke();

    // 5. 4 Brass / Gold Corner Studs (Rivets)
    const studOffsets = [
      [px + 7, py + 7],
      [px + pw - 7, py + 7],
      [px + 7, py + ph - 7],
      [px + pw - 7, py + ph - 7],
    ];
    studOffsets.forEach(([sx, sy]) => {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx - 0.7, sy - 0.7, 1, 0, Math.PI * 2);
      ctx.fill();
    });

    // 6. Top Center Crest: Subject Magical Gem with Subtle Pulse
    const gemPulse = Math.sin(this.animTick * 0.1) * 1.5;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, py + 1, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gem Outer Gold Bezel
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x, py - 3, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Gem Vibrant Subject Color Fill
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, py - 3, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Gem Diamond Specular Highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - 2, py - 5, 2, 0, Math.PI * 2);
    ctx.fill();

    // 7. City Title Text: "Ciudad [Materia]" (High Contrast, Bold, Clean)
    const cityTitle = `Ciudad ${shortName}`;
    ctx.textAlign = 'center';

    // Drop Shadow for text
    ctx.fillStyle = '#0f0702';
    ctx.font = 'bold 12.5px system-ui, -apple-system, sans-serif';
    ctx.fillText(cityTitle, x, y + 2);

    // Main Gold/White text
    ctx.fillStyle = '#fffbeb';
    ctx.fillText(cityTitle, x, y + 1);

    // 8. Bottom Interactive Badge: [A] Entrar (Neat RPG Pill)
    const pillW = 68;
    const pillH = 15;
    const pillX = x - pillW / 2;
    const pillY = y + 7;

    // Dark pill container
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 4);
    ctx.fill();

    // Gold accent border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Key badge [A]
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.fillText('[A]', x - 18, pillY + 11);

    // "Entrar" label
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.fillText('Entrar', x + 9, pillY + 11);

    ctx.textAlign = 'start';
  }

  // --- RENDER SCENE 3: EL CAMINO DE LA MATERIA (4 CIUDADES / BIMESTRES) - ZELDA MINISH CAP QUALITY ---
  public renderMateriaMapScene(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    materiaId: string,
    unlockedCityMax: number,
    season: string
  ) {
    const materia = MATERIAS.find((m) => m.id === materiaId) || MATERIAS[0];
    if (materiaId === 'ingles') {
      this.renderEnglishTownMateriaMap(ctx, width, height, unlockedCityMax, season);
      return;
    }
    if (['matematicas','lenguaje','historia','luces'].includes(materiaId)) {
      this.renderPremiumThematicTown(ctx, width, height, unlockedCityMax, season, materiaId);
      return;
    }

    // 1. Bioma temático como base — para Sonidos usamos pradera lush (como referencia) + piano como avenida, no fondo negro
    if (materiaId === 'matematicas') {
      this.renderMatematicasBiome(ctx, width, height);
    } else if (materiaId === 'lenguaje') {
      this.renderLenguajeBiome(ctx, width, height);
    } else if (materiaId === 'ciencias') {
      this.renderCienciasBiome(ctx, width, height, season);
    } else if (materiaId === 'historia') {
      this.renderHistoriaBiome(ctx, width, height);
    } else if (materiaId === 'luces') {
      this.renderArteBiome(ctx, width, height);
    } else if (materiaId === 'sonidos') {
      // Pradera verde exuberante como en la referencia Zelda (arriba/abajo del piano)
      this.renderGrassBackground(ctx, width, height, season);
      // Notas flotantes sutiles sobre el pasto (no piano plano negro)
      ctx.fillStyle = 'rgba(249,115,22,0.28)';
      ctx.font = 'bold 20px sans-serif';
      const notes = ['🎵','🎶','🎼','🎷'];
      for (let n=0;n<6;n++){
        const nx = 110 + n*110 + this.hash2(n*33, 7)*12;
        const ny = 395 + Math.sin(this.animTick*0.04 + n)*6;
        ctx.fillText(notes[n % notes.length], nx, ny);
      }
      // Gramófonos como monumentos laterales (mantiene identidad musical)
      this.renderGramophoneMonument(ctx, 90, 68);
      this.renderGramophoneMonument(ctx, 670, 68);
    } else {
      this.renderInglesBiome(ctx, width, height);
    }

    // 2. Velo orgánico sutil para unificar bioma con camino (evita el "rectángulo amarillo" feo)
    ctx.fillStyle = 'rgba(12,18,30,0.18)';
    ctx.fillRect(0, 0, width, height);
    // Ruido luminoso muy suave
    for (let i = 0; i < 18; i++) {
      const rx = this.hash2(i * 91, i * 37) * width;
      const ry = this.hash2(i * 53, i * 79) * height;
      const r = 60 + this.hash2(i * 11, i * 19) * 90;
      const g = ctx.createRadialGradient(rx, ry, 0, rx, ry, r);
      g.addColorStop(0, 'rgba(255,255,255,0.07)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(rx, ry, r, 0, Math.PI * 2); ctx.fill();
    }

    // 3. Avenida principal — piedra orgánica o piano 3D si es Música (como referencia)
    const pathY = 282;
    if (materiaId === 'sonidos') {
      // Piano como puente/calle principal con grosor (referencia Zelda)
      this.renderPianoAvenue(ctx, pathY - 17, width);
      // Tierra bajo piano con borde hierba (referencia: tierra marrón bajo piano)
      ctx.fillStyle = '#8b6a3a';
      ctx.fillRect(0, pathY + 30, width, 6);
      // Brillo superior del piano
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(0, pathY - 17, width, 4);
    } else {
      // Sombra difusa bajo avenida
      ctx.fillStyle = 'rgba(20,14,8,0.22)';
      ctx.beginPath();
      ctx.ellipse(width / 2, pathY + 18, width * 0.48, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      // Camino principal irregular
      this.renderStonePath(ctx, -30, pathY - 2, width + 30, pathY + 6, 48);
      // Segunda capa más clara para centro
      this.renderStonePath(ctx, -20, pathY, width + 20, pathY + 2, 30, true);
      // Bordes de piedra con desgaste
      ctx.strokeStyle = 'rgba(95,72,32,0.22)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-10, pathY - 22);
      for (let x = 0; x < width + 10; x += 18) {
        const jy = (this.hash2(x * 0.7, pathY) - 0.5) * 6;
        ctx.lineTo(x, pathY - 22 + jy);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10, pathY + 24);
      for (let x = 0; x < width + 10; x += 18) {
        const jy = (this.hash2(x * 0.7 + 50, pathY + 10) - 0.5) * 6;
        ctx.lineTo(x, pathY + 24 + jy);
      }
      ctx.stroke();
      // Terraplén de tierra bajo el camino (profundidad Zelda referencia)
      ctx.fillStyle = '#9c7a3c';
      ctx.fillRect(0, pathY + 22, width, 8);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, pathY + 28, width, 2);
    }

    // 4. Senderos de conexión hacia cada ciudad (no rectángulos amarillos)
    const citiesX = [180, 370, 560, 720];
    BIMESTRES_INFO.forEach((bInfo, idx) => {
      const cx = citiesX[idx];
      const isUnlocked = bInfo.id <= unlockedCityMax;
      // Camino corto en L orgánica desde avenida hasta la puerta (usa dos segmentos para curva)
      const midY = pathY - 42;
      const col = isUnlocked ? undefined : '#9aa5b8';
      // si está bloqueada, camino desaturado y con maleza
      if (isUnlocked) {
        this.renderStonePath(ctx, cx, pathY - 14, cx + (idx % 2 === 0 ? 8 : -8), 210, 22);
        this.renderStonePath(ctx, cx + (idx % 2 === 0 ? 8 : -8), 210, cx, 170, 18, true);
      } else {
        ctx.fillStyle = 'rgba(148,163,184,0.22)';
        ctx.beginPath(); ctx.roundRect(cx - 11, 210, 22, 62, 6); ctx.fill();
        ctx.strokeStyle = 'rgba(100,116,139,0.25)'; ctx.lineWidth = 1; ctx.stroke();
        // hierbas sobre camino bloqueado
        for (let g = 0; g < 3; g++) {
          const gy = 225 + g * 16;
          ctx.fillStyle = '#4a7c2e';
          ctx.fillRect(cx - 2, gy, 4, 6);
          ctx.fillRect(cx + 6, gy + 4, 3, 5);
        }
      }
      // Pequeña rotonda/plazoleta frente a cada ciudad
      ctx.fillStyle = isUnlocked ? 'rgba(232,220,185,0.85)' : 'rgba(160,170,185,0.32)';
      ctx.beginPath(); ctx.ellipse(cx, 214, 26, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = isUnlocked ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.10)';
      ctx.beginPath(); ctx.ellipse(cx, 217, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
    });

    // 5. Portón oeste para volver a Plaza — con arco y antorchas
    this.renderWoodenGate(ctx, 10, pathY - 45, '◀ Volver a Plaza');
    // Antorchas laterales del portón (luz cálida)
    for (let tx of [0, 54]) {
      const txp = 18 + tx;
      ctx.fillStyle = '#451a03'; ctx.fillRect(txp, pathY - 38, 4, 18);
      if (this.animTick % 8 < 4) {
        this.addFireParticle(txp + 2, pathY - 40);
      }
    }

    // 6. Decoración ambiental entre ciudades (árboles, faroles, parterres, cajas) — como en Plaza y City
    // Faroles cada 2 ciudades y árboles en los laterales para romper el checker
    this.renderLantern(ctx, 95, pathY - 18);
    this.renderLantern(ctx, 295, pathY - 18);
    this.renderLantern(ctx, 485, pathY - 18);
    this.renderLantern(ctx, 675, pathY - 18);
    this.renderTree(ctx, 70, 60, season);
    this.renderTree(ctx, 720, 70, season);
    this.renderFlowerPatch(ctx, 250, 360);
    this.renderFlowerPatch(ctx, 610, 370);
    this.renderWoodenBench(ctx, 260, pathY + 36);
    this.renderWoodenBench(ctx, 620, pathY + 36);
    this.renderTownCratesAndBarrels(ctx, 120, pathY - 52);
    this.renderTownCratesAndBarrels(ctx, 700, pathY + 28);
    // Partículas suaves
    this.addSeasonalParticles(width, height, season);

    // 7. Las 4 ciudades — arquitectura premium por materia + estado
    BIMESTRES_INFO.forEach((bInfo, idx) => {
      const cx = citiesX[idx];
      const isUnlocked = bInfo.id <= unlockedCityMax;
      const isCurrent = bInfo.id <= unlockedCityMax; // todas las desbloqueadas brillan sutil
      this.renderThemedCityBuilding(
        ctx,
        cx,
        126,
        bInfo.label,
        bInfo.name,
        bInfo.months,
        isUnlocked,
        isCurrent,
        materiaId,
        idx + 1,
        materia.color
      );
      // Indicador de progreso: banderín en la ciudad activa, candado grande en bloqueada
      if (isUnlocked && bInfo.id === unlockedCityMax) {
        // Estandarte "¡Aquí!"
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.moveTo(cx + 42, 116); ctx.lineTo(cx + 56, 122); ctx.lineTo(cx + 42, 128); ctx.fill();
        ctx.fillStyle = '#92400e'; ctx.font = 'bold 7px sans-serif'; ctx.fillText('★', cx + 44, 124);
      }
      if (!isUnlocked) {
        // niebla sobre ciudad bloqueada
        ctx.fillStyle = 'rgba(15,23,42,0.28)';
        ctx.fillRect(cx - 46, 122, 92, 96);
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('🔒', cx, 182); ctx.textAlign = 'start';
      }
    });

    // 8. Header superior
    this.renderMateriaHeaderPill(ctx, width / 2, 30, materia.name, materia.color);
    // 9. Viñeteado final para profundidad (como en Plaza)
    this.renderVignette(ctx, width, height);
  }

  // --- THEMED BIOMES FOR THE 7 MATERIAS ---

  // 1. Matemáticas: Blueprint grid, polyhedrons, compass archways & sundials
  private renderMatematicasBiome(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Dark Cyan / Blueprint mathematical grid
    ctx.fillStyle = '#083344';
    ctx.fillRect(0, 0, width, height);

    // Geometric coordinate grid lines
    ctx.strokeStyle = '#0e7490';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Inscribed Geometry circles and golden spirals
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(100, 100, 60, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(680, 100, 60, 0, Math.PI * 2);
    ctx.stroke();

    // Floating Crystalline Polyhedra
    this.renderPolyhedron(ctx, 80, 90, '#22d3ee');
    this.renderPolyhedron(ctx, 280, 80, '#38bdf8');
    this.renderPolyhedron(ctx, 470, 80, '#06b6d4');
    this.renderPolyhedron(ctx, 660, 90, '#67e8f9');

    // Floating Golden Math Glyphs (+, -, ×, ÷, π, ∞)
    ctx.fillStyle = 'rgba(253, 224, 71, 0.4)';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('+', 120, 390);
    ctx.fillText('π', 250, 420);
    ctx.fillText('√', 420, 400);
    ctx.fillText('∞', 620, 410);
    ctx.fillText('∑', 730, 390);
  }

  // 2. Lenguaje: Parchment paper paths, quill feather trees, open books & inkwells
  private renderLenguajeBiome(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Warm Parchment & Library Amber
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#78350f';
    for (let y = 0; y < height; y += 32) {
      for (let x = 0; x < width; x += 32) {
        if ((x / 32 + y / 32) % 2 === 0) ctx.fillRect(x, y, 32, 32);
      }
    }

    // Giant Open Book Monuments in landscape
    this.renderOpenBookMonument(ctx, 80, 75);
    this.renderOpenBookMonument(ctx, 280, 70);
    this.renderOpenBookMonument(ctx, 470, 70);
    this.renderOpenBookMonument(ctx, 660, 75);

    // Floating Letters and Inkpot Wells
    ctx.fillStyle = 'rgba(244, 114, 182, 0.4)';
    ctx.font = 'bold 24px serif';
    ctx.fillText('Aa', 110, 410);
    ctx.fillText('Bb', 260, 420);
    ctx.fillText('Cc', 440, 400);
    ctx.fillText('📖', 620, 410);
    ctx.fillText('✍️', 720, 400);
  }

  // 3. Ciencias: Emerald Forest, bioluminescent mushrooms, river stream & DNA helix
  private renderCienciasBiome(ctx: CanvasRenderingContext2D, width: number, height: number, season: string) {
    this.renderGrassBackground(ctx, width, height, season);
    this.renderRiver(ctx, width, height - 90, 65);

    // Giant Bioluminescent Mushrooms
    this.renderMagicMushroom(ctx, 70, 85, '#ec4899');
    this.renderMagicMushroom(ctx, 275, 75, '#06b6d4');
    this.renderMagicMushroom(ctx, 465, 75, '#84cc16');
    this.renderMagicMushroom(ctx, 655, 85, '#eab308');

    // DNA double helix stone totem
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let y = 370; y < 450; y += 4) {
      const x1 = 120 + Math.sin(y * 0.1) * 14;
      const x2 = 120 - Math.sin(y * 0.1) * 14;
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
    }
    ctx.stroke();
  }

  // 4. Historia: Ancient Stone Citadel, Roman/Colonial columns, stone aqueduct
  private renderHistoriaBiome(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Ancient Sandstone Flagstones
    ctx.fillStyle = '#713f12';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#854d0e';
    for (let y = 0; y < height; y += 32) {
      for (let x = 0; x < width; x += 32) {
        if ((x / 32 + y / 32) % 2 === 0) ctx.fillRect(x, y, 32, 32);
      }
    }

    // Classical Ancient Columns
    this.renderAncientColumn(ctx, 70, 70);
    this.renderAncientColumn(ctx, 275, 65);
    this.renderAncientColumn(ctx, 465, 65);
    this.renderAncientColumn(ctx, 655, 70);

    // Ancient Shields & Banners
    ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
    ctx.font = '24px sans-serif';
    ctx.fillText('🏛️', 110, 410);
    ctx.fillText('🛡️', 260, 420);
    ctx.fillText('📜', 440, 400);
    ctx.fillText('⚔️', 620, 410);
    ctx.fillText('👑', 720, 400);
  }

  // 5. Arte: Rainbow mosaic path, easels, painter palettes & statue pedestals
  private renderArteBiome(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Artist Studio Mosaic Floor
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(0, 0, width, height);

    const colors = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];
    for (let y = 0; y < height; y += 32) {
      for (let x = 0; x < width; x += 32) {
        ctx.fillStyle = colors[(x / 32 + y / 32) % colors.length];
        ctx.fillRect(x + 2, y + 2, 28, 28);
      }
    }

    // Painter Easels with Landscape Canvases
    this.renderPainterEasel(ctx, 75, 75);
    this.renderPainterEasel(ctx, 275, 70);
    this.renderPainterEasel(ctx, 465, 70);
    this.renderPainterEasel(ctx, 655, 75);
  }

  // 6. Música: Piano keyboard pavement, musical staff lines, harp bridges & gramophones
  private renderMusicaBiome(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Musical Studio Floor with Stave Lines
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, width, height);

    // Piano key floor pattern
    for (let x = 0; x < width; x += 28) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x, 0, 26, height);
      if (x % 56 !== 0) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 6, 0, 12, 110);
        ctx.fillRect(x - 6, height - 110, 12, 110);
      }
    }

    // Giant Golden Clef Monuments & Gramophones
    this.renderGramophoneMonument(ctx, 75, 75);
    this.renderGramophoneMonument(ctx, 275, 70);
    this.renderGramophoneMonument(ctx, 465, 70);
    this.renderGramophoneMonument(ctx, 655, 75);

    // Musical Notes in air (🎵, 🎶, 🎼)
    ctx.fillStyle = '#f97316';
    ctx.font = '24px sans-serif';
    ctx.fillText('🎵', 120, 410);
    ctx.fillText('🎶', 270, 420);
    ctx.fillText('🎼', 450, 400);
    ctx.fillText('🎷', 630, 410);
    ctx.fillText('🎹', 730, 400);
  }

  // 7. Inglés: English Town — pradera amigable vibrante (GBA HD, sin ladrillo oscuro)
  private renderInglesBiome(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Base pasto vibrante GBA con variaciones (reusa helper orgánico pero más luminoso)
    this.renderGrassBackground(ctx, width, height, 'primavera');
    // Suaviza con luz cálida
    const g = ctx.createRadialGradient(width*0.5, height*0.35, 80, width*0.5, height*0.35, width*0.7);
    g.addColorStop(0, 'rgba(255,255,255,0.06)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,width,height);
  }

  // Themed City Building Renderer (Unique per subject)
  private renderThemedCityBuilding(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label: string,
    name: string,
    months: string,
    isUnlocked: boolean,
    isCurrent: boolean,
    materiaId: string,
    cityIdx: number,
    color: string
  ) {
    const w = 92;
    const h = 76;
    const cx = x - w / 2;

    // Ground Shadow con gradiente
    const shadowGrad = ctx.createRadialGradient(x, y + h + 4, 6, x, y + h + 4, 48);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.38)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath(); ctx.ellipse(x, y + h + 6, 50, 14, 0, 0, Math.PI * 2); ctx.fill();

    // Base Walls con textura sutil + borde
    const wallGrad = ctx.createLinearGradient(cx, y + 24, cx, y + h);
    if (isUnlocked) {
      wallGrad.addColorStop(0, '#fdfcf8');
      wallGrad.addColorStop(0.45, '#f1f5f9');
      wallGrad.addColorStop(1, '#e2e8f0');
    } else {
      wallGrad.addColorStop(0, '#475569');
      wallGrad.addColorStop(1, '#334155');
    }
    ctx.fillStyle = wallGrad;
    ctx.beginPath(); ctx.roundRect(cx, y + 24, w, h - 24, 4); ctx.fill();
    // Ladrillo/mortero sutil
    ctx.strokeStyle = isUnlocked ? 'rgba(148,163,184,0.22)' : 'rgba(30,41,59,0.35)';
    ctx.lineWidth = 0.8;
    for (let by = y + 32; by < y + h - 4; by += 10) {
      ctx.beginPath(); ctx.moveTo(cx + 4, by); ctx.lineTo(cx + w - 4, by); ctx.stroke();
      if ((by / 10) % 2 === 0) {
        ctx.beginPath(); ctx.moveTo(cx + w/2, by); ctx.lineTo(cx + w/2, by + 10); ctx.stroke();
      }
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1; ctx.strokeRect(cx+0.5, y+24.5, w-1, h-24-1);
    // Ventanas iluminadas si está desbloqueada
    if (isUnlocked) {
      const winY = y + 36;
      for (let wx of [cx + 12, cx + w - 26]) {
        ctx.fillStyle = '#1e293b'; ctx.fillRect(wx, winY, 14, 16);
        const glow = 0.55 + Math.sin(this.animTick * 0.08 + x) * 0.12;
        ctx.fillStyle = `rgba(253,224,71,${glow})`; ctx.fillRect(wx+2, winY+2, 10, 12);
        ctx.fillStyle = '#451a03'; ctx.fillRect(wx+6, winY+2, 2, 12); ctx.fillRect(wx+2, winY+7, 10, 2);
        // reflejo
        ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(wx+3, winY+3, 3, 4);
      }
    }

    // Subject-Themed Roof & Spire Styles — premium con sombras
    // Sombra del techo
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath(); ctx.ellipse(x, y + 28, 48, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = isUnlocked ? color : '#334155';
    if (materiaId === 'matematicas') {
      ctx.beginPath(); ctx.moveTo(cx - 6, y + 26); ctx.lineTo(x, y - 14); ctx.lineTo(cx + w + 6, y + 26); ctx.fill();
      // Tejas hexagonales + spire cristal con brillo
      ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.beginPath(); ctx.moveTo(x-10, y-2); ctx.lineTo(x, y-10); ctx.lineTo(x+10, y-2); ctx.strokeStyle='rgba(255,255,255,0.35)'; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle = '#67e8f9'; ctx.fillRect(x - 3, y - 24, 6, 12);
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(x-1, y-22, 2, 6);
    } else if (materiaId === 'lenguaje') {
      ctx.beginPath(); ctx.moveTo(cx - 8, y + 26); ctx.lineTo(x - 10, y - 6); ctx.lineTo(x, y + 4); ctx.lineTo(x + 10, y - 6); ctx.lineTo(cx + w + 8, y + 26); ctx.fill();
      // Lomo de libro dorado
      ctx.fillStyle = '#fde047'; ctx.fillRect(x-1, y-6, 2, 10);
    } else if (materiaId === 'ciencias') {
      const domeGrad = ctx.createRadialGradient(x, y+18, 8, x, y+18, 46);
      domeGrad.addColorStop(0, isUnlocked ? '#86efac' : '#475569'); domeGrad.addColorStop(1, isUnlocked ? color : '#334155');
      ctx.fillStyle = domeGrad; ctx.beginPath(); ctx.arc(x, y + 24, 46, Math.PI, 0); ctx.fill();
      // Nervaduras de invernadero
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth=1;
      for (let a=-0.7; a<=0.7; a+=0.35){ ctx.beginPath(); ctx.moveTo(x, y+24); ctx.lineTo(x+Math.cos(Math.PI+a)*46, y+24+Math.sin(Math.PI+a)*22); ctx.stroke(); }
    } else if (materiaId === 'historia') {
      ctx.fillRect(cx - 4, y, w + 8, 26);
      for (let bx = cx - 4; bx < cx + w + 8; bx += 16) { ctx.fillRect(bx, y - 8, 10, 8); }
      ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.fillRect(cx-4, y+18, w+8, 4);
    } else if (materiaId === 'luces') {
      const domeGrad2 = ctx.createRadialGradient(x, y+16, 6, x, y+16, 46);
      domeGrad2.addColorStop(0, '#fde68a'); domeGrad2.addColorStop(1, color); ctx.fillStyle=domeGrad2;
      ctx.beginPath(); ctx.arc(x, y + 24, 46, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#fde047'; ctx.fillRect(x - 4, y - 18, 8, 18);
      ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.fillRect(x-2, y-16, 2, 10);
    } else if (materiaId === 'sonidos') {
      // Casa cabaña acogedora con techo naranja (referencia) — desbloqueada naranja, bloqueada azul oscuro
      ctx.fillStyle = isUnlocked ? '#f97316' : '#334155';
      ctx.beginPath(); ctx.moveTo(cx - 6, y + 26); ctx.lineTo(x, y - 18); ctx.lineTo(cx + w + 6, y + 26); ctx.fill();
      // Chimenea a un lado si desbloqueada
      if (isUnlocked) {
        ctx.fillStyle = '#57534e'; ctx.fillRect(x + w/2 + 18, y - 10, 10, 18);
        ctx.fillStyle = '#44403c'; ctx.fillRect(x + w/2 + 18, y - 12, 10, 4);
        // humo si anim
        if (this.animTick % 16 < 8) {
          ctx.fillStyle = 'rgba(255,255,255,0.55)';
          ctx.beginPath(); ctx.arc(x + w/2 + 23 + Math.sin(this.animTick*0.1)*2, y - 18, 3, 0, Math.PI*2); ctx.fill();
        }
      }
      // Nota musical en el frontón si desbloqueada
      if (isUnlocked) {
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('♪', x, y - 2);
        ctx.textAlign = 'start';
      }
    } else {
      ctx.beginPath(); ctx.moveTo(cx - 8, y + 26); ctx.lineTo(x, y - 10); ctx.lineTo(cx + w + 8, y + 26); ctx.fill();
      // Entramado inglés
      ctx.strokeStyle='rgba(60,40,20,0.22)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(cx+12, y+8); ctx.lineTo(cx+w-12, y+8); ctx.stroke();
    }

    // Grand Portal Entrance con marco y luz
    ctx.fillStyle = isUnlocked ? '#0f172a' : '#1e293b';
    ctx.beginPath(); ctx.roundRect(x - 14, y + h - 28, 28, 28, [12, 12, 0, 0]); ctx.fill();
    // Marco piedra
    ctx.strokeStyle = isUnlocked ? '#e7c65a' : '#475569'; ctx.lineWidth=2.2; ctx.stroke();
    // Luz pulsante interior si desbloqueada
    if (isUnlocked) {
      const pulse = 0.65 + Math.sin(this.animTick * 0.12 + x*0.05) * 0.22;
      ctx.fillStyle = `rgba(253,224,71,${pulse})`;
      ctx.beginPath(); ctx.arc(x, y + h - 14, 7.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(x-2, y+h-16, 2.2,0,Math.PI*2); ctx.fill();
      // Antorcha parpadeante a la puerta
      if (this.animTick % 14 < 7) {
        ctx.fillStyle='rgba(251,146,60,0.55)'; ctx.beginPath(); ctx.ellipse(x, y+h+2, 10, 3,0,0,Math.PI*2); ctx.fill();
      }
    } else {
      // Candado metálico
      ctx.fillStyle='#1e293b'; ctx.beginPath(); ctx.roundRect(x-7, y+h-16, 14,11,3); ctx.fill();
      ctx.strokeStyle='#fbbf24'; ctx.lineWidth=1.2; ctx.stroke();
      ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(x, y+h-18, 5, Math.PI,0); ctx.stroke();
      ctx.fillStyle='#e11d48'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center'; ctx.fillText('🔒', x, y+h-7); ctx.textAlign='start';
    }

    // City Name Badge Banner (Fantasy Heraldic Plaque)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(x - 52, y + h + 10, 104, 28, 6);
    ctx.fill();

    ctx.fillStyle = isUnlocked ? '#0f172a' : '#1e293b';
    ctx.beginPath();
    ctx.roundRect(x - 52, y + h + 8, 104, 28, 6);
    ctx.fill();

    ctx.strokeStyle = isUnlocked ? '#f59e0b' : '#64748b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = isUnlocked ? '#fbbf24' : '#cbd5e1';
    ctx.font = 'bold 11.5px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y + h + 22);

    ctx.fillStyle = isUnlocked ? '#94a3b8' : '#64748b';
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.fillText(months, x, y + h + 32);
    ctx.textAlign = 'start';
  }

  // --- RENDER SCENE 4: MAPA DE LA CIUDAD (8 CASAS / SEMANAS COMPLETAMENTE DISTINTAS) ---
  // EVERY SINGLE HOUSE 1 TO 8 IS UNIQUELY DESIGNED
  public renderCityMapScene(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    materiaId: string,
    cityNum: number,
    season: string
  ) {
    const materia = MATERIAS.find((m) => m.id === materiaId) || MATERIAS[0];
    const bInfo = BIMESTRES_INFO[cityNum - 1] || BIMESTRES_INFO[0];

    // 1. Lush Town Grass
    this.renderGrassBackground(ctx, width, height, season);

    // 2. Cobblestone Street Grid (Two Parallel Streets with connecting lane)
    const street1Y = 190;
    const street2Y = 410;

    // Street 1 (Weeks 1 to 4)
    ctx.fillStyle = '#b47834';
    ctx.fillRect(0, street1Y - 20, width, 40);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(0, street1Y - 16, width, 32);

    // Street 2 (Weeks 5 to 8)
    ctx.fillStyle = '#b47834';
    ctx.fillRect(0, street2Y - 20, width, 40);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(0, street2Y - 16, width, 32);

    // Connecting vertical street
    ctx.fillStyle = '#b47834';
    ctx.fillRect(width - 95, street1Y, 40, street2Y - street1Y);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(width - 90, street1Y, 30, street2Y - street1Y);

    // Left exit gate back to Materia Path
    this.renderWoodenGate(ctx, 10, street1Y - 45, '◀ Volver a Ciudad');

    // 3. THE 8 UNIQUE HOUSES (SEMANAS 1 A 8)
    // Row 1: Houses 1, 2, 3, 4
    const row1X = [135, 285, 435, 585];
    this.renderCottageWeek1(ctx, row1X[0], street1Y - 95, materia.color); // Cozy Starter Cabin
    this.renderCottageWeek2(ctx, row1X[1], street1Y - 95, materia.color); // Artisan Workshop
    this.renderCottageWeek3(ctx, row1X[2], street1Y - 95, materia.color); // Clock Tower House
    this.renderCottageWeek4(ctx, row1X[3], street1Y - 95, materia.color); // Botanical Solarium

    // Row 2: Houses 5, 6, 7, 8
    const row2X = [135, 285, 435, 585];
    this.renderCottageWeek5(ctx, row2X[0], street2Y - 95, materia.color); // Tudor Study Library
    this.renderCottageWeek6(ctx, row2X[1], street2Y - 95, materia.color); // Stone Field Manor
    this.renderCottageWeek7(ctx, row2X[2], street2Y - 95, materia.color); // Observatory Dome Tower
    this.renderCottageWeek8(ctx, row2X[3], street2Y - 95, materia.color); // Grand Graduation Castle

    // Render spinning gold coins and treasure chests from objects.png
    row1X.forEach((hx, idx) => {
      this.renderFloatingCoin(ctx, hx + 39, street1Y - 110);
      if (idx === 3) {
        this.renderTreasureChest(ctx, hx + 55, street1Y - 50, false);
      }
    });

    row2X.forEach((hx, idx) => {
      this.renderFloatingCoin(ctx, hx + 39, street2Y - 110);
      if (idx === 3) {
        this.renderTreasureChest(ctx, hx + 55, street2Y - 50, true);
      }
    });

    // Humo solo en 2-3 casas (antes 8) — acogedor sin saturar
    this.addChimneySmoke(row1X[0] + 48, street1Y - 90); // Sem 1
    this.addChimneySmoke(row2X[1] + 48, street2Y - 90); // Sem 6
    this.addChimneySmoke(row1X[3] + 48, street1Y - 90); // Sem 4 (opcional, se ve bien)

    // 4. Street Lamps, Trees & Flowers
    this.renderLantern(ctx, 75, street1Y - 25);
    this.renderLantern(ctx, 75, street2Y - 25);
    this.renderLantern(ctx, width - 110, (street1Y + street2Y) / 2);

    this.renderTree(ctx, 60, 75, season);
    this.renderTree(ctx, width - 45, 80, season);
    this.renderTree(ctx, 60, 310, season);
    this.renderTree(ctx, width - 45, 310, season);

    // Top Header Banner
    this.renderMateriaHeaderPill(
      ctx,
      width / 2,
      32,
      `${materia.name} • ${bInfo.name} (${bInfo.label} - ${bInfo.months})`,
      materia.color
    );
  }

  // --- THE 8 UNIQUE HOUSE ARCHITECTURES ---

  // Semana 1: Cozy Starter Timber Cabin with Round Door & Flower Window Box
  private renderCottageWeek1(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    const w = 78, h = 58;
    this.drawHouseShadow(ctx, x, y, w, h);

    // Log cabin wooden walls
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x, y + 22, w, h - 22);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    for (let ly = y + 26; ly < y + h; ly += 7) {
      ctx.beginPath(); ctx.moveTo(x, ly); ctx.lineTo(x + w, ly); ctx.stroke();
    }

    // Slanted Thatch/Color Roof
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 6, y + 24); ctx.lineTo(x + w / 2, y - 6); ctx.lineTo(x + w + 6, y + 24); ctx.fill();

    // Stone Chimney
    ctx.fillStyle = '#475569'; ctx.fillRect(x + w - 22, y - 2, 10, 16);

    // Round Hobbit-style Wooden Door
    ctx.fillStyle = '#78350f';
    ctx.beginPath(); ctx.arc(x + w / 2, y + h - 11, 11, Math.PI, 0); ctx.fill();

    // Flower window box
    ctx.fillStyle = '#fde047'; ctx.fillRect(x + 8, y + 30, 12, 10);
    ctx.fillStyle = '#ec4899'; ctx.fillRect(x + 6, y + 40, 16, 4);

    this.drawWeekBadge(ctx, x + w / 2, y + 12, 1);
  }

  // Semana 2: Artisan Workshop with Workbench Awning & Oil Lantern
  private renderCottageWeek2(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    const w = 78, h = 58;
    this.drawHouseShadow(ctx, x, y, w, h);

    // Stucco white walls with half-timber cross
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(x, y + 22, w, h - 22);
    ctx.fillStyle = '#78350f'; ctx.fillRect(x, y + 22, 6, h - 22); ctx.fillRect(x + w - 6, y + 22, 6, h - 22);

    // Slanted Awning Roof
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 24); ctx.lineTo(x + w / 2, y - 8); ctx.lineTo(x + w + 4, y + 24); ctx.fill();

    // Workshop Timber Awning Porch
    ctx.fillStyle = '#92400e'; ctx.fillRect(x + 10, y + 34, 30, 6);
    ctx.fillStyle = '#78350f'; ctx.fillRect(x + 12, y + 40, 4, 18); ctx.fillRect(x + 36, y + 40, 4, 18);

    // Tool bench blueprint
    ctx.fillStyle = '#0284c7'; ctx.fillRect(x + 16, y + 46, 16, 6);

    // Arched Door
    ctx.fillStyle = '#78350f'; ctx.fillRect(x + w - 24, y + h - 22, 18, 22);

    this.drawWeekBadge(ctx, x + w / 2, y + 12, 2);
  }

  // Semana 3: Clock Tower House (Tall 2-Story Brick Tower with Round Clock Face)
  private renderCottageWeek3(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    const w = 78, h = 58;
    this.drawHouseShadow(ctx, x, y, w, h);

    // Red brick walls
    ctx.fillStyle = '#991b1b'; ctx.fillRect(x, y + 16, w, h - 16);
    ctx.fillStyle = '#7f1d1d';
    for (let by = y + 20; by < y + h; by += 8) {
      for (let bx = x; bx < x + w; bx += 14) {
        ctx.fillRect(bx + ((by % 16 === 0) ? 0 : 7), by, 12, 2);
      }
    }

    // High Steep Spire Roof
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 18); ctx.lineTo(x + w / 2, y - 16); ctx.lineTo(x + w + 4, y + 18); ctx.fill();

    // Round Clock Face
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x + w / 2, y + 14, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(x + w / 2, y + 14, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x + w / 2, y + 9, 1.5, 5); // clock hands

    // Heavy Double Oak Door
    ctx.fillStyle = '#451a03'; ctx.fillRect(x + w / 2 - 10, y + h - 20, 20, 20);

    this.drawWeekBadge(ctx, x + w / 2, y + 32, 3);
  }

  // Semana 4: Botanical Solarium House with Glass Greenery Sunroom
  private renderCottageWeek4(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    const w = 78, h = 58;
    this.drawHouseShadow(ctx, x, y, w, h);

    // Stone base
    ctx.fillStyle = '#64748b'; ctx.fillRect(x, y + 30, w, h - 30);

    // Vaulted Solarium Glass Roof
    const glassGrad = ctx.createLinearGradient(x, y, x, y + 30);
    glassGrad.addColorStop(0, '#7dd3fc');
    glassGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = glassGrad;
    ctx.beginPath(); ctx.arc(x + w / 2, y + 30, 36, Math.PI, 0); ctx.fill();

    // Solarium Metal Ribs
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x + w / 2, y + 30, 36, Math.PI, 0); ctx.stroke();
    for (let a = Math.PI * 0.2; a < Math.PI * 0.9; a += Math.PI * 0.2) {
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + 30);
      ctx.lineTo(x + w / 2 - Math.cos(a) * 36, y + 30 - Math.sin(a) * 36);
      ctx.stroke();
    }

    // Climbing Greenery Vines
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 4, y + 26, 8, 20);
    ctx.fillRect(x + w - 12, y + 26, 8, 20);

    // Glass French Door
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(x + w / 2 - 8, y + h - 20, 16, 20);

    this.drawWeekBadge(ctx, x + w / 2, y + 16, 4);
  }

  // Semana 5: Tudor Study Library (Timbered 2nd Floor Jutting Out + Bookshelf Sign)
  private renderCottageWeek5(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    const w = 78, h = 58;
    this.drawHouseShadow(ctx, x, y, w, h);

    // Ground Floor: Stone
    ctx.fillStyle = '#475569'; ctx.fillRect(x + 4, y + 36, w - 8, h - 36);

    // Jutting Second Floor: White Stucco & Dark Timber Crosses
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(x - 2, y + 16, w + 4, 20);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x - 2, y + 16, w + 4, 3);
    ctx.fillRect(x - 2, y + 33, w + 4, 3);
    ctx.fillRect(x + 16, y + 16, 4, 20);
    ctx.fillRect(x + w - 20, y + 16, 4, 20);

    // Double Gable Color Roof
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 6, y + 18); ctx.lineTo(x + w / 2, y - 8); ctx.lineTo(x + w + 6, y + 18); ctx.fill();

    // Hanging Book Signboard
    ctx.fillStyle = '#fde047'; ctx.fillRect(x + 8, y + 38, 10, 8);
    ctx.fillStyle = '#78350f'; ctx.fillRect(x + 12, y + 34, 2, 4);

    // Heavy Studded Door
    ctx.fillStyle = '#78350f'; ctx.fillRect(x + w / 2 - 9, y + h - 20, 18, 20);

    this.drawWeekBadge(ctx, x + w / 2, y + 8, 5);
  }

  // Semana 6: Sturdy Fieldstone Manor House (Stone Portico & Double Chimney)
  private renderCottageWeek6(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    const w = 78, h = 58;
    this.drawHouseShadow(ctx, x, y, w, h);

    // Grey Fieldstone Walls
    ctx.fillStyle = '#475569'; ctx.fillRect(x, y + 20, w, h - 20);
    ctx.fillStyle = '#64748b';
    for (let sy = y + 24; sy < y + h; sy += 10) {
      for (let sx = x + 2; sx < x + w - 4; sx += 18) {
        ctx.fillRect(sx, sy, 14, 6);
      }
    }

    // Double Chimneys on Left and Right
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 4, y - 4, 8, 24);
    ctx.fillRect(x + w - 12, y - 4, 8, 24);

    // Slate / Color Mansard Roof
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 6, y + 22); ctx.lineTo(x + w / 2, y - 10); ctx.lineTo(x + w + 6, y + 22); ctx.fill();

    // Arched Stone Portico Entry
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.roundRect(x + w / 2 - 12, y + h - 24, 24, 24, [10, 10, 0, 0]); ctx.fill();

    this.drawWeekBadge(ctx, x + w / 2, y + 10, 6);
  }

  // Semana 7: Mountain Observatory (Cylindrical Stone Tower with Copper Dome & Telescope)
  private renderCottageWeek7(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    const w = 78, h = 58;
    this.drawHouseShadow(ctx, x, y, w, h);

    // Cylindrical Stone Tower Walls
    ctx.fillStyle = '#334155'; ctx.fillRect(x + 8, y + 20, w - 16, h - 20);
    ctx.fillStyle = '#475569'; ctx.fillRect(x + 12, y + 20, w - 24, h - 20);

    // Copper Observatory Hemisphere Dome
    ctx.fillStyle = '#059669';
    ctx.beginPath(); ctx.arc(x + w / 2, y + 20, 30, Math.PI, 0); ctx.fill();

    // Brass Telescope pointing to sky
    ctx.fillStyle = '#f59e0b';
    ctx.save();
    ctx.translate(x + w / 2 + 8, y + 6);
    ctx.rotate(-0.6);
    ctx.fillRect(0, -3, 18, 6);
    ctx.restore();

    // Arched Heavy Door
    ctx.fillStyle = '#0f172a'; ctx.fillRect(x + w / 2 - 9, y + h - 22, 18, 22);

    this.drawWeekBadge(ctx, x + w / 2, y + 28, 7);
  }

  // Semana 8: Grand Graduation & Mastery Mini-Castle (Dual Battlements, Crest & Flags)
  private renderCottageWeek8(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    const w = 78, h = 58;
    this.drawHouseShadow(ctx, x, y, w, h);

    // Castle Main Hall
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(x + 12, y + 18, w - 24, h - 18);

    // Left and Right Castle Towers
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x - 2, y + 8, 18, h - 8);
    ctx.fillRect(x + w - 16, y + 8, 18, h - 8);

    // Tower Battlements (Crenellations)
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x - 4, y + 2, 22, 6);
    ctx.fillRect(x + w - 18, y + 2, 22, 6);

    // Festive Golden Spires on Towers
    ctx.fillStyle = '#fde047';
    ctx.beginPath(); ctx.moveTo(x - 4, y + 2); ctx.lineTo(x + 7, y - 10); ctx.lineTo(x + 18, y + 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + w - 18, y + 2); ctx.lineTo(x + w - 7, y - 10); ctx.lineTo(x + w + 4, y + 2); ctx.fill();

    // Central Color Roof
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 20); ctx.lineTo(x + w / 2, y - 4); ctx.lineTo(x + w - 10, y + 20); ctx.fill();

    // Royal Gold-Framed Castle Door
    ctx.fillStyle = '#78350f';
    ctx.beginPath(); ctx.roundRect(x + w / 2 - 12, y + h - 26, 24, 26, [10, 10, 0, 0]); ctx.fill();
    ctx.strokeStyle = '#fde047'; ctx.lineWidth = 1.5; ctx.stroke();

    this.drawWeekBadge(ctx, x + w / 2, y + 14, 8);
  }

  private drawHouseShadow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 4, 38, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawWeekBadge(ctx: CanvasRenderingContext2D, cx: number, cy: number, weekNum: number) {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(cx - 18, cy - 6, 36, 13, 3);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Sem ${weekNum}`, cx, cy + 3.5);
    ctx.textAlign = 'start';
  }

  // --- RENDER PLAYER AVATAR (EXACT SPRITE MATCH TO CHARACTER.PNG WITH GENDER SUPPORT) ---
  public renderPlayer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: 'up' | 'down' | 'left' | 'right',
    isWalking: boolean,
    animFrame: number,
    profile: ChildProfile
  ) {
    const isGirl = profile.gender === 'girl';
    const pWidth = 32;
    const pHeight = 40;
    const px = x - 16;
    const py = y - 24;

    const walkBob = isWalking ? (animFrame % 2 === 1 ? -2 : 0) : 0;
    const legOffset = isWalking ? (animFrame % 2 === 0 ? 3 : -3) : 0;
    const armSwing = isWalking ? (animFrame % 2 === 0 ? 4 : -4) : 0;

    // 1. Ground Shadow (Oval translucent pixel shadow)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(px + pWidth / 2, py + pHeight + 2, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Shoes / Socks
    if (isGirl) {
      // Cute Ruby / Pink / Burgundy Buckle Mary Jane Shoes + White Ruffle Socks
      const shoeColor = '#9f1239';
      ctx.fillStyle = '#ffffff'; // White ruffle socks
      if (facing === 'down') {
        ctx.fillRect(px + 6, py + pHeight - 7 + legOffset, 7, 3);
        ctx.fillRect(px + pWidth - 13, py + pHeight - 7 - legOffset, 7, 3);
        ctx.fillStyle = shoeColor;
        ctx.fillRect(px + 6, py + pHeight - 4 + legOffset, 7, 4);
        ctx.fillRect(px + pWidth - 13, py + pHeight - 4 - legOffset, 7, 4);
      } else if (facing === 'up') {
        ctx.fillRect(px + 6, py + pHeight - 7 - legOffset, 7, 3);
        ctx.fillRect(px + pWidth - 13, py + pHeight - 7 + legOffset, 7, 3);
        ctx.fillStyle = shoeColor;
        ctx.fillRect(px + 6, py + pHeight - 4 - legOffset, 7, 4);
        ctx.fillRect(px + pWidth - 13, py + pHeight - 4 + legOffset, 7, 4);
      } else if (facing === 'left') {
        ctx.fillRect(px + 7 + legOffset, py + pHeight - 7, 10, 3);
        ctx.fillRect(px + 14 - legOffset, py + pHeight - 7, 7, 3);
        ctx.fillStyle = shoeColor;
        ctx.fillRect(px + 7 + legOffset, py + pHeight - 4, 11, 4);
        ctx.fillRect(px + 14 - legOffset, py + pHeight - 4, 8, 4);
      } else if (facing === 'right') {
        ctx.fillRect(px + 13 - legOffset, py + pHeight - 7, 10, 3);
        ctx.fillRect(px + 9 + legOffset, py + pHeight - 7, 7, 3);
        ctx.fillStyle = shoeColor;
        ctx.fillRect(px + 13 - legOffset, py + pHeight - 4, 11, 4);
        ctx.fillRect(px + 9 + legOffset, py + pHeight - 4, 8, 4);
      }
    } else {
      // Adventurer Boots (Dark brown)
      ctx.fillStyle = '#26170d';
      if (facing === 'down') {
        ctx.fillRect(px + 6, py + pHeight - 5 + legOffset, 7, 5);
        ctx.fillRect(px + pWidth - 13, py + pHeight - 5 - legOffset, 7, 5);
        ctx.fillStyle = '#5c3818';
        ctx.fillRect(px + 6, py + pHeight - 2 + legOffset, 7, 2);
        ctx.fillRect(px + pWidth - 13, py + pHeight - 2 - legOffset, 7, 2);
      } else if (facing === 'up') {
        ctx.fillRect(px + 6, py + pHeight - 5 - legOffset, 7, 5);
        ctx.fillRect(px + pWidth - 13, py + pHeight - 5 + legOffset, 7, 5);
      } else if (facing === 'left') {
        ctx.fillRect(px + 7 + legOffset, py + pHeight - 5, 12, 5);
        ctx.fillRect(px + 14 - legOffset, py + pHeight - 5, 8, 5);
      } else if (facing === 'right') {
        ctx.fillRect(px + 13 - legOffset, py + pHeight - 5, 12, 5);
        ctx.fillRect(px + 9 + legOffset, py + pHeight - 5, 8, 5);
      }
    }

    // 3. Lower Body: Pollera / Skirt (Girl) vs Trousers / Shorts (Boy)
    if (isGirl) {
      const skirtColor = profile.avatar.skirtColor || '#e11d48';
      ctx.fillStyle = skirtColor;

      if (facing === 'down' || facing === 'up') {
        // Flared A-line pleated skirt
        ctx.beginPath();
        ctx.moveTo(px + 6, py + pHeight - 14 + walkBob);
        ctx.lineTo(px + pWidth - 6, py + pHeight - 14 + walkBob);
        ctx.lineTo(px + pWidth - 3, py + pHeight - 6 + walkBob);
        ctx.lineTo(px + 3, py + pHeight - 6 + walkBob);
        ctx.closePath();
        ctx.fill();

        // Skirt pleat shadows & highlights
        ctx.fillStyle = '#be123c';
        ctx.fillRect(px + 10, py + pHeight - 14 + walkBob, 2, 8);
        ctx.fillRect(px + 16, py + pHeight - 14 + walkBob, 2, 8);
        ctx.fillRect(px + 22, py + pHeight - 14 + walkBob, 2, 8);

        // Skirt bottom hem trim (Lace / ribbon)
        ctx.fillStyle = '#fda4af';
        ctx.fillRect(px + 3, py + pHeight - 7 + walkBob, pWidth - 6, 1.5);
      } else {
        // Side view flared skirt
        ctx.beginPath();
        ctx.moveTo(px + 7, py + pHeight - 14 + walkBob);
        ctx.lineTo(px + 25, py + pHeight - 14 + walkBob);
        ctx.lineTo(px + 27, py + pHeight - 6 + walkBob);
        ctx.lineTo(px + 5, py + pHeight - 6 + walkBob);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#be123c';
        ctx.fillRect(px + 15, py + pHeight - 14 + walkBob, 3, 8);
      }
    } else {
      // Dark Charcoal / Slate Shorts (Boy - Prota Sprite)
      const pantsColor = profile.avatar.pantsColor || '#334155';
      ctx.fillStyle = pantsColor;
      if (facing === 'down' || facing === 'up') {
        ctx.fillRect(px + 6, py + pHeight - 13 + walkBob, 8, 8);
        ctx.fillRect(px + pWidth - 14, py + pHeight - 13 + walkBob, 8, 8);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px + 14, py + pHeight - 13 + walkBob, 4, 8);
      } else if (facing === 'left') {
        ctx.fillRect(px + 7 + legOffset, py + pHeight - 13 + walkBob, 11, 8);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px + 13 - legOffset, py + pHeight - 13 + walkBob, 7, 8);
      } else if (facing === 'right') {
        ctx.fillRect(px + 14 - legOffset, py + pHeight - 13 + walkBob, 11, 8);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px + 12 + legOffset, py + pHeight - 13 + walkBob, 7, 8);
      }
    }

    // 4. Shirt / Blouse
    const shirtColor = profile.avatar.outfitColor || (isGirl ? '#f43f5e' : '#cbd5e1');
    ctx.fillStyle = shirtColor;
    ctx.beginPath();
    ctx.roundRect(px + 5, py + 14 + walkBob, pWidth - 10, 14, 3);
    ctx.fill();

    // Dark trim on shirt border / hem
    ctx.fillStyle = isGirl ? '#9d174d' : '#64748b';
    ctx.fillRect(px + 5, py + 26 + walkBob, pWidth - 10, 2);

    // Arms & Hands with walk cycle swing
    ctx.fillStyle = shirtColor;
    if (facing === 'down') {
      ctx.fillRect(px + 2, py + 15 + walkBob + armSwing, 4, 8);
      ctx.fillRect(px + pWidth - 6, py + 15 + walkBob - armSwing, 4, 8);
      ctx.fillStyle = profile.avatar.skinTone || '#ffd1a4';
      ctx.fillRect(px + 2, py + 23 + walkBob + armSwing, 4, 3);
      ctx.fillRect(px + pWidth - 6, py + 23 + walkBob - armSwing, 4, 3);
    } else if (facing === 'up') {
      ctx.fillRect(px + 2, py + 15 + walkBob - armSwing, 4, 8);
      ctx.fillRect(px + pWidth - 6, py + 15 + walkBob + armSwing, 4, 8);
      ctx.fillStyle = profile.avatar.skinTone || '#ffd1a4';
      ctx.fillRect(px + 2, py + 23 + walkBob - armSwing, 4, 3);
      ctx.fillRect(px + pWidth - 6, py + 23 + walkBob + armSwing, 4, 3);
    } else if (facing === 'left') {
      ctx.fillRect(px + 10, py + 15 + walkBob + armSwing, 5, 8);
      ctx.fillStyle = profile.avatar.skinTone || '#ffd1a4';
      ctx.fillRect(px + 10, py + 23 + walkBob + armSwing, 5, 3);
    } else if (facing === 'right') {
      ctx.fillRect(px + 17, py + 15 + walkBob - armSwing, 5, 8);
      ctx.fillStyle = profile.avatar.skinTone || '#ffd1a4';
      ctx.fillRect(px + 17, py + 23 + walkBob - armSwing, 5, 3);
    }

    // Collar or Bow
    ctx.fillStyle = '#ffffff';
    if (facing === 'down') {
      if (isGirl) {
        // Peter Pan collar & cute bow
        ctx.beginPath();
        ctx.arc(px + pWidth / 2 - 4, py + 16 + walkBob, 3, 0, Math.PI * 2);
        ctx.arc(px + pWidth / 2 + 4, py + 16 + walkBob, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24'; // yellow / gold ribbon bow
        ctx.fillRect(px + pWidth / 2 - 2, py + 17 + walkBob, 4, 3);
      } else {
        // Clean Crewneck Collar Line (Boy - Prota Sprite)
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(px + pWidth / 2, py + 14 + walkBob, 4, 0, Math.PI);
        ctx.stroke();
      }
    }

    // 5. Accesorios: Mochila y Capa (se dibujan detrás/delante según facing)
    if (profile.avatar.accessory === 'backpack') {
      ctx.fillStyle = isGirl ? '#ec4899' : '#eab308';
      if (facing === 'up') {
        ctx.beginPath();
        ctx.roundRect(px + 7, py + 15 + walkBob, pWidth - 14, 11, 3);
        ctx.fill();
        ctx.fillStyle = isGirl ? '#db2777' : '#ca8a04';
        ctx.fillRect(px + 9, py + 19 + walkBob, pWidth - 18, 3);
      } else if (facing === 'down') {
        // Mochila visible a los lados cuando mira abajo
        ctx.fillRect(px + 6, py + 16 + walkBob, 3, 9);
        ctx.fillRect(px + pWidth - 9, py + 16 + walkBob, 3, 9);
      } else if (facing === 'left') {
        ctx.beginPath();
        ctx.roundRect(px + pWidth - 8, py + 15 + walkBob, 6, 11, 2);
        ctx.fill();
      } else if (facing === 'right') {
        ctx.beginPath();
        ctx.roundRect(px + 2, py + 15 + walkBob, 6, 11, 2);
        ctx.fill();
      }
    }
    if (profile.avatar.accessory === 'cape') {
      const capeColor = isGirl ? '#ec4899' : '#dc2626';
      const capeShadow = isGirl ? '#831843' : '#991b1b';
      ctx.fillStyle = capeShadow;
      if (facing === 'up') {
        ctx.beginPath();
        ctx.roundRect(px + 6, py + 16 + walkBob, pWidth - 12, 14, 3);
        ctx.fill();
        ctx.fillStyle = capeColor;
        ctx.beginPath();
        ctx.roundRect(px + 7, py + 17 + walkBob, pWidth - 14, 12, 3);
        ctx.fill();
      } else if (facing === 'down') {
        // Capa flameando detrás
        ctx.fillStyle = capeShadow;
        ctx.fillRect(px + 4, py + 18 + walkBob, pWidth - 8, 10);
        ctx.fillStyle = capeColor;
        ctx.fillRect(px + 5, py + 19 + walkBob, pWidth - 10, 8);
        // Brillo
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(px + 7, py + 19 + walkBob, pWidth - 14, 2);
      } else if (facing === 'left') {
        ctx.fillStyle = capeShadow;
        ctx.beginPath();
        ctx.roundRect(px + 3, py + 15 + walkBob, 9, 13, 2);
        ctx.fill();
        ctx.fillStyle = capeColor;
        ctx.beginPath();
        ctx.roundRect(px + 4, py + 16 + walkBob, 7, 11, 2);
        ctx.fill();
      } else if (facing === 'right') {
        ctx.fillStyle = capeShadow;
        ctx.beginPath();
        ctx.roundRect(px + pWidth - 12, py + 15 + walkBob, 9, 13, 2);
        ctx.fill();
        ctx.fillStyle = capeColor;
        ctx.beginPath();
        ctx.roundRect(px + pWidth - 11, py + 16 + walkBob, 7, 11, 2);
        ctx.fill();
      }
    }

    // 6. Head / Face (big expressive anime eyes & clean skin)
    ctx.fillStyle = profile.avatar.skinTone || '#ffd1a4';
    ctx.beginPath();
    ctx.arc(px + pWidth / 2, py + 9 + walkBob, 10, 0, Math.PI * 2);
    ctx.fill();

     // 7. Hair corregido: rostros normales visibles (cara no tapada, ojos sobre piel)
    if (isGirl) {
      const hairColor = profile.avatar.hairColor || "#451a03";
      const hairHighlight = "#78350f";
      ctx.fillStyle = hairColor;

      if (facing === "down") {
        ctx.beginPath();
        ctx.arc(px + pWidth / 2, py + 5 + walkBob, 9.5, Math.PI, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(px + 2, py + 8 + walkBob, 5, 11, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(px + pWidth - 7, py + 8 + walkBob, 5, 11, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(px + 6, py + 3 + walkBob);
        ctx.quadraticCurveTo(px + 12, py + 6 + walkBob, px + 15, py + 3 + walkBob);
        ctx.quadraticCurveTo(px + 19, py + 6 + walkBob, px + 26, py + 3 + walkBob);
        ctx.lineTo(px + 26, py + 1 + walkBob);
        ctx.lineTo(px + 6, py + 1 + walkBob);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = hairHighlight;
        ctx.fillRect(px + 10, py + 2 + walkBob, 12, 1.5);
        ctx.fillStyle = "#ec4899";
        ctx.fillRect(px + 2, py + 5 + walkBob, 4, 4);
        ctx.fillRect(px + pWidth - 6, py + 5 + walkBob, 4, 4);
        ctx.fillStyle = "#fde047";
        ctx.fillRect(px + 3, py + 6 + walkBob, 2, 2);
        ctx.fillRect(px + pWidth - 5, py + 6 + walkBob, 2, 2);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(px + 9, py + 9 + walkBob, 3, 3);
        ctx.fillRect(px + 20, py + 9 + walkBob, 3, 3);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(px + 10, py + 9 + walkBob, 1.5, 1.5);
        ctx.fillRect(px + 21, py + 9 + walkBob, 1.5, 1.5);
        ctx.fillStyle = "rgba(244, 114, 182, 0.65)";
        ctx.fillRect(px + 7, py + 12 + walkBob, 3, 1.5);
        ctx.fillRect(px + 22, py + 12 + walkBob, 3, 1.5);
        ctx.strokeStyle = "#9d174d";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(px + pWidth / 2, py + 12 + walkBob, 2.5, 0.2, Math.PI - 0.2);
        ctx.stroke();
      } else if (facing === "up") {
        ctx.beginPath();
        ctx.arc(px + pWidth / 2, py + 6 + walkBob, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(px + 4, py + 7 + walkBob, pWidth - 8, 14, 4);
        ctx.fill();
        ctx.fillStyle = hairHighlight;
        ctx.fillRect(px + 10, py + 8 + walkBob, 12, 1.5);
        ctx.fillStyle = "#ec4899";
        ctx.fillRect(px + pWidth / 2 - 4, py + 5 + walkBob, 8, 4);
        ctx.fillStyle = "#fde047";
        ctx.fillRect(px + pWidth / 2 - 1.5, py + 6 + walkBob, 3, 2);
      } else if (facing === "left") {
        ctx.beginPath();
        ctx.arc(px + pWidth / 2 + 1, py + 6 + walkBob, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(px + 15, py + 9 + walkBob, 10, 13, 4);
        ctx.fill();
        ctx.fillStyle = "#ec4899";
        ctx.fillRect(px + 10, py + 4 + walkBob, 3, 3);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(px + 7, py + 9 + walkBob, 3, 3);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(px + 8, py + 9 + walkBob, 1.5, 1.5);
      } else if (facing === "right") {
        ctx.beginPath();
        ctx.arc(px + pWidth / 2 - 1, py + 6 + walkBob, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(px + 7, py + 9 + walkBob, 10, 13, 4);
        ctx.fill();
        ctx.fillStyle = "#ec4899";
        ctx.fillRect(px + 19, py + 4 + walkBob, 3, 3);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(px + 22, py + 9 + walkBob, 3, 3);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(px + 23, py + 9 + walkBob, 1.5, 1.5);
      }
    } else {
      const hairBase = profile.avatar.hairColor || "#18181b";
      const hairShade = "#27272a";
      const hairHighlight = "#3f3f46";

      if (facing === "down") {
        ctx.fillStyle = hairBase;
        ctx.beginPath();
        ctx.arc(px + pWidth / 2, py + 5 + walkBob, 9, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(px + 4, py + 5 + walkBob, 5, 4);
        ctx.fillRect(px + pWidth - 9, py + 5 + walkBob, 5, 4);
        ctx.beginPath();
        ctx.moveTo(px + 6, py + 3 + walkBob);
        ctx.quadraticCurveTo(px + 11, py + 6 + walkBob, px + 14, py + 3 + walkBob);
        ctx.quadraticCurveTo(px + 18, py + 6 + walkBob, px + 26, py + 3 + walkBob);
        ctx.lineTo(px + 26, py + 1 + walkBob);
        ctx.lineTo(px + 6, py + 1 + walkBob);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = hairHighlight;
        ctx.fillRect(px + 10, py + 2 + walkBob, 12, 1.2);
        ctx.fillStyle = "#09090b";
        ctx.fillRect(px + 9, py + 9 + walkBob, 3, 3);
        ctx.fillRect(px + 20, py + 9 + walkBob, 3, 3);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(px + 10, py + 9 + walkBob, 1.5, 1.5);
        ctx.fillRect(px + 21, py + 9 + walkBob, 1.5, 1.5);
        ctx.fillStyle = "rgba(244, 114, 182, 0.45)";
        ctx.fillRect(px + 7, py + 12 + walkBob, 3, 1.5);
        ctx.fillRect(px + 22, py + 12 + walkBob, 3, 1.5);
        ctx.strokeStyle = "#6b3614";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(px + pWidth / 2, py + 12 + walkBob, 2.5, 0.2, Math.PI - 0.2);
        ctx.stroke();
      } else if (facing === "up") {
        ctx.fillStyle = hairBase;
        ctx.beginPath();
        ctx.arc(px + pWidth / 2, py + 6 + walkBob, 9.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = hairShade;
        ctx.fillRect(px + 7, py + 12 + walkBob, pWidth - 14, 2);
        ctx.fillStyle = hairHighlight;
        ctx.fillRect(px + 10, py + 3 + walkBob, 12, 1.5);
      } else if (facing === "left") {
        ctx.fillStyle = hairBase;
        ctx.beginPath();
        ctx.arc(px + pWidth / 2, py + 6 + walkBob, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = hairHighlight;
        ctx.fillRect(px + 11, py + 2 + walkBob, 8, 1.2);
        ctx.fillStyle = "#09090b";
        ctx.fillRect(px + 7, py + 9 + walkBob, 3, 3);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(px + 8, py + 9 + walkBob, 1.5, 1.5);
      } else if (facing === "right") {
        ctx.fillStyle = hairBase;
        ctx.beginPath();
        ctx.arc(px + pWidth / 2, py + 6 + walkBob, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = hairHighlight;
        ctx.fillRect(px + 13, py + 2 + walkBob, 8, 1.2);
        ctx.fillStyle = "#09090b";
        ctx.fillRect(px + 22, py + 9 + walkBob, 3, 3);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(px + 23, py + 9 + walkBob, 1.5, 1.5);
      }
    }

    // 8. Accesorios faciales: Gafas y Medalla (sobre rostro/pecho, visibles en juego)
    if (profile.avatar.accessory === 'glasses') {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.2;
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      if (facing === 'down') {
        ctx.strokeRect(px + 7, py + 8 + walkBob, 6, 4);
        ctx.strokeRect(px + 19, py + 8 + walkBob, 6, 4);
        ctx.beginPath();
        ctx.moveTo(px + 13, py + 10 + walkBob);
        ctx.lineTo(px + 19, py + 10 + walkBob);
        ctx.stroke();
        ctx.fillRect(px + 8, py + 8.5 + walkBob, 4, 0.8);
        ctx.fillRect(px + 20, py + 8.5 + walkBob, 4, 0.8);
      } else if (facing === 'left') {
        ctx.strokeRect(px + 5, py + 8 + walkBob, 6, 4);
        ctx.fillRect(px + 6, py + 8.5 + walkBob, 4, 0.8);
      } else if (facing === 'right') {
        ctx.strokeRect(px + 21, py + 8 + walkBob, 6, 4);
        ctx.fillRect(px + 22, py + 8.5 + walkBob, 4, 0.8);
      } else if (facing === 'up') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px + 8, py + 6 + walkBob, 16, 1.5);
      }
    }
    if (profile.avatar.accessory === 'medal') {
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 1;
      const medalX = px + pWidth / 2;
      const medalY = py + 22 + walkBob;
      ctx.beginPath();
      ctx.arc(medalX, medalY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 4px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★', medalX, medalY + 1.5);
      ctx.textAlign = 'start';
      ctx.fillStyle = isGirl ? '#ec4899' : '#2563eb';
      ctx.fillRect(medalX - 3, medalY - 6, 2, 4);
      ctx.fillRect(medalX + 1, medalY - 6, 2, 4);
    }
  }
// --- RENDER PARTICLES OVERLAY ---
  public renderParticles(ctx: CanvasRenderingContext2D) {
    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'smoke') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'leaf' || p.type === 'petal') {
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size, p.size * 0.6, p.life * 0.1, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'sparkle' || p.type === 'fire' || p.type === 'light_mote') {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else if (p.type === 'dust') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  // --- HELPER PIXEL ART SUB-COMPONENTS ---

  // deterministic pseudo-random 0..1 from coordinates
  private hash2(x: number, y: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  private renderGrassBackground(ctx: CanvasRenderingContext2D, width: number, height: number, season: string) {
    // Paleta orgánica — verdes saturados naturales, sin neón
    let baseTop = '#5a9e3a';
    let baseBottom = '#3d7a2e';
    let patchDark = '#2f5a22';
    let patchLight = '#7cb85a';
    let patchMid = '#4e8c33';
    let flowerColors = ['#fde68a', '#f9a8d4', '#7dd3fc', '#ffffff', '#fbbf24'];
    let bladeDark = '#2d4a1f';
    let bladeLight = '#8fc46a';

    if (season === 'otono') {
      baseTop = '#7a9a3a';
      baseBottom = '#5a7a2e';
      patchDark = '#4a5d1f';
      patchLight = '#a8b860';
      patchMid = '#8a7a2e';
      flowerColors = ['#fb923c', '#fde68a', '#f97316', '#fde047'];
      bladeDark = '#3d4a1a';
      bladeLight = '#c4b45a';
    } else if (season === 'primavera') {
      baseTop = '#66b848';
      baseBottom = '#4a9a2e';
      patchDark = '#3a7a22';
      patchLight = '#9ad67a';
      patchMid = '#5cb83a';
      flowerColors = ['#f9a8d4', '#fda4af', '#fde68a', '#ffffff', '#c4b5fd'];
      bladeDark = '#2e5a1f';
      bladeLight = '#a8e08a';
    }

    // 1. Base con gradiente vertical suave (profundidad)
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, baseTop);
    bg.addColorStop(0.55, patchMid);
    bg.addColorStop(1, baseBottom);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // 2. Ruido orgánico de luminosidad con elipses grandes y suaves
    for (let y = 0; y < height; y += 48) {
      for (let x = 0; x < width; x += 52) {
        const h = this.hash2(x, y);
        const hx = (h - 0.5) * 28;
        const hy = (this.hash2(x + 99, y + 17) - 0.5) * 28;
        const cx = x + 26 + hx;
        const cy = y + 24 + hy;
        if (cx < -10 || cx > width + 10 || cy < -10 || cy > height + 10) continue;
        const r = 18 + this.hash2(x + 7, y + 31) * 22;
        const isDark = h < 0.5;
        ctx.fillStyle = isDark ? 'rgba(35, 70, 25, 0.18)' : 'rgba(160, 200, 120, 0.14)';
        // elipse irregular
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.7, this.hash2(x + 3, y + 9) * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Manchas de pasto más oscuro/claro con elipses pequeñas (variación de tono)
    for (let y = 8; y < height; y += 22) {
      for (let x = 8; x < width; x += 24) {
        const h = this.hash2(x * 1.3, y * 1.7);
        if (h < 0.22) {
          ctx.fillStyle = patchDark;
          ctx.globalAlpha = 0.22;
          ctx.beginPath();
          ctx.ellipse(x + (h - 0.5) * 10, y + (this.hash2(x + 50, y) - 0.5) * 8, 7, 4, h * Math.PI, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else if (h > 0.82) {
          ctx.fillStyle = patchLight;
          ctx.globalAlpha = 0.20;
          ctx.beginPath();
          ctx.ellipse(x, y, 6, 3.5, h * Math.PI, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    }

    // 4. Briznas de pasto (líneas 2-3px) dispersas con ruido determinista
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    for (let y = 6; y < height; y += 14) {
      for (let x = 6; x < width; x += 18) {
        const h = this.hash2(x * 2.1, y * 2.3);
        if (h > 0.62) {
          const bx = x + (this.hash2(x + 11, y + 13) - 0.5) * 8;
          const by = y + (this.hash2(x + 23, y + 41) - 0.5) * 6;
          const len = 2 + this.hash2(x + 77, y + 19) * 3;
          const lean = (this.hash2(x + 5, y + 5) - 0.5) * 1.2;
          ctx.strokeStyle = h > 0.84 ? bladeLight : bladeDark;
          ctx.globalAlpha = 0.55;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + lean, by - len);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    // 5. Flores dispersas con ruido determinista — sin patrón cuadrado, con pétalos y centro
    for (let y = 16; y < height; y += 26) {
      for (let x = 10; x < width; x += 28) {
        const h = this.hash2(x * 0.9, y * 1.1 + 100);
        if (h < 0.07) {
          const fx = x + (this.hash2(x + 200, y) - 0.5) * 16;
          const fy = y + (this.hash2(x, y + 200) - 0.5) * 16;
          const col = flowerColors[Math.floor(this.hash2(x + 33, y + 33) * flowerColors.length) % flowerColors.length];
          const scale = 0.9 + this.hash2(x + 77, y + 77) * 0.5;
          // pétalos 4-5
          ctx.fillStyle = col;
          for (let p = 0; p < 5; p++) {
            const ang = (p / 5) * Math.PI * 2;
            const px = fx + Math.cos(ang) * 3.2 * scale;
            const py = fy + Math.sin(ang) * 3.2 * scale;
            ctx.beginPath();
            ctx.arc(px, py, 1.7 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
          // centro amarillo/blanco
          ctx.fillStyle = h < 0.035 ? '#fef08a' : '#fef9c3';
          ctx.beginPath();
          ctx.arc(fx, fy, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
          // tallito sutil
          ctx.strokeStyle = 'rgba(45, 90, 30, 0.5)';
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(fx, fy + 1);
          ctx.lineTo(fx, fy + 3);
          ctx.stroke();
        }
      }
    }

    // 6. Sombreado suave de profundidad en bordes inferiores y motas de tierra
    const vignGrass = ctx.createRadialGradient(width * 0.5, height * 0.5, Math.min(width, height) * 0.35, width * 0.5, height * 0.5, Math.max(width, height) * 0.75);
    vignGrass.addColorStop(0, 'rgba(0,0,0,0)');
    vignGrass.addColorStop(1, 'rgba(20, 35, 15, 0.18)');
    ctx.fillStyle = vignGrass;
    ctx.fillRect(0, 0, width, height);
  }

  // --- 3-PHASE CIRCULAR STONE FOUNTAIN (OVERWORLD.PNG ASSET STYLE) ---
  private renderFountain(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    // 1. Outer Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 12, 46, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Carved Outer Stone Basin (Tier 1)
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 6, 44, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 3, 42, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stone rim blocks
    ctx.fillStyle = '#94a3b8';
    for (let a = 0; a < Math.PI * 2; a += 0.5) {
      const rx = cx + Math.cos(a) * 40;
      const ry = cy + 3 + Math.sin(a) * 20;
      ctx.fillRect(rx - 2, ry - 2, 4, 3);
    }

    // 3. Deep Crystal Water Pool with Gradient & Waves
    const waterGrad = ctx.createRadialGradient(cx, cy + 3, 4, cx, cy + 3, 36);
    waterGrad.addColorStop(0, '#7dd3fc');
    waterGrad.addColorStop(0.5, '#0284c7');
    waterGrad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 3, 36, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dynamic 3-phase water ripple rings
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.7)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const ripplePhase = ((this.animTick * 0.8 + i * 14) % 36);
      ctx.beginPath();
      ctx.ellipse(cx, cy + 3, ripplePhase, ripplePhase * 0.46, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 4. Central Stone Pedestal (Tier 2)
    ctx.fillStyle = '#334155';
    ctx.fillRect(cx - 10, cy - 24, 20, 24);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(cx - 8, cy - 22, 16, 20);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(cx - 6, cy - 22, 4, 20);

    // 5. Upper Stone Basin (Tier 3)
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 24, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 25, 13, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. Ornamental Spire & 3 Animated Water Jets Arching into Basin
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.arc(cx, cy - 32, 6, 0, Math.PI * 2);
    ctx.fill();

    // Central Upward Water Geyser
    const spurtY = cy - 42 + Math.sin(this.animTick * 0.2) * 3;
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.arc(cx, spurtY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 3 Left, Center and Right Arched Water Jets falling into the pool
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.85)';
    ctx.lineWidth = 2;

    // Left Jet
    ctx.beginPath();
    ctx.moveTo(cx, cy - 32);
    ctx.quadraticCurveTo(cx - 24, cy - 36 + Math.sin(this.animTick * 0.15) * 2, cx - 22, cy + 2);
    ctx.stroke();

    // Right Jet
    ctx.beginPath();
    ctx.moveTo(cx, cy - 32);
    ctx.quadraticCurveTo(cx + 24, cy - 36 + Math.cos(this.animTick * 0.15) * 2, cx + 22, cy + 2);
    ctx.stroke();

    // Water Splash Dots in pool
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 23 + (this.animTick % 3), cy + 1, 3, 2);
    ctx.fillRect(cx + 21 - (this.animTick % 3), cy + 1, 3, 2);
  }

  // --- MARKET STALL WITH STRIPED AWNING (OVERWORLD.PNG ASSET STYLE) ---
  private renderMarketStall(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const w = 72;
    const h = 54;

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 2, w / 2 + 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden Counter Base
    ctx.fillStyle = '#5c3315';
    ctx.fillRect(x + 4, y + 26, w - 8, 26);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 6, y + 28, w - 12, 22);

    // Front Wooden Planks
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x + 6, y + 34, w - 12, 2);
    ctx.fillRect(x + 6, y + 42, w - 12, 2);

    // Wooden Counter Top Board
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 2, y + 23, w - 4, 5);

    // Wooden Support Pillars for Awning
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x + 6, y + 4, 4, 22);
    ctx.fillRect(x + w - 10, y + 4, 4, 22);

    // Striped Awning: Blue & White (Overworld.png Style)
    const stripeW = 8;
    const numStripes = 9;
    for (let i = 0; i < numStripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#2563eb' : '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(x + i * stripeW, y + 8);
      ctx.lineTo(x + (i + 1) * stripeW, y + 8);
      ctx.lineTo(x + (i + 1) * stripeW, y + 20);
      ctx.lineTo(x + i * stripeW, y + 20);
      ctx.fill();

      // Scalloped Awning Fringe
      ctx.beginPath();
      ctx.arc(x + i * stripeW + stripeW / 2, y + 20, stripeW / 2, 0, Math.PI);
      ctx.fill();
    }

    // Top Awning Cap
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(x - 2, y + 5, w + 4, 4);

    // Produce Crates on Counter: Red Apples & Golden Pears
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 10, y + 15, 20, 9);
    ctx.fillRect(x + 36, y + 15, 20, 9);

    // Apples
    ctx.fillStyle = '#dc2626';
    ctx.beginPath(); ctx.arc(x + 15, y + 16, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 21, y + 16, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 26, y + 16, 3, 0, Math.PI * 2); ctx.fill();

    // Pears / Lemons
    ctx.fillStyle = '#eab308';
    ctx.beginPath(); ctx.arc(x + 41, y + 16, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 47, y + 16, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 52, y + 16, 3, 0, Math.PI * 2); ctx.fill();

    // Hanging Brass Lantern
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 12, y + 22, 5, 7);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 13, y + 24, 3, 3);

    // Stall Banner Sign: "Tienda de Recompensas"
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.roundRect(x + 8, y - 6, w - 16, 12, 3); ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 8px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⭐ Tienda ⭐', x + w / 2, y + 2.5);
    ctx.textAlign = 'start';
  }

  // --- WOODEN TOWN BENCH (OVERWORLD.PNG ASSET STYLE) ---
  private renderWoodenBench(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath(); ctx.ellipse(x + 18, y + 16, 18, 5, 0, 0, Math.PI * 2); ctx.fill();

    // Cast iron legs
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 2, y + 6, 3, 10);
    ctx.fillRect(x + 31, y + 6, 3, 10);

    // Wooden Slat Backrest
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x, y - 2, 36, 4);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x, y + 3, 36, 4);

    // Wooden Slat Seat
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x - 2, y + 8, 40, 5);
  }

  // --- TOWN CRATES & BARRELS (OVERWORLD.PNG ASSET STYLE) ---
  private renderTownCratesAndBarrels(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Barrel 1
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath(); ctx.ellipse(x + 10, y + 24, 10, 4, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#78350f';
    ctx.beginPath(); ctx.roundRect(x, y + 4, 18, 20, 4); ctx.fill();
    // Metal barrel hoops
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x, y + 8, 18, 2);
    ctx.fillRect(x, y + 18, 18, 2);

    // Wooden Crate Stack
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath(); ctx.ellipse(x + 30, y + 24, 12, 4, 0, 0, Math.PI * 2); ctx.fill();

    // Bottom Crate
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 18, y + 8, 20, 16);
    ctx.fillStyle = '#78350f';
    ctx.strokeRect(x + 18.5, y + 8.5, 19, 15);
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 8); ctx.lineTo(x + 38, y + 24);
    ctx.moveTo(x + 38, y + 8); ctx.lineTo(x + 18, y + 24);
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1; ctx.stroke();

    // Top Crate
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x + 22, y - 4, 16, 12);
    ctx.strokeStyle = '#92400e';
    ctx.strokeRect(x + 22.5, y - 3.5, 15, 11);
  }

  // --- FLOATING SPINNING GOLD COIN (OBJECTS.PNG ASSET STYLE) ---
  public renderFloatingCoin(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const coinScale = Math.cos(this.animTick * 0.1);
    const bob = Math.sin(this.animTick * 0.15) * 3;
    const cy = y + bob;

    ctx.save();
    ctx.translate(x, cy);
    ctx.scale(Math.abs(coinScale) < 0.15 ? 0.15 : coinScale, 1);

    // Gold Outer Rim
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();

    // Gold Center
    ctx.fillStyle = '#fde047';
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();

    // Star / Crown Emblem in Coin
    ctx.fillStyle = '#ca8a04';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★', 0, 3);

    ctx.restore();

    // Gleam sparkles
    if (this.animTick % 20 < 6) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 5, cy - 7, 2, 2);
    }
  }

  // --- TREASURE CHEST (OBJECTS.PNG ASSET STYLE) ---
  public renderTreasureChest(ctx: CanvasRenderingContext2D, x: number, y: number, isOpen: boolean) {
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath(); ctx.ellipse(x + 12, y + 20, 14, 5, 0, 0, Math.PI * 2); ctx.fill();

    // Chest Body
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x, y + 6, 24, 14);

    // Gold Corners & Edge Trim
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x, y + 6, 3, 14);
    ctx.fillRect(x + 21, y + 6, 3, 14);
    ctx.fillRect(x, y + 17, 24, 3);

    if (isOpen) {
      // Open Chest Lid tilted back
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.moveTo(x - 2, y + 6);
      ctx.lineTo(x + 12, y - 6);
      ctx.lineTo(x + 26, y + 6);
      ctx.fill();

      // Golden Treasure glow inside
      ctx.fillStyle = '#fde047';
      ctx.fillRect(x + 4, y + 6, 16, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 6, y + 5, 4, 4); // Ruby
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 14, y + 5, 4, 4); // Sapphire
    } else {
      // Closed Chest Dome Lid
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.arc(x + 12, y + 6, 12, Math.PI, 0);
      ctx.fill();

      // Gold Lock Clasp
      ctx.fillStyle = '#fde047';
      ctx.fillRect(x + 10, y + 8, 4, 6);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + 11, y + 11, 2, 2);
    }
  }

  private renderRiver(ctx: CanvasRenderingContext2D, width: number, y: number, rHeight: number) {
    ctx.fillStyle = '#b47834';
    ctx.fillRect(0, y - 6, width, rHeight + 12);

    const riverGrad = ctx.createLinearGradient(0, y, 0, y + rHeight);
    riverGrad.addColorStop(0, '#0284c7');
    riverGrad.addColorStop(0.5, '#0ea5e9');
    riverGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = riverGrad;
    ctx.fillRect(0, y, width, rHeight);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const lineY = y + 12 + i * 14;
      const waveOffset = (this.animTick * 1.5 + i * 40) % (width + 60);
      ctx.beginPath();
      ctx.moveTo(waveOffset - 60, lineY);
      ctx.lineTo(waveOffset, lineY);
      ctx.stroke();
    }

    const bridgeX = width / 2 - 30;
    ctx.fillStyle = '#78350f';
    ctx.fillRect(bridgeX, y - 4, 60, rHeight + 8);
    ctx.fillStyle = '#d97706';
    for (let by = y; by < y + rHeight; by += 8) {
      ctx.fillRect(bridgeX + 2, by, 56, 6);
    }
  }

  private renderTree(ctx: CanvasRenderingContext2D, x: number, y: number, season: string) {
    let topColor = '#7ec84a';
    let midColor = '#4e9b2e';
    let baseColor = '#2f5e1f';
    let deepShadow = '#1e3a15';

    if (season === 'otono') {
      topColor = '#fbbf24';
      midColor = '#d97706';
      baseColor = '#7c3a0a';
      deepShadow = '#4a1f05';
    } else if (season === 'primavera') {
      topColor = '#86efac';
      midColor = '#4ade80';
      baseColor = '#166534';
      deepShadow = '#0f3a20';
    }

    // Sombra proyectada más voluminosa y suave (profundidad)
    const shadowGrad = ctx.createRadialGradient(x + 4, y + 36, 4, x + 4, y + 36, 34);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.38)');
    shadowGrad.addColorStop(0.55, 'rgba(0,0,0,0.22)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(x + 4, y + 36, 32, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    // segunda sombra ocluida bajo tronco
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(x + 8, y + 34, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tronco con textura de corteza
    ctx.fillStyle = '#5c3315';
    ctx.beginPath();
    ctx.roundRect(x - 7, y + 8, 14, 28, 3);
    ctx.fill();
    // veta clara
    ctx.fillStyle = '#7a4a1f';
    ctx.fillRect(x - 4, y + 10, 3, 24);
    // veta oscura
    ctx.fillStyle = '#3d1d07';
    ctx.fillRect(x + 3, y + 10, 4, 26);
    // anillos de corteza sutiles
    ctx.strokeStyle = 'rgba(45,20,5,0.35)';
    ctx.lineWidth = 1;
    for (let ly = y + 14; ly < y + 32; ly += 6) {
      ctx.beginPath();
      ctx.moveTo(x - 6, ly);
      ctx.quadraticCurveTo(x, ly + 1, x + 6, ly);
      ctx.stroke();
    }
    // base tronco ensanchada
    ctx.fillStyle = '#3d1d07';
    ctx.beginPath();
    ctx.ellipse(x, y + 36, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Follaje voluminoso — 4 capas con sombras internas
    // Capa trasera oscura (oclusión)
    ctx.fillStyle = deepShadow;
    ctx.beginPath();
    ctx.arc(x - 16, y + 8, 19, 0, Math.PI * 2);
    ctx.arc(x + 16, y + 8, 19, 0, Math.PI * 2);
    ctx.arc(x, y - 2, 24, 0, Math.PI * 2);
    ctx.arc(x - 8, y - 12, 17, 0, Math.PI * 2);
    ctx.arc(x + 8, y - 12, 17, 0, Math.PI * 2);
    ctx.fill();

    // Capa base
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.arc(x - 14, y + 6, 18, 0, Math.PI * 2);
    ctx.arc(x + 14, y + 6, 18, 0, Math.PI * 2);
    ctx.arc(x, y - 6, 22, 0, Math.PI * 2);
    ctx.fill();

    // Capa media
    ctx.fillStyle = midColor;
    ctx.beginPath();
    ctx.arc(x - 12, y + 2, 16, 0, Math.PI * 2);
    ctx.arc(x + 12, y + 2, 16, 0, Math.PI * 2);
    ctx.arc(x, y - 8, 20, 0, Math.PI * 2);
    ctx.arc(x - 9, y - 6, 13, 0, Math.PI * 2);
    ctx.arc(x + 9, y - 6, 13, 0, Math.PI * 2);
    ctx.fill();

    // Capa superior / highlight voluminoso
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.arc(x - 6, y - 10, 14, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 10, 14, 0, Math.PI * 2);
    ctx.arc(x, y - 14, 14, 0, Math.PI * 2);
    ctx.arc(x, y - 4, 10, 0, Math.PI * 2);
    ctx.fill();

    // Brillo superior pequeño
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath();
    ctx.ellipse(x - 4, y - 16, 7, 5, -0.35, 0, Math.PI * 2);
    ctx.fill();
    // mota de profundidad interna
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(x + 5, y + 2, 9, 7, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderPolyhedron(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x + 16, y - 6);
    ctx.lineTo(x + 10, y + 16);
    ctx.lineTo(x - 10, y + 16);
    ctx.lineTo(x - 16, y - 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  private renderOpenBookMonument(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 22, y - 8, 44, 28);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x - 20, y - 6, 18, 24);
    ctx.fillRect(x + 2, y - 6, 18, 24);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y - 6);
    ctx.lineTo(x, y + 18);
    ctx.stroke();
  }

  private renderMagicMushroom(ctx: CanvasRenderingContext2D, x: number, y: number, capColor: string) {
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(x - 4, y, 8, 18);
    ctx.fillStyle = capColor;
    ctx.beginPath();
    ctx.arc(x, y, 16, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - 6, y - 6, 3, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 6, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderAncientColumn(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x - 6, y - 14, 12, 28);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(x - 10, y - 18, 20, 5);
    ctx.fillRect(x - 10, y + 12, 20, 5);
  }

  private renderPainterEasel(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 2, y - 18, 4, 34);
    ctx.fillRect(x - 12, y + 6, 4, 14);
    ctx.fillRect(x + 8, y + 6, 4, 14);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x - 10, y - 14, 20, 18);
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(x - 6, y - 8, 12, 6);
  }

  private renderGramophoneMonument(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 10, y + 2, 20, 14);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(x, y + 2);
    ctx.lineTo(x + 16, y - 14);
    ctx.lineTo(x + 6, y - 18);
    ctx.fill();
  }

  private renderRedPhoneBooth(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x - 8, y - 16, 16, 32);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 5, y - 10, 10, 8);
    ctx.fillRect(x - 5, y + 2, 10, 8);
  }

  // --- HABITACIÓN INFANTIL: ELEMENTOS Y PROPS DETALLADOS ---

  // 1. Guirnalda de banderines festivos de colores
  private renderPennantBunting(ctx: CanvasRenderingContext2D, x1: number, x2: number, y: number, isGirl?: boolean) {
    const flagColors = isGirl
      ? ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#fb7185', '#38bdf8', '#fde047', '#fb923c']
      : ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7', '#f97316', '#06b6d4', '#ec4899'];
    const totalSpan = x2 - x1;
    const numFlags = Math.floor(totalSpan / 28);
    const flagWidth = totalSpan / numFlags;

    // String / Catenary wire
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.quadraticCurveTo(totalSpan / 2, y + 10, x2, y);
    ctx.stroke();

    // Triangle Pennants
    for (let i = 0; i < numFlags; i++) {
      const fx = x1 + i * flagWidth;
      const color = flagColors[i % flagColors.length];
      const sag = Math.sin((i / numFlags) * Math.PI) * 8;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(fx, y + sag);
      ctx.lineTo(fx + flagWidth - 4, y + sag);
      ctx.lineTo(fx + (flagWidth - 4) / 2, y + sag + 14);
      ctx.closePath();
      ctx.fill();

      // Top string fold
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(fx, y + sag, flagWidth - 4, 2);
    }
  }

  // 2. Ventana infantil con cortinas acogedoras, nubes animadas y rayos de sol
  private renderKidWindow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    isGirl?: boolean,
    cloudOffset: number = 0
  ) {
    // Window Frame (White polished wood)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x, y, w, h);

    // Sunny Sky Glass Background
    const skyGrad = ctx.createLinearGradient(x, y, x, y + h);
    skyGrad.addColorStop(0, isGirl ? '#f472b6' : '#38bdf8');
    skyGrad.addColorStop(0.7, isGirl ? '#bae6fd' : '#7dd3fc');
    skyGrad.addColorStop(1, isGirl ? '#fef08a' : '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(x + 4, y + 4, w - 8, h - 8);

    // Animated Fluffy Clouds drifting in sky
    const cloudX = x + 4 + ((this.animTick * 0.3 + cloudOffset) % (w + 30)) - 20;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.beginPath();
    ctx.arc(cloudX + 12, y + 20, 7, 0, Math.PI * 2);
    ctx.arc(cloudX + 20, y + 17, 9, 0, Math.PI * 2);
    ctx.arc(cloudX + 28, y + 20, 7, 0, Math.PI * 2);
    ctx.fill();

    // Wooden crossbars
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + w / 2 - 2, y + 4, 4, h - 8);
    ctx.fillRect(x + 4, y + h / 2 - 2, w - 8, 4);

    // Curtains on Left & Right tied with ribbons
    // Curtain Rod
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x - 6, y - 4, w + 12, 4);
    ctx.fillStyle = isGirl ? '#f472b6' : '#fde047';
    ctx.fillRect(x - 8, y - 5, 4, 6);
    ctx.fillRect(x + w + 4, y - 5, 4, 6);

    const curtainColor = isGirl ? '#fbcfe8' : '#fde047';
    const ribbonColor = isGirl ? '#db2777' : '#ea580c';

    // Left Curtain
    ctx.fillStyle = curtainColor;
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.lineTo(x + 14, y);
    ctx.lineTo(x + 8, y + h - 8);
    ctx.lineTo(x - 4, y + h - 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ribbonColor;
    ctx.fillRect(x + 2, y + h / 2 - 2, 8, 4); // Ribbon tie

    // Right Curtain
    ctx.fillStyle = curtainColor;
    ctx.beginPath();
    ctx.moveTo(x + w + 4, y);
    ctx.lineTo(x + w - 14, y);
    ctx.lineTo(x + w - 8, y + h - 8);
    ctx.lineTo(x + w + 4, y + h - 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ribbonColor;
    ctx.fillRect(x + w - 10, y + h / 2 - 2, 8, 4);

    // Window Sill with small flowerpot / potted plant
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x - 6, y + h, w + 12, 6);

    // Small potted plant with pink/yellow blossoms
    ctx.fillStyle = isGirl ? '#ec4899' : '#ea580c'; // flowerpot
    ctx.fillRect(x + w / 2 - 6, y + h - 6, 12, 8);
    ctx.fillStyle = '#22c55e'; // green leaves
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h - 10, 6, 0, Math.PI * 2);
    ctx.arc(x + w / 2 - 4, y + h - 8, 4, 0, Math.PI * 2);
    ctx.arc(x + w / 2 + 4, y + h - 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isGirl ? '#fb7185' : '#fde047'; // flower blossoms
    ctx.fillRect(x + w / 2 - 2, y + h - 12, 4, 4);

    // Warm diagonal sunbeam projecting onto the floor
    const beamGrad = ctx.createLinearGradient(x + w / 2, y + h, x + w / 2 + 50, y + h + 150);
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
    beamGrad.addColorStop(0.6, 'rgba(254, 240, 138, 0.12)');
    beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + h);
    ctx.lineTo(x + w - 4, y + h);
    ctx.lineTo(x + w + 70, y + h + 150);
    ctx.lineTo(x - 20, y + h + 150);
    ctx.closePath();
    ctx.fill();
  }

  // 3b. Cuadro HABITOS configurable (marco madera, fondo crema, título dorado)
  private renderHabitBoard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, isGirl?: boolean) {
    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.fillRect(x + 2, y + 2, w, h);
    // Marco madera
    ctx.fillStyle = isGirl ? '#581c87' : '#5c2b09';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = isGirl ? '#7c3aed' : '#78350f';
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    // Fondo crema interior
    ctx.fillStyle = isGirl ? '#fff1f2' : '#fdfbf7';
    ctx.fillRect(x + 5, y + 5, w - 10, h - 10);
    // Borde interior dorado sutil
    ctx.strokeStyle = 'rgba(245,158,11,0.55)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 6.5, y + 6.5, w - 13, h - 13);
    // Pushpins dorados en esquinas
    ctx.fillStyle = '#fde047';
    ctx.fillRect(x + 2, y + 2, 3, 3);
    ctx.fillRect(x + w - 5, y + 2, 3, 3);
    ctx.fillRect(x + 2, y + h - 5, 3, 3);
    ctx.fillRect(x + w - 5, y + h - 5, 3, 3);
    // Título HABITOS centrado dorado
    ctx.fillStyle = isGirl ? '#be185d' : '#92400e';
    ctx.font = `bold ${Math.max(9, Math.min(13, Math.floor(w / 11)))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('HABITOS', x + w / 2, y + 15);
    // Línea decorativa bajo título
    ctx.fillStyle = 'rgba(245,158,11,0.35)';
    ctx.fillRect(x + 10, y + 18, w - 20, 1);
    // Placeholder de checks / líneas si el board es alto
    if (h > 52) {
      ctx.fillStyle = isGirl ? '#fbcfe8' : '#fde68a';
      for (let i = 0; i < 3; i++) {
        const ly = y + 26 + i * 12;
        if (ly + 6 > y + h - 6) break;
        ctx.fillRect(x + 10, ly, 8, 8);
        ctx.fillStyle = isGirl ? '#fce7f3' : '#fffbeb';
        ctx.fillRect(x + 21, ly + 3, w - 34, 2);
        ctx.fillStyle = isGirl ? '#fbcfe8' : '#fde68a';
      }
    }
    ctx.textAlign = 'start';
  }

  // 3. Decoraciones de pared infantil (Pósters espaciales/unicornios, dinosaurios/gatitos, corcho)
  private renderKidWallDecorations(ctx: CanvasRenderingContext2D, isGirl?: boolean) {
    // --- PÓSTER IZQUIERDO (Espacio para niño / Castillo Unicornio para niña) ---
    const px = 60;
    const py = 22;
    const pw = 58;
    const ph = 76;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(px + 2, py + 2, pw, ph);

    if (isGirl) {
      // Fairy Magic Unicorn & Castle Poster
      ctx.fillStyle = '#4a044e'; // Deep enchanted purple
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 2, py + 2, pw - 4, ph - 4);

      // Gold pushpins
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px + 3, py + 3, 3, 3);
      ctx.fillRect(px + pw - 6, py + 3, 3, 3);
      ctx.fillRect(px + 3, py + ph - 6, 3, 3);
      ctx.fillRect(px + pw - 6, py + ph - 6, 3, 3);

      // Sparkles & Moon
      ctx.fillStyle = '#fef08a';
      ctx.beginPath(); ctx.arc(px + 44, py + 22, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 12, py + 16, 2, 2);
      ctx.fillRect(px + 46, py + 48, 2, 2);

      // Cute Pink/White Unicorn 🦄
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(px + 26, py + 36, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(px + 20, py + 36, 12, 14); // body
      ctx.fillStyle = '#ec4899'; // mane
      ctx.beginPath(); ctx.arc(px + 20, py + 32, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fde047'; // golden horn
      ctx.beginPath();
      ctx.moveTo(px + 27, py + 28);
      ctx.lineTo(px + 33, py + 20);
      ctx.lineTo(px + 30, py + 28);
      ctx.fill();

      // Poster Title
      ctx.fillStyle = '#f472b6';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MAGIA', px + pw / 2, py + ph - 8);
    } else {
      // Cosmic Space Poster
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 2, py + 2, pw - 4, ph - 4);

      ctx.fillStyle = '#fde047';
      ctx.fillRect(px + 3, py + 3, 3, 3);
      ctx.fillRect(px + pw - 6, py + 3, 3, 3);
      ctx.fillRect(px + 3, py + ph - 6, 3, 3);
      ctx.fillRect(px + pw - 6, py + ph - 6, 3, 3);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 10, py + 12, 2, 2);
      ctx.fillRect(px + 45, py + 14, 2, 2);
      ctx.fillRect(px + 14, py + 48, 2, 2);
      ctx.fillRect(px + 42, py + 52, 2, 2);

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(px + 44, py + 26, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(px + 44, py + 26, 11, 4, -0.3, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(px + 24, py + 20);
      ctx.lineTo(px + 32, py + 38);
      ctx.lineTo(px + 18, py + 38);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(px + 24, py + 20);
      ctx.lineTo(px + 27, py + 26);
      ctx.lineTo(px + 21, py + 26);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(px + 16, py + 34, 4, 6);
      ctx.fillRect(px + 30, py + 34, 4, 6);

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath(); ctx.arc(px + 24, py + 30, 2.5, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#f97316';
      ctx.fillRect(px + 22, py + 38, 6, 8);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px + 23, py + 42, 4, 6);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ESPACIO', px + pw / 2, py + ph - 8);
    }

    // --- PÓSTER DERECHO (Dinosaurio para niño / Gatito y Flores para niña) ---
    const dx = 635;
    const dy = 22;
    const dw = 58;
    const dh = 76;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(dx + 2, dy + 2, dw, dh);

    if (isGirl) {
      ctx.fillStyle = '#831843'; // Soft ruby
      ctx.fillRect(dx, dy, dw, dh);
      ctx.strokeStyle = '#fbcfe8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(dx + 2, dy + 2, dw - 4, dh - 4);

      ctx.fillStyle = '#fde047';
      ctx.fillRect(dx + 3, dy + 3, 3, 3);
      ctx.fillRect(dx + dw - 6, dy + 3, 3, 3);
      ctx.fillRect(dx + 3, dy + dh - 6, 3, 3);
      ctx.fillRect(dx + dw - 6, dy + dh - 6, 3, 3);

      // Cute Kitty 🐱 with flower crown
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(dx + 29, dy + 34, 11, 0, Math.PI * 2); ctx.fill();
      // Cat ears
      ctx.beginPath();
      ctx.moveTo(dx + 20, dy + 26); ctx.lineTo(dx + 23, dy + 18); ctx.lineTo(dx + 27, dy + 24);
      ctx.moveTo(dx + 31, dy + 24); ctx.lineTo(dx + 35, dy + 18); ctx.lineTo(dx + 38, dy + 26);
      ctx.fill();
      // Cat eyes & nose
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(dx + 24, dy + 32, 2.5, 2.5);
      ctx.fillRect(dx + 31, dy + 32, 2.5, 2.5);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(dx + 28, dy + 36, 2, 2);

      ctx.fillStyle = '#fbcfe8';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AMIGOS', dx + dw / 2, dy + dh - 8);
    } else {
      ctx.fillStyle = '#14532d'; // Jungle green
      ctx.fillRect(dx, dy, dw, dh);
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(dx + 2, dy + 2, dw - 4, dh - 4);

      ctx.fillStyle = '#fde047';
      ctx.fillRect(dx + 3, dy + 3, 3, 3);
      ctx.fillRect(dx + dw - 6, dy + 3, 3, 3);
      ctx.fillRect(dx + 3, dy + dh - 6, 3, 3);
      ctx.fillRect(dx + dw - 6, dy + dh - 6, 3, 3);

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(dx + 30, dy + 30, 10, 0, Math.PI * 2);
      ctx.fillRect(dx + 30, dy + 24, 14, 10);
      ctx.fill();
      ctx.fillRect(dx + 22, dy + 34, 16, 16);
      ctx.fillRect(dx + 12, dy + 40, 12, 6);
      ctx.fillRect(dx + 20, dy + 48, 6, 10);
      ctx.fillRect(dx + 30, dy + 48, 6, 10);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(dx + 34, dy + 26, 3, 3);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(dx + 35, dy + 27, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(dx + 36, dy + 32, 2, 2);
      ctx.fillRect(dx + 40, dy + 32, 2, 2);

      ctx.fillStyle = '#86efac';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DINO', dx + dw / 2, dy + dh - 8);
    }

    // --- TABLERO DE CORCHO CON DIBUJOS INFANTILES ---
    const cx = 35;
    const cy = 110;
    const cw = 70;
    const ch = 48;

    ctx.fillStyle = isGirl ? '#581c87' : '#78350f';
    ctx.fillRect(cx, cy, cw, ch);
    ctx.fillStyle = isGirl ? '#fbcfe8' : '#d97706';
    ctx.fillRect(cx + 3, cy + 3, cw - 6, ch - 6);

    // Drawing 1: Sun & Heart / House
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx + 6, cy + 6, 26, 20);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx + 18, cy + 5, 3, 3);
    ctx.fillStyle = '#fde047';
    ctx.beginPath(); ctx.arc(cx + 12, cy + 12, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = isGirl ? '#ec4899' : '#3b82f6';
    ctx.fillRect(cx + 18, cy + 16, 10, 8);

    // Drawing 2: Gold Star Certificate
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(cx + 36, cy + 8, 26, 18);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(cx + 48, cy + 7, 3, 3);
    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('⭐ 100', cx + 49, cy + 20);

    // Drawing 3: Portrait
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx + 16, cy + 28, 36, 16);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(cx + 33, cy + 27, 3, 3);
    ctx.fillStyle = isGirl ? '#ec4899' : '#ea580c';
    ctx.font = 'bold 7px sans-serif';
    ctx.fillText('❤️ Familia', cx + 34, cy + 39);
    ctx.textAlign = 'start';
  }

  // 4. Escritorio creativo e interactivo
  private renderKidDesk(ctx: CanvasRenderingContext2D, x: number, y: number, isGirl?: boolean) {
    const w = 98;
    const h = 70;

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(x + 2, y + h - 4, w + 6, 10);

    // Wooden Desk Legs & Frame
    ctx.fillStyle = isGirl ? '#581c87' : '#78350f';
    ctx.fillRect(x + 4, y + 18, 8, h - 18);
    ctx.fillRect(x + w - 12, y + 18, 8, h - 18);
    ctx.fillStyle = isGirl ? '#86198f' : '#92400e';
    ctx.fillRect(x + 12, y + 24, w - 24, 6);

    // Desk Drawers Unit on Left
    ctx.fillStyle = isGirl ? '#a21caf' : '#b45309';
    ctx.fillRect(x + 4, y + 26, 26, h - 26);
    ctx.fillStyle = isGirl ? '#701a75' : '#78350f';
    ctx.fillRect(x + 6, y + 28, 22, 16);
    ctx.fillRect(x + 6, y + 46, 22, 16);
    // Brass Knobs
    ctx.fillStyle = '#fde047';
    ctx.fillRect(x + 15, y + 35, 4, 3);
    ctx.fillRect(x + 15, y + 53, 4, 3);

    // Desk Top Board
    ctx.fillStyle = isGirl ? '#c084fc' : '#d97706';
    ctx.fillRect(x, y + 12, w, 8);
    ctx.fillStyle = isGirl ? '#e9d5ff' : '#f59e0b';
    ctx.fillRect(x, y + 12, w, 2);

    // Desktop Monitor
    const mx = x + 36;
    const my = y - 16;
    ctx.fillStyle = '#334155';
    ctx.fillRect(mx + 12, my + 24, 8, 6);
    ctx.fillRect(mx + 8, my + 28, 16, 2);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(mx, my, 32, 24, 3);
    ctx.fill();
    ctx.fillStyle = isGirl ? '#db2777' : '#0284c7';
    ctx.fillRect(mx + 2, my + 2, 28, 18);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(mx + 12, my + 8, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(mx + 18, my + 10, 8, 3);

    // Keyboard & Mousepad
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(mx - 2, y + 13, 22, 4);
    ctx.fillStyle = isGirl ? '#f472b6' : '#38bdf8';
    ctx.fillRect(mx + 22, y + 13, 8, 5);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(mx + 24, y + 14, 4, 3);

    // Desk Lamp
    const lx = x + w - 24;
    const ly = y - 4;
    ctx.fillStyle = isGirl ? '#ec4899' : '#eab308';
    ctx.fillRect(lx + 4, y + 12, 10, 2);
    ctx.strokeStyle = isGirl ? '#be185d' : '#ca8a04';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx + 9, y + 12);
    ctx.lineTo(lx + 4, ly + 6);
    ctx.lineTo(lx + 12, ly);
    ctx.stroke();
    ctx.fillStyle = isGirl ? '#f472b6' : '#fde047';
    ctx.beginPath();
    ctx.arc(lx + 10, ly, 6, Math.PI * 0.7, Math.PI * 1.8);
    ctx.fill();

    // Warm Light Cone
    const lampGrad = ctx.createRadialGradient(lx + 10, ly + 2, 2, lx + 10, ly + 14, 24);
    lampGrad.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
    lampGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = lampGrad;
    ctx.beginPath();
    ctx.arc(lx + 10, ly + 14, 22, 0, Math.PI);
    ctx.fill();

    // Colored Pencils Cup
    const pxCup = x + 16;
    const pyCup = y + 4;
    ctx.fillStyle = isGirl ? '#ec4899' : '#06b6d4';
    ctx.fillRect(pxCup, pyCup + 4, 10, 10);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(pxCup + 2, pyCup, 2, 6);
    ctx.fillStyle = '#22c55e'; ctx.fillRect(pxCup + 5, pyCup - 2, 2, 8);
    ctx.fillStyle = '#eab308'; ctx.fillRect(pxCup + 8, pyCup + 1, 2, 5);

    // Open Sketchbook
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 68, y + 13, 14, 6);
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(x + 70, y + 14, 4, 2);

    // Swivel Chair
    const cxChair = x + 44;
    const cyChair = y + 26;
    ctx.fillStyle = isGirl ? '#be185d' : '#1d4ed8';
    ctx.beginPath();
    ctx.roundRect(cxChair, cyChair + 4, 22, 18, 4);
    ctx.fill();
    ctx.fillStyle = isGirl ? '#f472b6' : '#3b82f6';
    ctx.fillRect(cxChair + 2, cyChair + 6, 18, 14);

    ctx.fillStyle = isGirl ? '#9d174d' : '#1e40af';
    ctx.beginPath();
    ctx.roundRect(cxChair - 2, cyChair + 22, 26, 8, 3);
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.fillRect(cxChair + 9, cyChair + 30, 4, 10);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cxChair + 2, cyChair + 38, 18, 4);
  }

  // 5. Estantería infantil con libros coloridos y juguetes
  private renderKidBookshelf(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    isGirl?: boolean
  ) {
    ctx.fillStyle = isGirl ? '#581c87' : '#78350f';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = isGirl ? '#7e22ce' : '#92400e';
    ctx.fillRect(x + 4, y + 4, w - 8, h - 8);

    ctx.fillStyle = isGirl ? '#3b0764' : '#5c2d0b';
    ctx.fillRect(x + 4, y + 36, w - 8, 4);
    ctx.fillRect(x + 4, y + 72, w - 8, 4);

    // Top shelf globe / fairy doll
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 14, y + 28, 8, 8);
    ctx.fillStyle = isGirl ? '#ec4899' : '#0284c7';
    ctx.beginPath(); ctx.arc(x + 18, y + 20, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fde047'; ctx.fillRect(x + 15, y + 18, 6, 4);

    // Cute Plushie on shelf
    ctx.fillStyle = isGirl ? '#fbcfe8' : '#94a3b8';
    ctx.fillRect(x + 40, y + 14, 12, 14);
    ctx.fillRect(x + 42, y + 6, 8, 8);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(x + 43, y + 8, 2, 2);
    ctx.fillRect(x + 47, y + 8, 2, 2);

    // Trophy Cup 🏆
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(x + 70, y + 10);
    ctx.lineTo(x + 82, y + 10);
    ctx.lineTo(x + 78, y + 24);
    ctx.lineTo(x + 74, y + 24);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(x + 74, y + 24, 4, 8);
    ctx.fillRect(x + 71, y + 32, 10, 4);

    // Books
    const bookColors = isGirl
      ? ['#f43f5e', '#ec4899', '#a855f7', '#fb7185', '#38bdf8', '#fde047', '#34d399', '#fb923c']
      : ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
    let bx = x + 8;
    for (let i = 0; i < 11; i++) {
      const col = bookColors[i % bookColors.length];
      const bw = 8;
      const bh = 24 + ((i * 5) % 6);
      ctx.fillStyle = col;
      ctx.fillRect(bx, y + 72 - bh, bw, bh);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(bx + 1, y + 72 - bh + 4, bw - 2, 2);
      ctx.fillRect(bx + 1, y + 72 - 6, bw - 2, 2);
      bx += bw + 2;
    }

    // Bottom shelf boxes
    ctx.fillStyle = isGirl ? '#db2777' : '#dc2626';
    ctx.fillRect(x + 8, y + 84, 34, 22);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(x + 12, y + 88, 26, 14);

    ctx.fillStyle = isGirl ? '#9333ea' : '#2563eb';
    ctx.fillRect(x + 46, y + 80, 36, 26);
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(x + 50, y + 84, 28, 18);

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(x + 86, y + 88, 34, 18);
  }

  // 6. Cama de niño con acolchado y osito / conejito de peluche
  private renderKidBed(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, isGirl?: boolean) {
    // Bed Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(x + 2, y + h - 6, w + 8, 12);

    // Bedposts & Headboard
    ctx.fillStyle = isGirl ? '#581c87' : '#78350f';
    ctx.fillRect(x, y - 10, w, 24);
    ctx.fillStyle = isGirl ? '#7e22ce' : '#b45309';
    ctx.fillRect(x + 4, y - 8, w - 8, 20);

    ctx.fillStyle = isGirl ? '#6b21a8' : '#92400e';
    ctx.fillRect(x - 4, y - 14, 8, h + 14);
    ctx.fillRect(x + w - 4, y - 14, 8, h + 14);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x, y - 14, 5, 0, Math.PI * 2);
    ctx.arc(x + w, y - 14, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isGirl ? '#581c87' : '#78350f';
    ctx.fillRect(x, y + 14, w, h - 14);

    // Duvet / Comforter
    const duvetX = x + 4;
    const duvetY = y + 26;
    const duvetW = w - 8;
    const duvetH = h - 30;

    const duvetGrad = ctx.createLinearGradient(duvetX, duvetY, duvetX, duvetY + duvetH);
    if (isGirl) {
      duvetGrad.addColorStop(0, '#be185d');
      duvetGrad.addColorStop(0.5, '#ec4899');
      duvetGrad.addColorStop(1, '#db2777');
    } else {
      duvetGrad.addColorStop(0, '#1e3a8a');
      duvetGrad.addColorStop(0.5, '#2563eb');
      duvetGrad.addColorStop(1, '#1d4ed8');
    }
    ctx.fillStyle = duvetGrad;
    ctx.fillRect(duvetX, duvetY, duvetW, duvetH);

    // Golden Stars & Hearts on Duvet ⭐
    ctx.fillStyle = '#fde047';
    for (let sy = duvetY + 12; sy < duvetY + duvetH - 8; sy += 20) {
      for (let sx = duvetX + 12; sx < duvetX + duvetW - 8; sx += 22) {
        const offset = ((sy / 20) % 2 === 0 ? 0 : 11);
        ctx.fillRect(sx + offset, sy, 3, 3);
        ctx.fillRect(sx + offset - 1, sy + 1, 5, 1);
        ctx.fillRect(sx + offset + 1, sy - 1, 1, 5);
      }
    }

    ctx.fillStyle = isGirl ? '#fbcfe8' : '#38bdf8';
    ctx.fillRect(duvetX, duvetY, duvetW, 6);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(duvetX, duvetY + 5, duvetW, 2);

    // Fluffy White Pillow
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(x + 10, y + 4, w - 20, 22, 6);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cute Plush Teddy Bear / Bunny Tucked in Bed
    const bx = x + w / 2;
    const by = y + 14;

    if (isGirl) {
      // Cute Plush Bunny 🐰 with long ears
      ctx.fillStyle = '#ffffff';
      // Long Bunny Ears
      ctx.fillRect(bx - 8, by - 12, 4, 10);
      ctx.fillRect(bx + 4, by - 12, 4, 10);
      ctx.fillStyle = '#fbcfe8'; // inner ears
      ctx.fillRect(bx - 7, by - 10, 2, 7);
      ctx.fillRect(bx + 5, by - 10, 2, 7);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(bx, by, 8.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(bx - 4, by - 2, 2, 2);
      ctx.fillRect(bx + 2, by - 2, 2, 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(bx - 1, by + 1, 2, 2); // pink nose
      // Cute Pink Ribbon Bow
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(bx - 4, by + 6, 8, 3);
    } else {
      // Classic Teddy Bear 🧸
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(bx - 7, by - 6, 4, 0, Math.PI * 2);
      ctx.arc(bx + 7, by - 6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(bx - 7, by - 6, 2, 0, Math.PI * 2);
      ctx.arc(bx + 7, by - 6, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#92400e';
      ctx.beginPath(); ctx.arc(bx, by, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fde68a';
      ctx.beginPath(); ctx.arc(bx, by + 2, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(bx - 1.5, by + 0.5, 3, 2);
      ctx.fillRect(bx - 4, by - 2, 2, 2);
      ctx.fillRect(bx + 2, by - 2, 2, 2);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(bx - 4, by + 7, 8, 3);
    }

    // Footboard
    ctx.fillStyle = isGirl ? '#581c87' : '#78350f';
    ctx.fillRect(x, y + h - 6, w, 10);
    ctx.fillStyle = isGirl ? '#7e22ce' : '#b45309';
    ctx.fillRect(x + 4, y + h - 4, w - 8, 6);
  }

  // 7. Mesita de noche con velador hongo mágico y despertador
  private renderBedsideNightstand(ctx: CanvasRenderingContext2D, x: number, y: number, isGirl?: boolean) {
    const w = 32;
    const h = 42;

    ctx.fillStyle = isGirl ? '#581c87' : '#78350f';
    ctx.fillRect(x, y + 14, w, h - 14);
    ctx.fillStyle = isGirl ? '#7e22ce' : '#92400e';
    ctx.fillRect(x + 2, y + 16, w - 4, 10);
    ctx.fillRect(x + 2, y + 28, w - 4, 10);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(x + w / 2 - 1.5, y + 20, 3, 2);
    ctx.fillRect(x + w / 2 - 1.5, y + 32, 3, 2);

    ctx.fillStyle = isGirl ? '#a855f7' : '#b45309';
    ctx.fillRect(x - 2, y + 12, w + 4, 4);

    // Glowing Mushroom / Fairy Lamp
    const mx = x + 10;
    const my = y + 2;
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(mx + 2, my + 5, 4, 6);
    ctx.fillStyle = isGirl ? '#ec4899' : '#ef4444';
    ctx.beginPath();
    ctx.arc(mx + 4, my + 4, 7, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(mx + 1, my + 1, 2, 2);
    ctx.fillRect(mx + 5, my + 2, 2, 2);

    const glowGrad = ctx.createRadialGradient(mx + 4, my + 4, 2, mx + 4, my + 4, 18);
    glowGrad.addColorStop(0, isGirl ? 'rgba(244, 114, 182, 0.4)' : 'rgba(239, 68, 68, 0.4)');
    glowGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(mx + 4, my + 4, 18, 0, Math.PI * 2);
    ctx.fill();

    // Alarm Clock
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 19, y + 6, 11, 7);
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 6px monospace';
    ctx.fillText('8:00', x + 20, y + 12);
  }

  // 8. Baúl de juguetes abierto con juguetes
  private renderToyChest(ctx: CanvasRenderingContext2D, x: number, y: number, isGirl?: boolean) {
    const w = 84;
    const h = 54;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(x + 2, y + h - 4, w + 8, 10);

    ctx.fillStyle = isGirl ? '#581c87' : '#78350f';
    ctx.fillRect(x, y + 16, w, h - 16);
    ctx.fillStyle = isGirl ? '#7e22ce' : '#92400e';
    ctx.fillRect(x + 4, y + 20, w - 8, h - 24);

    ctx.fillStyle = '#fde047';
    ctx.fillRect(x, y + 16, 6, 6);
    ctx.fillRect(x + w - 6, y + 16, 6, 6);
    ctx.fillRect(x, y + h - 6, 6, 6);
    ctx.fillRect(x + w - 6, y + h - 6, 6, 6);
    ctx.fillRect(x + w / 2 - 4, y + 20, 8, 8);

    ctx.fillStyle = isGirl ? '#3b0764' : '#5c2d0b';
    ctx.beginPath();
    ctx.moveTo(x - 2, y + 16);
    ctx.lineTo(x + w + 2, y + 16);
    ctx.lineTo(x + w + 6, y + 2);
    ctx.lineTo(x + 2, y + 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Toys
    const rx = x + 10;
    const ry = y + 8;
    ctx.fillStyle = isGirl ? '#ec4899' : '#ef4444';
    ctx.beginPath();
    ctx.roundRect(rx, ry + 4, 22, 8, 3);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.fillRect(rx + 6, ry + 2, 8, 4);

    // Rubber Ducky 🦆
    const dx = x + 36;
    const dy = y + 6;
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(dx + 6, dy + 8, 6, 0, Math.PI * 2);
    ctx.arc(dx + 9, dy + 3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.fillRect(dx + 12, dy + 2, 4, 2);

    // Robot or Doll
    const botX = x + 56;
    const botY = y + 6;
    ctx.fillStyle = isGirl ? '#f472b6' : '#06b6d4';
    ctx.fillRect(botX, botY + 4, 12, 10);
    ctx.fillRect(botX + 2, botY - 2, 8, 6);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(botX + 4, botY, 2, 2);
    ctx.fillRect(botX + 8, botY, 2, 2);

    // Colorful Building Blocks
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x - 14, y + 36, 10, 8);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x - 6, y + 42, 8, 8);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x + 16, y + h + 2, 8, 8);
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(x + 32, y + h + 4, 10, 6);
  }

  // 9. Gran alfombra infantil en el centro
  private renderKidPlayRug(ctx: CanvasRenderingContext2D, cx: number, cy: number, isGirl?: boolean) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 195, 96, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isGirl) {
      // Pastel Pink & Lilac Blossom Mandala Rug
      ctx.fillStyle = '#be185d';
      ctx.beginPath(); ctx.ellipse(cx, cy, 190, 92, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#f472b6';
      ctx.beginPath(); ctx.ellipse(cx, cy, 172, 82, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#fce7f3';
      ctx.beginPath(); ctx.ellipse(cx, cy, 155, 72, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#831843';
      ctx.beginPath(); ctx.ellipse(cx, cy, 125, 56, 0, 0, Math.PI * 2); ctx.fill();

      // Radiant Flower Star in center
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      const petals = 8;
      for (let i = 0; i < petals; i++) {
        const theta = (i / petals) * Math.PI * 2;
        const px = cx + Math.cos(theta) * 32;
        const py = cy + Math.sin(theta) * 16;
        ctx.arc(px, py, 14, 0, Math.PI * 2);
      }
      ctx.fill();

      ctx.fillStyle = '#f43f5e';
      ctx.beginPath(); ctx.ellipse(cx, cy, 14, 7, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      // Cosmic Space Rug
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath(); ctx.ellipse(cx, cy, 190, 92, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.ellipse(cx, cy, 172, 82, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#0284c7';
      ctx.beginPath(); ctx.ellipse(cx, cy, 155, 72, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.ellipse(cx, cy, 125, 56, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      const spikes = 8;
      const outerRadius = 38;
      const innerRadius = 18;
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const sx = cx + Math.cos(angle) * radius * 1.6;
        const sy = cy + Math.sin(angle) * radius * 0.7;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#f97316';
      ctx.beginPath(); ctx.ellipse(cx, cy, 14, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(cx, cy, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  // 10. Partículas de luz dorada flotando en los rayos de sol
  private addSunbeamParticle(x: number, y: number) {
    if (this.particles.length > 80) return;
    this.particles.push({
      x: x + (Math.random() * 20 - 10),
      y: y + (Math.random() * 20 - 10),
      vx: (Math.random() - 0.5) * 0.3,
      vy: 0.15 + Math.random() * 0.25,
      size: 1.5 + Math.random() * 2,
      color: '#fef08a',
      alpha: 0.6 + Math.random() * 0.4,
      life: 0,
      maxLife: 90 + Math.floor(Math.random() * 60),
      type: 'sparkle',
    });
  }

  private renderExitDoor(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x, y, 6, h);
    ctx.fillRect(x + w - 6, y, 6, h);
    ctx.fillRect(x, y, w, 8);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚪 SALIR AL DÍA', x + w / 2, y + 36);
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('[A / Flecha Abajo]', x + w / 2, y + 54);
    ctx.textAlign = 'start';
  }

  private renderParent(ctx: CanvasRenderingContext2D, x: number, y: number, type: 'father' | 'mother') {
    const pw = 30;
    const ph = 42;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x + pw / 2, y + ph + 2, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 4, y + ph - 6, 8, 6);
    ctx.fillRect(x + pw - 12, y + ph - 6, 8, 6);

    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 4, y + ph - 16, pw - 8, 11);

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 14, pw - 4, 16, 4);
    ctx.fill();

    ctx.fillStyle = '#ffd1a4';
    ctx.beginPath();
    ctx.arc(x + pw / 2, y + 9, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#29180c';
    ctx.beginPath();
    ctx.arc(x + pw / 2, y + 6, 11, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 8, y + 9, 3, 3);
    ctx.fillRect(x + 19, y + 9, 3, 3);

    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x + pw / 2, y + 12, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  private renderComicBubble(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    line1: string,
    line2: string
  ) {
    const bw = 330;
    const bh = 64;
    const bx = Math.max(10, Math.min(x - 90, 800 - bw - 10));
    const by = Math.max(10, y - 76);

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(bx + 3, by + 4, bw, bh, 14);
    ctx.fill();

    // Box body (High-contrast ivory background with gold border)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 14);
    ctx.fill();
    ctx.stroke();

    // Inner subtle border
    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bx + 3, by + 3, bw - 6, bh - 6, 11);
    ctx.stroke();

    // Comic pointer triangle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x + 5, by + bh);
    ctx.lineTo(x + 18, by + bh + 14);
    ctx.lineTo(x + 30, by + bh);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 5, by + bh);
    ctx.lineTo(x + 18, by + bh + 14);
    ctx.lineTo(x + 30, by + bh);
    ctx.stroke();

    // Line 1 (Large bold header)
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText(line1, bx + 16, by + 25);

    // Line 2 (Clear colored subtext)
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#0284c7';
    ctx.fillText(line2, bx + 16, by + 48);
  }

  // Street Lantern with warm glowing radial illumination on cobblestones
  private renderLantern(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Warm radial light pool on the ground
    const lightGlow = ctx.createRadialGradient(x, y + 20, 2, x, y + 20, 32);
    lightGlow.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
    lightGlow.addColorStop(0.6, 'rgba(254, 240, 138, 0.12)');
    lightGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = lightGlow;
    ctx.beginPath();
    ctx.ellipse(x, y + 20, 34, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cast iron lamp post
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 2, y, 4, 24);
    ctx.fillRect(x - 5, y + 22, 10, 3); // post base

    // Ornate top bracket
    ctx.fillStyle = '#334155';
    ctx.fillRect(x - 6, y - 6, 12, 3);
    ctx.fillRect(x - 4, y - 10, 8, 4);

    // Glowing warm glass lantern bulb
    const bulbPulse = Math.sin(this.animTick * 0.1) * 1.5;
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(x, y - 3, 5.5 + bulbPulse * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - 1, y - 4, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderHouseFacade(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    title: string,
    color: string
  ) {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 20);
    ctx.lineTo(x + w / 2, y - 10);
    ctx.lineTo(x + w + 8, y + 20);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(x + w / 2 - 14, y + h - 30, 28, 30, [10, 10, 0, 0]);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, x + w / 2, y + 26);
    ctx.textAlign = 'start';
  }

  private renderWoodenGate(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(x, y, 150, 32, 8);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(text, x + 12, y + 21);
  }

  private renderFlowerPatch(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const colors = ['#f472b6', '#fda4af', '#fde047', '#38bdf8'];
    for (let i = 0; i < 6; i++) {
      const fx = x + (i % 3) * 8;
      const fy = y + Math.floor(i / 3) * 8;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderStoneBench(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x, y + 8, 6, 8);
    ctx.fillRect(x + 34, y + 8, 6, 8);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x - 2, y, 44, 8);
  }

  private renderMateriaHeaderPill(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    color: string
  ) {
    const w = 480;
    const h = 34;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h / 2, w, h, 17);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y + 5);
    ctx.textAlign = 'start';
  }
}

export const pixelArtRenderer = new PixelArtRenderer();
