// helper to ensure puppeteer downloads a browser when running in some CI or constrained envs
const puppeteer = require('puppeteer');
(async ()=>{
  try{
    console.log('Puppeteer version:', puppeteer.version);
    console.log('Chromium revision available');
  }catch(e){
    console.error('Puppeteer install helper failed', e);
    process.exit(1);
  }
})();
