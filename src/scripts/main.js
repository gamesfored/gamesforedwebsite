import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

let smoother;
let ctx;
let stopPhysicsLoop;

document.addEventListener('astro:page-load', function() {
  // 1. Cleanup
  if (ctx) ctx.revert();
  if (smoother) smoother.kill();
  if (stopPhysicsLoop) stopPhysicsLoop();

  // 2. Initialize ScrollSmoother
  if (document.querySelector("#smooth-wrapper")) {
      try {
          smoother = ScrollSmoother.create({
            wrapper: "#smooth-wrapper",
            content: "#smooth-content",
            smooth: 0.8,
            effects: true,
            ignoreMobileResize: true,
            normalizeScroll: false
          });
      } catch (e) {
          console.warn("ScrollSmoother failed to initialize:", e);
      }
  }

  // 3. Initialize Animations with Context
  ctx = gsap.context(() => {
      // --- Card Animation ---
      const gameCards = document.querySelectorAll('.game-card');
      if (gameCards.length >= 3) {
          ScrollTrigger.matchMedia({
              // Desktop
              "(min-width: 1201px)": function() {
                  gsap.set(gameCards, { clearProps: "all", opacity: 1 });
                  gsap.set(gameCards[0], { x: 400, y: 0, rotation: 0, zIndex: 21, opacity: 1 });
                  gsap.set(gameCards[1], { x: 0, y: 0, rotation: 0, zIndex: 22, opacity: 1 });
                  gsap.set(gameCards[2], { x: -400, y: 0, rotation: 0, zIndex: 23, opacity: 1 });

                  const tl = gsap.timeline({
                      scrollTrigger: {
                          trigger: '.design-cards',
                          start: 'top 80%',
                          end: 'top 30%',
                          once: true
                      }
                  });

                  tl.to(gameCards[0], { x: 0, rotation: -8, duration: 1, ease: 'power2.out' }, 0)
                    .to(gameCards[1], { x: 0, rotation: 2, duration: 1, ease: 'power2.out' }, 0)
                    .to(gameCards[2], { x: 0, rotation: 6, duration: 1, ease: 'power2.out' }, 0);

                  gameCards.forEach((card, index) => {
                      const originalRotation = [-8, 2, 6][index];
                      card.addEventListener('mouseenter', () => {
                          gsap.to(card, { rotation: 0, scale: 1.1, y: -20, zIndex: 25, duration: 0.4, ease: 'power2.out', overwrite: true });
                          card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                      });
                      card.addEventListener('mouseleave', () => {
                          gsap.to(card, { rotation: originalRotation, scale: 1, y: 0, zIndex: index + 21, duration: 0.4, ease: 'power2.out', overwrite: true });
                          card.style.boxShadow = 'none';
                      });
                  });
              },
              // Mobile
              "(max-width: 1200px)": function() {
                  gsap.set(gameCards, { clearProps: "all", opacity: 0, y: 50 });
                  const tl = gsap.timeline({
                      scrollTrigger: {
                          trigger: '.design-cards',
                          start: 'top 80%',
                          end: 'top 30%',
                          once: true
                      }
                  });
                  gameCards.forEach((card, i) => {
                      tl.to(card, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, i * 0.2);
                  });
              }
          });
      }

      // --- Decorative Elements ---
      const designSection = document.querySelector('.design-card-section');
      const pencilDecoration = document.querySelector('.pencil-decoration');
      if (designSection && pencilDecoration) {
          let paperDecoration = designSection.querySelector('.paper-decoration');
          if (!paperDecoration) {
              paperDecoration = document.createElement('div');
              paperDecoration.className = 'paper-decoration';
              paperDecoration.style.cssText = `
                position: absolute; bottom: -800px; right: -250px; width: 1000px; height: 1000px;
                background: url('/assets/paper.png') no-repeat center; background-size: contain;
                pointer-events: none; z-index: 1; opacity: 0; transform: translateY(40px) rotate(-15deg);
              `;
              designSection.appendChild(paperDecoration);
          }
          gsap.timeline({
              scrollTrigger: {
                  trigger: designSection,
                  start: 'top 80%',
                  end: 'top 50%',
                  once: true
              }
          })
          .to(paperDecoration, { opacity: 1, y: 0, rotation: -15, duration: 0.8, ease: 'back.out(1.7)' }, 0)
          .to(pencilDecoration, { opacity: 1, x: 0, y: 0, rotation: 105, duration: 0.8, ease: 'back.out(1.7)' }, 0.2);
      }

      // --- Interactive Elements ---
      const whatWeDoItems = document.querySelectorAll('.what-we-do-item');
      const whatWeDoDetails = document.querySelectorAll('.what-we-do-detail');
      if (whatWeDoItems.length > 0) {
          whatWeDoItems.forEach(item => {
              item.addEventListener('mouseenter', () => {
                  whatWeDoItems.forEach(i => i.classList.remove('active'));
                  whatWeDoDetails.forEach(d => d.classList.remove('active'));
                  item.classList.add('active');
                  const targetDetail = document.querySelector(`[data-detail="${item.dataset.item}"]`);
                  if (targetDetail) targetDetail.classList.add('active');
              });
          });
      }

      const hamburger = document.querySelector('.hamburger');
      const navMenu = document.querySelector('.nav-right');
      if (hamburger && navMenu) {
          hamburger.addEventListener('click', () => {
              hamburger.classList.toggle('active');
              navMenu.classList.toggle('active');
          });
          document.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
              link.addEventListener('click', () => {
                  hamburger.classList.remove('active');
                  navMenu.classList.remove('active');
              });
          });
      }

      const scrollIndicator = document.querySelector('.scroll-indicator');
      if (scrollIndicator) {
          scrollIndicator.addEventListener('click', (e) => {
              e.preventDefault();
              if (smoother) smoother.scrollTo('.design-card-section', true, "power2.inOut");
          });
      }
      
      const ctaButton = document.querySelector('.cta-button');
      if (ctaButton) {
          ctaButton.addEventListener('click', function(e) {
              const href = this.getAttribute('href');
              if (href && href.startsWith('#')) {
                  e.preventDefault();
                  if (smoother) smoother.scrollTo(href, true, "power2.inOut");
              }
          });
      }
      
      const getStartedButtons = document.querySelectorAll('a[href="#contact"]');
      getStartedButtons.forEach(button => {
          button.addEventListener('click', (e) => {
              e.preventDefault();
              if (smoother) smoother.scrollTo('#contact', true, "power2.inOut");
          });
      });
  });

  // 4. Hero Physics
  const hero = document.querySelector('.hero');
  if (hero) {
      let isPhysicsRunning = true;
      let mouseX = 0, mouseY = 0, isMouseInHero = false;
      
      stopPhysicsLoop = () => { isPhysicsRunning = false; };

      hero.addEventListener('mousemove', (e) => {
          const rect = hero.getBoundingClientRect();
          mouseX = e.clientX - rect.left;
          mouseY = e.clientY - rect.top;
          isMouseInHero = true;
      });
      hero.addEventListener('touchmove', (e) => {
          const rect = hero.getBoundingClientRect();
          const touch = e.touches[0];
          mouseX = touch.clientX - rect.left;
          mouseY = touch.clientY - rect.top;
          isMouseInHero = true;
      });
      hero.addEventListener('mouseleave', () => { isMouseInHero = false; });
      hero.addEventListener('touchend', () => { isMouseInHero = false; });

      const initHeroPhysics = async () => {
          try {
              let RAPIER = window.RAPIER;
              if (!RAPIER) { startSimplePhysics(isPhysicsRunning, mouseX, mouseY, isMouseInHero); return; }

              const gravity = { x: 0.0, y: 30.0 };
              const world = new RAPIER.World(gravity);
              
              let heroRect = hero.getBoundingClientRect();
              let heroWidth = heroRect.width;
              let heroHeight = heroRect.height;
              
              // Boundaries
              let groundCollider, leftWallCollider, rightWallCollider;
              const createBoundaries = () => {
                  if (groundCollider) world.removeCollider(groundCollider);
                  if (leftWallCollider) world.removeCollider(leftWallCollider);
                  if (rightWallCollider) world.removeCollider(rightWallCollider);
                  
                  groundCollider = world.createCollider(
                      RAPIER.ColliderDesc.cuboid(heroWidth/2, 10).setTranslation(heroWidth/2, heroHeight - 10).setRestitution(0.5).setFriction(0.7)
                  );
                  leftWallCollider = world.createCollider(
                      RAPIER.ColliderDesc.cuboid(10, heroHeight/2).setTranslation(-10, heroHeight/2).setRestitution(0.3).setFriction(0.5)
                  );
                  rightWallCollider = world.createCollider(
                      RAPIER.ColliderDesc.cuboid(10, heroHeight/2).setTranslation(heroWidth+10, heroHeight/2).setRestitution(0.3).setFriction(0.5)
                  );
              };
              createBoundaries();

              window.addEventListener('resize', () => {
                  if (!isPhysicsRunning) return;
                  heroRect = hero.getBoundingClientRect();
                  heroWidth = heroRect.width;
                  heroHeight = heroRect.height;
                  createBoundaries();
              });

              const assets = ['tic-1.png', 'tic-2.png', 'tic-3.png', 'tic-4.png', 'tac-1.png', 'tac-2.png', 'tac-3.png', 'tac-4.png'];
              const gameElements = [];
              
              const createFallingElement = () => {
                  if (!isPhysicsRunning || gameElements.length >= 25) return;
                  
                  const asset = assets[Math.floor(Math.random() * assets.length)];
                  const size = asset.startsWith('tic') ? 80 : 100;
                  const halfSize = size/2;
                  
                  let x, y;
                  if (isMouseInHero && Math.random() < 0.7) {
                      const angle = Math.random() * Math.PI * 2;
                      const distance = Math.random() * 150;
                      x = Math.max(halfSize, Math.min(heroWidth - halfSize, mouseX + Math.cos(angle) * distance));
                      y = Math.max(halfSize, Math.min(heroHeight - halfSize, mouseY + Math.sin(angle) * distance));
                  } else {
                      x = halfSize + Math.random() * (heroWidth - size);
                      y = halfSize + Math.random() * (heroHeight - size);
                  }
                  
                  const rigidBody = world.createRigidBody(
                      RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y).setAngularDamping(0.1).setLinearDamping(0.05)
                  );
                  const collider = world.createCollider(
                      RAPIER.ColliderDesc.cuboid(halfSize, halfSize).setRestitution(0.6).setFriction(0.4).setDensity(0.8), rigidBody
                  );
                  
                  const element = document.createElement('img');
                  element.src = `/assets/${asset}`;
                  element.className = `falling-element ${asset.startsWith('tic') ? 'tic' : 'tac'}`;
                  element.style.cssText = 'position: absolute; pointer-events: none; z-index: 1;';
                  
                  if(hero.contains(element)) return; 
                  hero.appendChild(element);
                  
                  gameElements.push({ 
                      rigidBody, 
                      collider, 
                      element, 
                      size, 
                      createdTime: Date.now(), 
                      lifespan: 2000 + Math.random()*4000,
                      currentScale: 0
                  });
              };

              const updatePhysics = () => {
                  if (!isPhysicsRunning) return;
                  world.step();
                  
                  for (let i = gameElements.length - 1; i >= 0; i--) {
                      const item = gameElements[i];
                      const pos = item.rigidBody.translation();
                      const rot = item.rigidBody.rotation();
                      const age = Date.now() - item.createdTime;
                      
                      // Animate scale manually
                      if (item.currentScale < 1) {
                          item.currentScale += (1 - item.currentScale) * 0.1;
                          if (item.currentScale > 0.99) item.currentScale = 1;
                      }

                      item.element.style.left = (pos.x - item.size/2) + 'px';
                      item.element.style.top = (pos.y - item.size/2) + 'px';
                      item.element.style.transform = `rotate(${rot}rad) scale(${item.currentScale})`;
                      
                      if (age > item.lifespan || pos.y > heroHeight + 200) {
                          world.removeRigidBody(item.rigidBody);
                          item.element.remove();
                          gameElements.splice(i, 1);
                      }
                  }
                  requestAnimationFrame(updatePhysics);
              };

              updatePhysics();
              setInterval(() => { if(isPhysicsRunning) createFallingElement(); }, 400);
              for(let i=0; i<8; i++) setTimeout(createFallingElement, i*150);

          } catch (e) {
              console.error(e);
              startSimplePhysics(isPhysicsRunning, mouseX, mouseY, isMouseInHero);
          }
      };

      if (window.RAPIER) {
          initHeroPhysics();
      } else {
          window.addEventListener('rapierLoaded', initHeroPhysics, { once: true });
          setTimeout(() => {
              if (!window.RAPIER && isPhysicsRunning && document.querySelector('.hero')) {
                  startSimplePhysics(isPhysicsRunning, mouseX, mouseY, isMouseInHero);
              }
          }, 3000);
      }
  }
});

