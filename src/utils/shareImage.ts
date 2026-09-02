export interface ShareCardData {
  appName: string;
  puzzleQuestion: string;
  timeSeconds: number;
  userName: string;
  userRankTitle: string;
  streakCount?: number;
  modeName: string;
}

export function generateShareCardCanvas(data: ShareCardData): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Modern high-contrast dark theme background with subtle gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
  bgGrad.addColorStop(0, '#0F172A'); // deep slate
  bgGrad.addColorStop(1, '#1E1B4B'); // rich indigo night
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 630);

  // Subtle decorative glowing accents
  const glow1 = ctx.createRadialGradient(1050, 100, 20, 1050, 100, 350);
  glow1.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
  glow1.addColorStop(1, 'rgba(99, 102, 241, 0)');
  ctx.fillStyle = glow1;
  ctx.beginPath();
  ctx.arc(1050, 100, 350, 0, Math.PI * 2);
  ctx.fill();

  const glow2 = ctx.createRadialGradient(150, 520, 20, 150, 520, 300);
  glow2.addColorStop(0, 'rgba(234, 88, 12, 0.2)');
  glow2.addColorStop(1, 'rgba(234, 88, 12, 0)');
  ctx.fillStyle = glow2;
  ctx.beginPath();
  ctx.arc(150, 520, 300, 0, Math.PI * 2);
  ctx.fill();

  // Outer Border Box
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 3;
  ctx.roundRect(40, 40, 1120, 550, 24);
  ctx.stroke();

  // Header Brand Badge
  ctx.fillStyle = '#6366F1';
  ctx.roundRect(80, 80, 180, 46, 12);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px Outfit, sans-serif';
  ctx.fillText('⚡ MathRush', 105, 112);

  // Mode badge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.roundRect(280, 80, 210, 46, 12);
  ctx.fill();
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(data.modeName.toUpperCase(), 300, 111);

  // Big Viral Headline: "🧠 MATH PUZZLE CHALLENGE"
  ctx.fillStyle = '#F8FAFC';
  ctx.font = '800 44px Outfit, sans-serif';
  ctx.fillText('I solved this in ' + data.timeSeconds.toFixed(1) + 's! ⚡', 80, 210);

  ctx.fillStyle = '#F59E0B';
  ctx.font = '700 28px Outfit, sans-serif';
  ctx.fillText('Can you beat my time?', 80, 260);

  // Puzzle Card Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
  ctx.lineWidth = 2;
  ctx.roundRect(80, 290, 1040, 180, 20);
  ctx.fill();
  ctx.stroke();

  // Question label & text
  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('PUZZLE EQUATION', 120, 335);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 42px "JetBrains Mono", monospace';
  const cleanQ = data.puzzleQuestion.length > 36 ? data.puzzleQuestion.substring(0, 36) + '...' : data.puzzleQuestion;
  ctx.fillText(cleanQ, 120, 405);

  // User details & CTA Footer
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Player: ${data.userName} (${data.userRankTitle})`, 80, 525);

  // Play Now Button Badge
  ctx.fillStyle = '#22C55E';
  ctx.roundRect(840, 495, 280, 52, 14);
  ctx.fill();

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px Outfit, sans-serif';
  ctx.fillText('🔗 Play on MathRush', 870, 530);

  return canvas;
}

export function downloadShareCard(data: ShareCardData): void {
  const canvas = generateShareCardCanvas(data);
  const link = document.createElement('a');
  link.download = `MathRush_Challenge_${data.timeSeconds.toFixed(1)}s.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function shareScoreToSocial(data: ShareCardData, channel: 'whatsapp' | 'twitter' | 'telegram' | 'native'): Promise<void> {
  const text = `🧠 MATH PUZZLE CHALLENGE!\n\nI solved "${data.puzzleQuestion}" in ${data.timeSeconds.toFixed(1)} seconds! ⚡\nCan you beat me? Play now on MathRush!\n`;
  const url = window.location.href;

  if (channel === 'whatsapp') {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + '\n' + url)}`, '_blank');
  } else if (channel === 'twitter') {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  } else if (channel === 'telegram') {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  } else if (channel === 'native') {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MathRush Challenge',
          text,
          url,
        });
      } catch {
        // user cancelled or share unsupported
      }
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
    }
  }
}
