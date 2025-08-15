document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const ctaButton = document.querySelector('.cta-button');
  
  // Hamburger menu toggle
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.nav-link, .nav-cta');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
      } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
      }
    });
  }
  
  // Hero CTA button
  if (ctaButton) {
    ctaButton.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Add a simple animation effect when clicked
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'translateY(-2px)';
      }, 150);
      
      // Here you would typically navigate to another page or section
      console.log('CTA button clicked: Why Do They Love It?');
      
      // For now, just scroll to show the interaction
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    });
  }

  // Rapier.rs physics simulation
  const hero = document.querySelector('.hero');
  
  if (hero) {
    let mouseX = 0;
    let mouseY = 0;
    let isMouseInHero = false;
    
    // Track mouse/touch position
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isMouseInHero = true;
    });
    
    hero.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = hero.getBoundingClientRect();
      const touch = e.touches[0];
      mouseX = touch.clientX - rect.left;
      mouseY = touch.clientY - rect.top;
      isMouseInHero = true;
    });
    
    hero.addEventListener('mouseleave', () => {
      isMouseInHero = false;
    });
    
    hero.addEventListener('touchend', () => {
      isMouseInHero = false;
    });
    function initPhysics() {
      startRapierPhysics().catch(() => {
        startSimplePhysics();
      });
    }
    
    window.addEventListener('rapierLoaded', initPhysics);
    window.addEventListener('rapierFailed', () => {
      startSimplePhysics();
    });
    
    setTimeout(() => {
      if (!window.RAPIER) {
        startSimplePhysics();
      }
    }, 3000);
    
    async function startRapierPhysics() {
      try {
        const gravity = { x: 0.0, y: 98.1 };
        const world = new window.RAPIER.World(gravity);
        
        const heroRect = hero.getBoundingClientRect();
        const heroWidth = heroRect.width;
        const heroHeight = heroRect.height;
      
      // Create boundaries
      const groundColliderDesc = window.RAPIER.ColliderDesc.cuboid(heroWidth / 2, 10)
        .setTranslation(heroWidth / 2, heroHeight - 10)
        .setRestitution(0.5)
        .setFriction(0.7);
      world.createCollider(groundColliderDesc);
      
      const leftWallColliderDesc = window.RAPIER.ColliderDesc.cuboid(10, heroHeight / 2)
        .setTranslation(-10, heroHeight / 2)
        .setRestitution(0.3)
        .setFriction(0.5);
      world.createCollider(leftWallColliderDesc);
      
      const rightWallColliderDesc = window.RAPIER.ColliderDesc.cuboid(10, heroHeight / 2)
        .setTranslation(heroWidth + 10, heroHeight / 2)
        .setRestitution(0.3)
        .setFriction(0.5);
      world.createCollider(rightWallColliderDesc);
      
      const assets = ['tic-1.png', 'tic-2.png', 'tic-3.png', 'tic-4.png', 'tac-1.png', 'tac-2.png', 'tac-3.png', 'tac-4.png'];
      const gameElements = [];
      const maxElements = 25;
      
      function createFallingElement() {
        if (gameElements.length >= maxElements) return;
        
        const asset = assets[Math.floor(Math.random() * assets.length)];
        const size = asset.startsWith('tic') ? 80 : 100;
        const halfSize = size / 2;
        
        let x, y;
        
        // 70% chance to spawn near mouse if mouse is in hero area
        if (isMouseInHero && Math.random() < 0.7) {
          // Spawn within 150px radius of mouse position
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 150;
          x = Math.max(halfSize, Math.min(heroWidth - halfSize, mouseX + Math.cos(angle) * distance));
          y = Math.max(halfSize, Math.min(heroHeight - halfSize, mouseY + Math.sin(angle) * distance));
        } else {
          // Random spawn anywhere in hero section
          x = halfSize + Math.random() * (heroWidth - size);
          y = halfSize + Math.random() * (heroHeight - size);
        }
        
        // Create rigid body
        const rigidBodyDesc = window.RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(x, y)
          .setAngularDamping(0.1)
          .setLinearDamping(0.05);
        const rigidBody = world.createRigidBody(rigidBodyDesc);
        
        // Create collider
        const colliderDesc = window.RAPIER.ColliderDesc.cuboid(halfSize, halfSize)
          .setRestitution(0.6)
          .setFriction(0.4)
          .setDensity(0.8);
        const collider = world.createCollider(colliderDesc, rigidBody);
        
        // Create DOM element
        const element = document.createElement('img');
        element.src = `/assets/${asset}`;
        element.className = `falling-element ${asset.startsWith('tic') ? 'tic' : 'tac'}`;
        element.style.position = 'absolute';
        element.style.pointerEvents = 'none';
        element.style.zIndex = '1';
        
        // Pop in animation
        element.style.transform = 'scale(0)';
        element.style.transition = 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        
        hero.appendChild(element);
        
        // Trigger pop in after a small delay to ensure DOM is ready
        setTimeout(() => {
          element.style.transform = 'scale(1)';
        }, 10);
        
        const lifespan = 2000 + Math.random() * 4000; // 2-6 seconds
        gameElements.push({ rigidBody, collider, element, size, createdTime: Date.now(), lifespan, poppedIn: false });
      }
      
      function updatePhysics() {
        // Step the physics world
        world.step();
        
        // Update DOM elements to match physics bodies
        gameElements.forEach((gameElement) => {
          const { rigidBody, element, size, createdTime, lifespan } = gameElement;
          const position = rigidBody.translation();
          const rotation = rigidBody.rotation();
          const age = Date.now() - createdTime;
          
          // Mark as popped in after initial animation
          if (age > 400 && !gameElement.poppedIn) {
            gameElement.poppedIn = true;
            element.style.transition = '';
          }
          
          // Check if element should start fading out
          if (age > lifespan - 500 && !gameElement.fadingOut) {
            gameElement.fadingOut = true;
            element.style.transition = 'transform 0.5s ease-in';
            element.style.transform = `scale(0) rotate(${rotation}rad)`;
          } else if (!gameElement.fadingOut && gameElement.poppedIn) {
            element.style.left = (position.x - size / 2) + 'px';
            element.style.top = (position.y - size / 2) + 'px';
            element.style.transform = `scale(1) rotate(${rotation}rad)`;
          } else if (!gameElement.fadingOut) {
            // During pop-in, only update position
            element.style.left = (position.x - size / 2) + 'px';
            element.style.top = (position.y - size / 2) + 'px';
          }
        });
        
        // Remove elements after timeout or if they fall off screen
        for (let i = gameElements.length - 1; i >= 0; i--) {
          const gameElement = gameElements[i];
          const { rigidBody, element, createdTime, lifespan } = gameElement;
          const position = rigidBody.translation();
          const age = Date.now() - createdTime;
          
          const shouldRemove = age > lifespan || 
                             position.y > heroHeight + 200 || 
                             position.x < -100 || 
                             position.x > heroWidth + 100;
          
          if (shouldRemove) {
            world.removeRigidBody(rigidBody);
            if (element.parentNode) {
              element.remove();
            }
            gameElements.splice(i, 1);
          }
        }
        
        requestAnimationFrame(updatePhysics);
      }
      
      // Start physics loop
      updatePhysics();
      
      // Create elements periodically
      setInterval(createFallingElement, 400);
      
      // Create initial batch
      for (let i = 0; i < 8; i++) {
        setTimeout(createFallingElement, i * 150);
      }
      
      } catch (error) {
        throw error;
      }
    }
    
    function startSimplePhysics() {
      const heroRect = hero.getBoundingClientRect();
      const heroWidth = heroRect.width;
      const heroHeight = heroRect.height;
      
      const assets = ['tic-1.png', 'tic-2.png', 'tic-3.png', 'tic-4.png', 'tac-1.png', 'tac-2.png', 'tac-3.png', 'tac-4.png'];
      const gameElements = [];
      
      class SimpleElement {
        constructor() {
          const asset = assets[Math.floor(Math.random() * assets.length)];
          this.size = asset.startsWith('tic') ? 80 : 100;
          
          // 70% chance to spawn near mouse if mouse is in hero area
          if (isMouseInHero && Math.random() < 0.7) {
            // Spawn within 150px radius of mouse position
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 150;
            this.x = Math.max(this.size, Math.min(heroWidth - this.size, mouseX + Math.cos(angle) * distance));
            this.y = Math.max(this.size, Math.min(heroHeight - this.size, mouseY + Math.sin(angle) * distance));
          } else {
            // Random spawn anywhere in hero section
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
          this.lifespan = 2000 + Math.random() * 4000; // 2-6 seconds
          this.fadingOut = false;
          this.poppedIn = false;
          
          this.element = document.createElement('img');
          this.element.src = `/assets/${asset}`;
          this.element.className = `falling-element ${asset.startsWith('tic') ? 'tic' : 'tac'}`;
          this.element.style.position = 'absolute';
          this.element.style.pointerEvents = 'none';
          this.element.style.zIndex = '1';
          
          // Pop in animation
          this.element.style.transform = 'scale(0)';
          this.element.style.transition = 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
          
          hero.appendChild(this.element);
          
          // Trigger pop in after a small delay to ensure DOM is ready
          setTimeout(() => {
            this.element.style.transform = 'scale(1)';
          }, 10);
        }
        
        update() {
          this.vy += this.gravity;
          this.x += this.vx;
          this.y += this.vy;
          this.rotation += this.rotationSpeed;
          
          // Collision with floor
          if (this.y + this.size >= heroHeight) {
            this.y = heroHeight - this.size;
            this.vy *= -this.bounce;
            this.vx *= this.friction;
            this.rotationSpeed *= this.friction;
            if (Math.abs(this.vy) < 1) this.vy = 0;
          }
          
          // Collision with walls
          if (this.x <= 0) {
            this.x = 0;
            this.vx *= -this.bounce;
          } else if (this.x + this.size >= heroWidth) {
            this.x = heroWidth - this.size;
            this.vx *= -this.bounce;
          }
          
          // Simple collision between elements
          gameElements.forEach(other => {
            if (other === this) return;
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = (this.size + other.size) / 2;
            
            if (distance < minDistance && distance > 0) {
              const pushX = (dx / distance) * (minDistance - distance) * 0.5;
              const pushY = (dy / distance) * (minDistance - distance) * 0.5;
              this.x += pushX;
              this.y += pushY;
              other.x -= pushX;
              other.y -= pushY;
              
              const pushStrength = 0.15;
              this.vx += pushX * pushStrength;
              this.vy += pushY * pushStrength;
              other.vx -= pushX * pushStrength;
              other.vy -= pushY * pushStrength;
            }
          });
          
          const age = Date.now() - this.createdTime;
          
          // Mark as popped in after initial animation
          if (age > 400 && !this.poppedIn) {
            this.poppedIn = true;
            this.element.style.transition = '';
          }
          
          // Check if element should start fading out
          if (age > this.lifespan - 500 && !this.fadingOut) {
            this.fadingOut = true;
            this.element.style.transition = 'transform 0.5s ease-in';
            this.element.style.transform = `scale(0) rotate(${this.rotation}rad)`;
          } else if (!this.fadingOut && this.poppedIn) {
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
            this.element.style.transform = `scale(1) rotate(${this.rotation}rad)`;
          } else if (!this.fadingOut) {
            // During pop-in, only update position
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
          }
          
          const shouldRemove = age > this.lifespan || 
                             this.y > heroHeight + 100 || 
                             this.x < -100 || 
                             this.x > heroWidth + 100;
          
          return !shouldRemove;
        }
      }
      
      function createFallingElement() {
        if (gameElements.length >= 20) return;
        gameElements.push(new SimpleElement());
      }
      
      function updatePhysics() {
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
    }
  }
});