function startSimplePhysics(isRunningRef, initialMouseX, initialMouseY, initialIsMouseInHero) {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    // Track mouse specifically for simple physics instance
    let mouseX = initialMouseX || 0;
    let mouseY = initialMouseY || 0;
    let isMouseInHero = initialIsMouseInHero || false;
    
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        isMouseInHero = true;
    });
    hero.addEventListener('mouseleave', () => { isMouseInHero = false; });

    let heroRect = hero.getBoundingClientRect();
    let heroWidth = heroRect.width;
    let heroHeight = heroRect.height;
    
    const assets = ['tic-1.png', 'tic-2.png', 'tic-3.png', 'tic-4.png', 'tac-1.png', 'tac-2.png', 'tac-3.png', 'tac-4.png'];
    const gameElements = [];
    
    class SimpleElement {
      constructor() {
        const asset = assets[Math.floor(Math.random() * assets.length)];
        this.size = asset.startsWith('tic') ? 80 : 100;
        
        if (isMouseInHero && Math.random() < 0.7) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 150;
          this.x = Math.max(this.size, Math.min(heroWidth - this.size, mouseX + Math.cos(angle) * distance));
          this.y = Math.max(this.size, Math.min(heroHeight - this.size, mouseY + Math.sin(angle) * distance));
        } else {
          this.x = this.size + Math.random() * (heroWidth - this.size * 2);
          this.y = this.size + Math.random() * (heroHeight - this.size * 2);
        }
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = 0;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.15;
        this.gravity = 1.2;
        this.bounce = 0.7;
        this.friction = 0.97;
        this.createdTime = Date.now();
        this.lifespan = 2000 + Math.random() * 4000;
        this.currentScale = 0;
        
        this.element = document.createElement('img');
        this.element.src = `/assets/${asset}`;
        this.element.className = `falling-element ${asset.startsWith('tic') ? 'tic' : 'tac'}`;
        this.element.style.cssText = 'position: absolute; pointer-events: none; z-index: 1;';
        
        hero.appendChild(this.element);
      }
      
      update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        
        if (this.y + this.size >= heroHeight) {
          this.y = heroHeight - this.size;
          this.vy *= -this.bounce;
          this.vx *= this.friction;
          this.rotationSpeed *= this.friction;
          if (Math.abs(this.vy) < 1) this.vy = 0;
        }
        
        if (this.x <= 0) {
          this.x = 0;
          this.vx *= -this.bounce;
        } else if (this.x + this.size >= heroWidth) {
          this.x = heroWidth - this.size;
          this.vx *= -this.bounce;
        }
        
        // Manual pop-in animation
        if (this.currentScale < 1) {
            this.currentScale += (1 - this.currentScale) * 0.1;
            if (this.currentScale > 0.99) this.currentScale = 1;
        }
        
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        this.element.style.transform = `rotate(${this.rotation}rad) scale(${this.currentScale})`;
        
        const age = Date.now() - this.createdTime;
        const shouldRemove = age > this.lifespan || this.y > heroHeight + 100 || this.x < -100 || this.x > heroWidth + 100;
        return !shouldRemove;
      }
    }
    
    function createFallingElement() {
      if (gameElements.length >= 20) return;
      gameElements.push(new SimpleElement());
    }
    
    function updatePhysics() {
      // Use the ref passed in or global check, though in fallback context it's tricky.
      // We will check element presence as proxy for now.
      if (!document.querySelector('.hero')) return; 
      
      for (let i = gameElements.length - 1; i >= 0; i--) {
        if (!gameElements[i].update()) {
          gameElements[i].element.remove();
          gameElements.splice(i, 1);
        }
      }
      requestAnimationFrame(updatePhysics);
    }
    
    updatePhysics();
    setInterval(createFallingElement, 500);
    for (let i = 0; i < 8; i++) setTimeout(createFallingElement, i * 200);
    
    window.addEventListener('resize', () => {
        if (!document.querySelector('.hero')) return;
        heroRect = hero.getBoundingClientRect();
        heroWidth = heroRect.width;
        heroHeight = heroRect.height;
    });
}