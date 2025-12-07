// Render the animated SVG using Puppeteer, capture PNG frames, and use ffmpeg to create a GIF.
const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');
const puppeteer = require('puppeteer');

async function render(){
  const outDir = path.join(__dirname, '..', 'assets');
  const outPath = path.join(outDir, 'preview.gif');
  const svgPath = path.join(__dirname, '..', 'assets', 'preview-animation.svg');
  const tmpHtml = `file://${svgPath}`;

  if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive:true});

  const browser = await puppeteer.launch({args: ['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  const width = 900, height = 320;
  await page.setViewport({width, height});
  await page.goto(tmpHtml);

  const framesDir = path.join(outDir, 'frames');
  if(!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, {recursive:true});
  // clear old frames
  fs.readdirSync(framesDir).forEach(f=>fs.unlinkSync(path.join(framesDir,f)));

  const totalFrames = 30;
  const durationMs = 2000; // match SVG animation roughly
  const interval = Math.round(durationMs / totalFrames);

  console.log('Capturing frames...');
  for(let i=0;i<totalFrames;i++){
    await page.waitForTimeout(interval);
    const filename = path.join(framesDir, `frame-${String(i).padStart(3,'0')}.png`);
    await page.screenshot({path: filename, type: 'png'});
    process.stdout.write('.');
  }
  process.stdout.write('\n');
  await browser.close();

  // Use ffmpeg to convert frames to a looping GIF
  console.log('Encoding GIF with ffmpeg...');
  // ffmpeg command: -framerate X -i frame-%03d.png -vf palettegen palette.png; then use palette
  const pal = path.join(outDir, 'palette.png');
  const fps = Math.round(1000/interval);
  try{
    execFileSync('ffmpeg', ['-y','-framerate',String(fps),'-i',path.join(framesDir,'frame-%03d.png'),'-vf','palettegen',pal], {stdio:'inherit'});
    execFileSync('ffmpeg', ['-y','-framerate',String(fps),'-i',path.join(framesDir,'frame-%03d.png'),'-i',pal,'-lavfi','paletteuse',outPath], {stdio:'inherit'});
    console.log('Saved GIF to', outPath);
  }catch(err){
    console.error('ffmpeg failed. Is ffmpeg installed?', err.message);
    process.exit(1);
  }
}

render().catch(err=>{console.error(err); process.exit(1)});
