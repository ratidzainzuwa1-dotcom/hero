// Site-wide enhancements: page transitions, nav active state, and small UI animations
document.addEventListener('DOMContentLoaded', ()=>{
  // simple fade-in for the whole page
  document.documentElement.classList.add('page-loaded');

  // active link highlighting
  try{
    const links = document.querySelectorAll('.nav-links a, .nav-mobile a');
    links.forEach(a=>{
      if(a.href === location.origin + location.pathname || (a.getAttribute('href') === location.pathname)){
        a.classList.add('active');
      }
      a.addEventListener('click', ()=>{
        // small click ripple using transform
        a.animate([{transform:'scale(1)'},{transform:'scale(.98)'},{transform:'scale(1)'}],{duration:180});
      });
    });
  }catch(e){}

  // smooth page transitions for internal navigation
  document.querySelectorAll('a').forEach(a=>{
    const href = a.getAttribute('href');
    if(!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;
    a.addEventListener('click', (ev)=>{
      // allow modifier keys / new tab
      if(ev.metaKey||ev.ctrlKey||ev.shiftKey) return;
      ev.preventDefault();
      document.documentElement.classList.add('page-exit');
      setTimeout(()=> window.location.href = a.href, 260);
    });
  });

  // subtle parallax for hero image on mousemove
  const heroImg = document.querySelector('.hero-illustration');
  if(heroImg){
    document.querySelector('.hero').addEventListener('mousemove', (e)=>{
      const r = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      heroImg.style.transform = `translate3d(${x*6}px, ${y*-6}px, 0) rotate(${x*2}deg)`;
    });
    document.querySelector('.hero').addEventListener('mouseleave', ()=>{ heroImg.style.transform = ''; });
  }

  // activate mobile nav toggle if present
  const navToggle = document.getElementById('navToggle');
  if(navToggle){ navToggle.addEventListener('click', ()=>{ const m = document.getElementById('navMobile'); if(!m) return; m.style.display = (m.style.display === 'block') ? 'none' : 'block'; }); }
});

// small utility for demo pages: animate a grid of cards
window.animateGrid = function animateGrid(containerSelector){
  const c = document.querySelector(containerSelector);
  if(!c) return;
  Array.from(c.children).forEach((el,i)=>{
    el.style.opacity = 0;
    el.style.transform = 'translateY(12px)';
    setTimeout(()=>{
      el.style.transition='all .45s cubic-bezier(.2,.9,.2,1)';
      el.style.opacity=1;
      el.style.transform='none';
    }, i*80);
  });
}
