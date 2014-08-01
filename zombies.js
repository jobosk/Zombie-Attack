(function(){
    'use strict';
    window.addEventListener('load',init,false);
    ParticleSystem.prototype=[];
	BulletSystem.prototype=[];
	
	// Constants
	
	var KEY_ENTER = 13;
	var KEY_LEFT = 37;
	var KEY_UP = 38;
	var KEY_RIGHT = 39;
	var KEY_DOWN = 40;
	
	var GREEN = '#0f0';
	var RED = '#f00';
	var WHITE = '#fff';
	
	// Variables
	
	var canvas = null, ctx = null;
	var time = 0;
	var mousex=0,mousey=0;
	
	var score = 0;
	var gameover = false;
	
	var player;
	var weapon;
	var enemies = Array();
	
	var bs = new BulletSystem();
	var ps = new ParticleSystem();
	
	var soldier_img=new Image();
    soldier_img.src='soldado.png';
	var weapon_img=new Image();
    weapon_img.src='arma.png';
	var zombies_img=new Image();
    zombies_img.src='zombies.png';
	var drzombies_img=new Image();
    drzombies_img.src='drzombies.png';
	var scientist_img=new Image();
    scientist_img.src='scientist.png';
	var background_img=new Image();
    background_img.src='background.png';
	
	var counter=0;
	
	// Classes
	
	function Object(x,y,img){
		this.x=(x==null)?0:x;
		this.y=(y==null)?0:y;
		this.img=img;
		this.width=(img==null)?0:img.width;
		this.height=(img==null)?0:img.height;
			
		this.intersects=function(obj){
			if(obj!=null){
				return(this.x<obj.x+obj.width&&
					this.x+this.width>obj.x&&
					this.y<obj.y+obj.height&&
					this.y+this.height>obj.y);
			}
		}
		
		this.fill=function(ctx){
			if(ctx!=null){
				ctx.fillStyle=this.color;
				ctx.fillRect(this.x,this.y,this.width,this.height);
			}
		}
		
		this.drawImageArea=function(ctx,sx,sy,sw,sh){
            if(this.img.width)
                ctx.drawImage(this.img,sx,sy,sw,sh,this.x,this.y,this.width,this.height);
            else
                ctx.strokeRect(this.x,this.y,this.width,this.height);
        }
	}

	function Enemy(x,y,life,value,vel,img,img_q,img_v){
		this.x=(x==null)?0:x;
		this.y=(y==null)?0:y;
		this.life=(life==null)?5:life;
		this.value=(value==null)?0:value;
		this.vel=(vel==null)?0:vel;
		this.img=img;
		this.img_q=(img==null)?1:img_q;
		this.img_v=(img==null)?0:img_v;
		this.width=(img==null)?0:img.width/img_q;
		this.height=(img==null)?0:img.height;
			
		this.intersects=function(obj){
			if(obj!=null){
				return(this.x<obj.x+obj.width&&
					this.x+this.width>obj.x&&
					this.y<obj.y+obj.height&&
					this.y+this.height>obj.y);
			}
		}
		
		this.fill=function(ctx){
			if(ctx!=null){
				ctx.fillStyle=this.color;
				ctx.fillRect(this.x,this.y,this.width,this.height);
			}
		}
		
		this.drawImageArea=function(ctx,sx,sy,sw,sh){
            if(this.img.width)
                ctx.drawImage(this.img,sx,sy,sw,sh,this.x,this.y,this.width,this.height);
            else
                ctx.strokeRect(this.x,this.y,this.width,this.height);
        }
	}
	
	function Projectile(x,y,vel,color,img,img_q){
		this.x=(x==null)?0:x;
		this.y=(y==null)?0:y;
		this.vel=(vel==null)?1:vel;
		this.color=(color==null)?'#fff':color;
		this.img=img;
		this.img_q=(img==null)?1:img_q;
		this.width=(img==null)?2:img.width;
		this.height=(img==null)?2:img.height;
		this.paint = true;
			
		this.intersects=function(obj){
			if(obj!=null){
				return(this.x<obj.x+obj.width&&
					this.x+this.width>obj.x&&
					this.y<obj.y+obj.height&&
					this.y+this.height>obj.y);
			}
		}
		
		this.fill=function(ctx){
			if(ctx!=null){
				ctx.fillStyle=this.color;
				ctx.fillRect(this.x,this.y,this.width,this.height);
			}
		}
	}
	
	function BulletSystem(){
		this.fly=function(deltaTime){
			for(var i=0,l=this.length;i<l;i++){
				for(var j in enemies)
					if(this[i].intersects(enemies[j])){
						enemies[j].life--;
						if(enemies[j].life<=0){
							score+=enemies[j].value;
							enemies.splice(j--,1);
						}
						for(var j=0;j<200;j++)
							ps.push(new Particle(this[i].x,this[i].y,1,500+random(1,0,500),random(1,0,100),random(1,0,360),RED));
						this[i].paint=false;
					}
				if(this[i].x < 0 || this[i].x > canvas.width || this[i].y < 0 || this[i].y > canvas.height){
					var color='rgb('+random(1,0,255)+','+random(1,0,255)+','+random(1,0,255)+')';
					for(var j=0;j<200;j++)
						ps.push(new Particle(this[i].x,this[i].y,1,500+random(1,0,500),random(1,0,100),random(1,0,360),color));
					this[i].paint=false;
				}
				if(this[i].paint==true){
					this[i].x+=Math.cos(cAngle(mousex,mousey,weapon.x,weapon.y))*this[i].vel*(deltaTime/1000);
					this[i].y+=Math.sin(cAngle(mousex,mousey,weapon.x,weapon.y))*this[i].vel*(deltaTime/1000);
				}else{
					this.splice(i--,1);
					l--;
				}						
			}
		}
		this.fill=function(ctx){
			for(var i=0,l=this.length;i<l;i++){
				this[i].fill(ctx);
			}
		}
	}

	function Particle(x,y,radius,life,speed,angle,color){
		this.x=(x==null)?0:x;
		this.y=(y==null)?0:y;
		this.radius=(radius==null)?1:radius;
		this.life=(life==null)?0:life;
		this.speed=(speed==null)?0:speed;
		this.angle=(angle==null)?0:angle;
		this.color=(color==null)?'#fff':color;
	}

	function ParticleSystem(){
		this.move=function(deltaTime){
			for(var i=0,l=this.length;i<l;i++){
				this[i].life-=deltaTime;
				if(this[i].life<0){
					this.splice(i--,1);
					l--;
				}else{
					this[i].x+=Math.cos(this[i].angle)*this[i].speed*(deltaTime/1000);
					this[i].y+=Math.sin(this[i].angle)*this[i].speed*(deltaTime/1000);
				}
			}
		}
		this.fill=function(ctx){
			for(var i=0,l=this.length;i<l;i++){
				ctx.fillStyle=this[i].color;
				ctx.beginPath();
				ctx.arc(this[i].x,this[i].y,this[i].radius,0,Math.PI*2,true);
				ctx.fill();
			}
		}
	}
	
	// Functions

	function random(multiple, min, max){
		return Math.round((Math.random()*(max-min)+min)/multiple)*multiple;
	}
	
	function cAngle(o_x, o_y, d_x, d_y){
		return (Math.atan2(o_y-d_y,o_x-d_x));
	}
	
	function distance(o_x, o_y, d_x, d_y){
		var dx=d_x-o_x;
		var dy=d_y-o_y;
		return Math.sqrt(dx*dx+dy*dy);
	}

	// Program

	function init(){
		canvas=document.getElementById('canvas');
        canvas.style.background='#000';
        ctx=canvas.getContext('2d');
		
		player = new Object(20, canvas.height-80, soldier_img);
		weapon = new Object(player.x + 5, player.y + 4, weapon_img);
		
		run();
	}

	function paint(ctx){
		if(!gameover){
			// Clear the canvas
			ctx.clearRect(0,0,canvas.width,canvas.height);
			
			ctx.drawImage(background_img,0,0,1055,224);
			
			// Refresh weapon position		
			weapon.x = player.x + 5;
			weapon.y = player.y + 4;
			
			// Paint player
			player.drawImageArea(ctx,0,0,33,38);
			
			// Paint weapon
			ctx.save();
			ctx.translate(weapon.x+4,weapon.y+8);
			ctx.rotate(cAngle(mousex,mousey,weapon.x,weapon.y));
			ctx.translate(-weapon.x-4,-weapon.y-8);
			weapon.drawImageArea(ctx,0,0,43,15);
			ctx.restore();
			
			// Paint bullets
			bs.fill(ctx);
			
			// Paint enemies
			for(var i in enemies)
				enemies[i].drawImageArea(ctx,(~~(counter/enemies[i].img_v)%enemies[i].img_q)*enemies[i].width,0,enemies[i].width,enemies[i].height);
			
			// Paint particles
			ps.fill(ctx);
			
			ctx.fillStyle='#fff';
			ctx.fillText('Score: '+score,10,20);
		}else{
			ctx.textAlign='center';
			ctx.fillStyle='#fff';
			ctx.fillText('GAME OVER',canvas.width/2,canvas.height/2);
			ctx.textAlign='left';
		}
	}

	function run(){
		requestAnimationFrame(run);
		
		var now=Date.now();
		var deltaTime=now-time;
		if(deltaTime>1000)
			deltaTime=0;
		time=now;
		
		act(deltaTime);
		paint(ctx);
	}

	function act(deltaTime){
		if(!gameover){
			
			// Refresh enemy position
			counter+=1;
			if(counter>=65520)
				counter=0;
			
			for(var i in enemies){
				enemies[i].x-=enemies[i].vel;
				// Player intersects enemy
				if(enemies[i].intersects(player) && enemies[i].value >= 0)
					gameover=true;
				if(enemies[i].x < -enemies[i].width)
					enemies.splice(i--,1);
			}
			
			if(random(1,0,30)==0){
				if(random(1,0,2)==0)
					enemies.push(new Enemy(canvas.width,canvas.height-random(scientist_img.height,scientist_img.height,scientist_img.height*2)+3,5,-3,2,scientist_img,9,6));
				else if(random(1,0,2)==1)
					enemies.push(new Enemy(canvas.width,canvas.height-random(zombies_img.height,zombies_img.height,zombies_img.height*2),5,1,1,zombies_img,16,4));
				else
					enemies.push(new Enemy(canvas.width,canvas.height-random(drzombies_img.height,drzombies_img.height,drzombies_img.height*2),5,1,0.4,drzombies_img,11,4));					
			}
			
			// Bullets movement		
			bs.fly(deltaTime);
			
			// Particle movement
			ps.move(deltaTime);
		}
	}
	
	document.addEventListener('mousemove',function(evt){
        mousex=evt.pageX-canvas.offsetLeft;
        mousey=evt.pageY-canvas.offsetTop;
    },false);
	
	document.addEventListener('mousedown',function(evt){
		if(evt.which==1 && !gameover){
			var g_x = weapon.x + weapon.width, g_y = weapon.y + 2;
			var a = cAngle(mousex,mousey,weapon.x,weapon.y);
			var c_x = weapon.x + 4, c_y = weapon.y + 8;
			var w_x = c_x + Math.cos(a) * (g_x - c_x) - Math.sin(a) * (g_y - c_y);
			var w_y = c_y + Math.sin(a) * (g_x - c_x) + Math.cos(a) * (g_y - c_y);
			bs.push(new Projectile(w_x,w_y,1000,WHITE));
		}
	},false);

	document.addEventListener('keydown',function(evt){
		
		// Player movement
		/*if(evt.keyCode==KEY_RIGHT && player.x<canvas.width-player.width)
			player.x+=10;
		if(evt.keyCode==KEY_LEFT && player.x>0)
			player.x-=10;*/
	
	},false);

	window.requestAnimationFrame=(function(){
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function(callback){window.setTimeout(callback,17);};
	})();
})();