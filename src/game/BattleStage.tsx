import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import type { BattlePhase } from './encounterFlow';
import { createPixelCharacter, enemySprites, modelSprites, trainerSprite, type ModelId } from './pixelArt';

export interface BattleStageProps {
  enemy?: string;
  model?: string | null;
  phase?: BattlePhase;
  attackSequence?: number;
  bossSequence?: number;
  attackType?: string;
  outcome?: 'active' | 'won' | 'lost';
  reducedMotion?: boolean;
}
interface Presentation {
  model: string | null;
  phase: BattlePhase;
  attackSequence: number;
  bossSequence: number;
  attackType: string;
  outcome: 'active' | 'won' | 'lost';
  reducedMotion: boolean;
}
const PRESENTATION_EVENT='pokaimon:presentation';

const COLORS:Record<string,number>={
  reasoning:0xfce176, research:0x94dff7, coding:0xffaa69,
  verification:0x7ad8ae, context:0xb9a6fa,
};
const MODEL_FX:Record<string,number>={astra:0x81f9e4,grok:0xb49aff,fable:0xffc078};

function drawPlatform(g:Phaser.GameObjects.Graphics,x:number,y:number,width:number):void {
  const half=width/2, left=Math.round(x-half);
  // Multi-layer soil, undercut edge, and roots use smaller handcrafted pixel steps.
  g.fillStyle(0x283f48);g.fillRect(left+13,y+18,width-26,8);
  g.fillRect(left+25,y+26,width-50,3);
  g.fillStyle(0x6b664e);g.fillRect(left+18,y+18,width-36,5);
  g.fillStyle(0x9d8056);g.fillRect(left+23,y+16,width-46,4);
  g.fillStyle(0x367554);g.fillRect(left+9,y+9,width-18,12);
  g.fillRect(left+16,y+3,width-32,9);
  g.fillStyle(0x4b9a6e);g.fillRect(left+13,y+1,width-26,14);
  g.fillRect(left+22,y-5,width-44,11);
  g.fillStyle(0x71c987);g.fillRect(left+21,y-7,width-42,11);
  g.fillRect(left+31,y-11,width-62,7);
  // Separate blades, rim light and individual stone flecks add finer pixel detail.
  for(let i=0;i<21;i++){
    const px=Math.round(left+17+i*(width-34)/21);
    g.fillStyle(i%4===0?0xb4e6a8:i%3===0?0x8edc97:0x6abb7c);
    g.fillRect(px,y-9+(i%4)*2,2+(i%3),4+(i%3)*2);
    if(i%4===0){g.fillStyle(0x39775d);g.fillRect(px+2,y+13,3,2);}
    if(i%3===0){g.fillStyle(0xd6aa6f);g.fillRect(px+1,y+21,3,2);}
  }
  g.fillStyle(0xe1e4a5);
  for(let i=0;i<9;i++)
    g.fillRect(left+29+i*(width-60)/9,y-4+(i%3)*2,2,2);
}

/** Layered deterministic 1-6px scenery, keeping the original 360x330 canvas. */
function drawScenery(g:Phaser.GameObjects.Graphics):void {
  // Mountains now step in 6px pieces, with two-tone shadow ridges.
  for(let x=0;x<360;x+=6){
    const ridge=109+Math.round(Math.sin(x*0.035)*13)+Math.round(Math.sin(x*0.11)*5);
    g.fillStyle(0xd7ba9a);g.fillRect(x,ridge,6,171-ridge);
    g.fillStyle(0xbfa492);g.fillRect(x,ridge+9,3,4);
    if(x%18===0){g.fillStyle(0xf0d3a8);g.fillRect(x+2,ridge+3,4,2);}
  }
  // Distant trees have irregular crowns, narrow trunks and separated canopies.
  for(let x=0;x<360;x+=6){
    const top=153+Math.round(Math.sin(x*0.075)*9);
    g.fillStyle(0x93bca2);g.fillRect(x,top,6,180-top);
    g.fillStyle(0x7db397);g.fillRect(x+3,top+6,3,174-top);
    if(x%24===0){g.fillStyle(0xc4d1aa);g.fillRect(x+2,top-5,3,9);}
  }
  for(let x=0;x<360;x+=18){
    const top=171+(x%54===0?-11:0);
    g.fillStyle(0x447e65);g.fillRect(x+7,top+9,4,13);
    g.fillStyle(0x4f9877);
    g.fillRect(x+4,top,10,13);
    g.fillRect(x,top+5,18,7);
    g.fillStyle(0x75b38c);
    g.fillRect(x+7,top-3,6,4);
    g.fillRect(x+2,top+5,4,3);
  }
  // Dry-ground highlights, individual stones and grass in several scales.
  for(let i=0;i<70;i++){
    const x=(i*67+19)%354;
    const y=198+(i*43)%119;
    g.fillStyle(i%3===0?0xffe0a2:0xd5a06b);
    g.fillRect(x,y,3+(i%3),1+(i%2));
    if(i%5===0){
      g.fillStyle(0x9b7655);
      g.fillRect(x+4,y+2,3,2);
    }
    if(i%3===0){
      g.fillStyle(i%2===0?0x488b65:0x68ac77);
      g.fillRect(x+2,y-7,2,9);
      g.fillRect(x-1,y-4,3,2);
      g.fillRect(x+4,y-5,3,2);
    }
  }
  // Floating pixel motes remain static and do not compete with attack effects.
  g.fillStyle(0xfff7dd);
  for(let i=0;i<12;i++){
    const x=(i*71+29)%351;
    const y=30+(i*31)%90;
    g.fillRect(x,y,2+(i%2),2);
  }
}

function createScene(enemyName:string,initial:Presentation):typeof Phaser.Scene {
  return class BattleScene extends Phaser.Scene {
    private trainer!:ReturnType<typeof createPixelCharacter>;
    private enemy!:ReturnType<typeof createPixelCharacter>;
    private hero!:ReturnType<typeof createPixelCharacter>;
    private heroModel:string|null=null;
    private lastPhase:BattlePhase|null=null;
    private lastAttackSequence=0;
    private lastBossSequence=0;
    private heroIdle=false;

    constructor(){super('retro-battle');}

    create():void {
      const g=this.add.graphics();
      // Original handheld-pixel battlefield: drawn color bands and graphic edges, no external textures.
      g.fillStyle(0xffefdc);g.fillRect(0,0,360,78);
      g.fillStyle(0xfde0b2);g.fillRect(0,78,360,54);
      g.fillStyle(0xf6ca80);g.fillRect(0,132,360,34);
      g.fillStyle(0xedb66b);g.fillRect(0,166,360,164);
      g.fillStyle(0xf8d295);g.fillRect(0,186,360,12);g.fillRect(0,231,360,5);
      g.fillStyle(0xf6be76);
      for(let i=0;i<14;i++){g.fillRect(i*29,183+(i%3)*7,20,4);}
      // A few square-pixel cloudlets and blades create depth without photographic gradients.
      g.fillStyle(0xfffaf0);g.fillRect(42,45,30,5);g.fillRect(49,40,23,5);
      g.fillRect(307,35,31,5);g.fillRect(314,30,24,5);
      drawScenery(g);
      drawPlatform(g,261,209,170);
      drawPlatform(g,93,291,168);
      // Ground grass edges; intentionally chunked into large pixels.
      g.fillStyle(0x448867);
      for(let i=0;i<12;i++){g.fillRect(i*33,(i%2===0?310:317),11,20);}
      g.fillStyle(0x78c58b);
      for(let i=0;i<11;i++){g.fillRect(5+i*34,311+(i%3)*4,6,14);}
      g.fillStyle(0x65b078);
      for(let i=0;i<13;i++){g.fillRect((i*37+16)%360,276+(i%3)*5,6,5);}
      g.fillStyle(0xffe1a5);
      for(let i=0;i<8;i++){g.fillRect((i*61+37)%360,232+(i%4)*7,7,3);}

      const art=enemySprites[enemyName]??enemySprites.TASK;
      this.enemy=createPixelCharacter(this,art,410,201);
      if(!initial.reducedMotion){
        this.tweens.add({targets:this.enemy.container,y:197,duration:600,yoyo:true,repeat:-1,ease:'Stepped'});
      }
      this.trainer=createPixelCharacter(this,trainerSprite,-66,281);
      this.hero=createPixelCharacter(this,modelSprites.astra,89,283);
      this.hero.container.setVisible(false);

      const exclaim=this.add.graphics();
      exclaim.fillStyle(0xffd54d);
      exclaim.fillRect(287,91,8,17);exclaim.fillRect(289,112,7,7);
      exclaim.fillRect(305,100,8,17);exclaim.fillRect(307,121,7,7);
      exclaim.fillRect(321,113,8,17);
      exclaim.setAlpha(0);
      this.tweens.add({targets:exclaim,alpha:1,duration:100,delay:560,yoyo:true,hold:200,repeat:1,onComplete:()=>exclaim.destroy()});

      this.game.events.on(PRESENTATION_EVENT,this.present,this);
      this.events.once('shutdown',()=>this.game.events.off(PRESENTATION_EVENT,this.present,this));
      this.present(initial);
      this.game.canvas.setAttribute('aria-label','Retro pixel-art wild encounter: '+enemyName);
    }

    private flash(color=0xffffff,alpha=0.45):void{
      const rect=this.add.rectangle(180,165,360,330,color,alpha).setDepth(20);
      this.tweens.add({targets:rect,alpha:0,duration:120,onComplete:()=>rect.destroy()});
    }

    private sparks(x:number,y:number,color:number,count=12):void{
      for(let i=0;i<count;i++){
        const angle=i*2*Math.PI/count;
        const length=24+(i%3)*11;
        const part=this.add.rectangle(x,y,i%3?5:8,i%3?5:8,i%2?color:0xffffff).setDepth(15);
        this.tweens.add({
          targets:part,
          x:x+Math.round(Math.cos(angle)*length/4)*4,
          y:y+Math.round(Math.sin(angle)*length/4)*4,
          alpha:0,duration:330+(i%3)*45,ease:'Linear',
          onComplete:()=>part.destroy(),
        });
      }
    }

    private throwCapsule(model:string,reduced:boolean):void{
      this.trainer.paint('attack');
      if(reduced){
        this.trainer.container.setVisible(false);
        return;
      }
      const capsule=this.add.graphics().setDepth(17);
      capsule.fillStyle(0x2c3347);capsule.fillRect(-9,-10,18,20);
      capsule.fillStyle(0xfbf6e0);capsule.fillRect(-6,-7,12,6);
      capsule.fillStyle(0x55d2c4);capsule.fillRect(-6,0,12,7);
      capsule.fillStyle(0xfad58e);capsule.fillRect(-2,-2,4,4);
      capsule.setPosition(111,224);
      const steps=[
        {x:123,y:198},{x:136,y:172},{x:151,y:153},
        {x:163,y:150},{x:170,y:159},{x:173,y:179},
      ];
      let index=0;
      const advance=()=>{
        if(index>=steps.length){
          this.sparks(173,178,MODEL_FX[model]??0xa4fae0);
          this.flash(0xfbf8e0,0.65);
          capsule.destroy();return;
        }
        capsule.setPosition(steps[index].x,steps[index].y);
        capsule.rotation=index*0.5;
        index++;
        this.time.delayedCall(67,advance);
      };
      advance();
      this.tweens.add({targets:this.trainer.container,x:-75,duration:520,ease:'Linear'});
    }

    private summon(model:string,reduced:boolean):void{
      this.trainer.container.setVisible(false);
      this.hero.container.setVisible(true);
      const id=(model in modelSprites?model:'astra') as ModelId;
      if(this.heroModel!==id){
        this.hero.container.removeAll(true);
        const newHero=createPixelCharacter(this,modelSprites[id],89,283);
        this.hero.container.destroy();
        this.hero=newHero;
        this.heroModel=id;
      }
      this.hero.paint('charge');
      this.hero.container.setVisible(true);
      this.hero.container.setPosition(89,283);
      if(!reduced){
        this.hero.container.setScale(0.05).setAlpha(0);
        this.sparks(89,242,MODEL_FX[model]??0x87f8dc,16);
        this.tweens.add({
          targets:this.hero.container,scaleX:1,scaleY:1,alpha:1,duration:440,ease:'Linear',
          onComplete:()=>{this.hero.paint('idle');this.beginIdle(reduced);},
        });
      }else{
        this.hero.container.setScale(1).setAlpha(1);
        this.hero.paint('idle');
      }
    }

    private beginIdle(reduced:boolean):void{
      if(this.heroIdle||reduced)return;
      this.heroIdle=true;
      this.tweens.add({targets:this.hero.container,y:278,duration:430,yoyo:true,repeat:-1,ease:'Stepped',onUpdate:()=>{
        this.hero.container.y=Math.round(this.hero.container.y/2)*2;
      }});
    }

    private attack(type:string,model:string,reduced:boolean):void{
      this.hero.paint('attack');
      const color=COLORS[type]??0x8af5dc;
      if(reduced){
        this.hero.paint('idle');
        return;
      }
      const offset=model==='grok'?26:model==='fable'?18:15;
      // Each move family has its own readable pixel signature.
      if(type==='verification'){
        for(let i=0;i<4;i++){
          const ring=this.add.rectangle(260,161,38+i*11,38+i*11,0x7ad8ae,0).setStrokeStyle(3,0x7ad8ae).setDepth(14);
          this.tweens.add({targets:ring,scaleX:1.45,scaleY:1.45,alpha:0,duration:260+i*55,delay:i*35,onComplete:()=>ring.destroy()});
        }
      }else if(type==='reasoning'){
        for(let i=0;i<6;i++){
          const ray=this.add.rectangle(260,160,6,38,0xfce176).setDepth(14).setRotation(i*Math.PI/3);
          this.tweens.add({targets:ray,alpha:0,scaleY:1.8,duration:340,onComplete:()=>ray.destroy()});
        }
      }else if(type==='research'){
        for(let i=0;i<5;i++){
          const card=this.add.rectangle(145+i*5,220-i*9,17,23,0x94dff7).setStrokeStyle(2,0xffffff).setDepth(14);
          this.tweens.add({targets:card,x:245+i*5,y:153+i*7,angle:i%2?20:-20,alpha:0,duration:350+i*35,onComplete:()=>card.destroy()});
        }
      }
      this.tweens.add({
        targets:this.hero.container,x:89+offset,duration:100,yoyo:true,repeat:1,
        onComplete:()=>this.hero.paint('idle'),
      });
      const count=model==='grok'?12:model==='fable'?8:10;
      for(let i=0;i<count;i++){
        const p=this.add.rectangle(143+(i%3)*3,225+(i%5)*5,model==='grok'?4:6,6,i%3===0?0xffffff:color).setDepth(12);
        const wave=model==='fable'?(i%4)*8-13:model==='grok'?(i%5)*12-24:Math.sin(i)*22;
        this.tweens.add({
          targets:p,x:246+(i%3)*5,y:164+wave,alpha:0.8,
          duration:180+(i%3)*65,ease:'Linear',
          onComplete:()=>p.destroy(),
        });
      }
      this.time.delayedCall(320,()=>{
        this.sparks(265,162,color,8);
        this.tweens.add({targets:this.enemy.container,x:252,duration:55,yoyo:true,repeat:3});
        this.tweens.add({targets:this.enemy.container,alpha:0.35,duration:65,yoyo:true,repeat:2});
        this.flash(color,0.18);
      });
    }

    private present(p:Presentation):void{
      const changed=p.phase!==this.lastPhase;
      if(changed){
        this.lastPhase=p.phase;
        switch(p.phase){
          case 'encounter':
            this.trainer.container.setVisible(true);
            this.hero.container.setVisible(false);
            this.enemy.container.setVisible(true).setAlpha(1).setScale(1);
            this.enemy.container.setPosition(p.reducedMotion?262:414,201);
            this.trainer.container.setPosition(p.reducedMotion?88:-70,281);
            if(!p.reducedMotion){
              this.flash(0xffffff,0.28);
              this.tweens.add({targets:this.enemy.container,x:262,duration:520,ease:'Linear'});
              this.tweens.add({targets:this.trainer.container,x:88,duration:400,delay:240,ease:'Linear'});
            }
            break;
          case 'throw':
            if(p.model)this.throwCapsule(p.model,p.reducedMotion);
            break;
          case 'summon':
            if(p.model)this.summon(p.model,p.reducedMotion);
            break;
          case 'result':
            if(p.outcome==='won'){
              if(!p.reducedMotion)this.sparks(260,155,0xffda72,18);
              if(p.reducedMotion){this.enemy.container.setVisible(false);}
              else this.tweens.add({targets:this.enemy.container,scaleY:0,alpha:0,duration:350,ease:'Linear',onComplete:()=>this.enemy.container.setVisible(false)});
              this.hero.paint('victory');
              if(!p.reducedMotion)this.tweens.add({targets:this.hero.container,y:262,duration:180,yoyo:true,repeat:2});
            }else if(p.outcome==='lost'){
              this.hero.paint('hurt');
            }
            break;
          default: break;
        }
      }
      if (p.bossSequence!==this.lastBossSequence) {
        this.lastBossSequence=p.bossSequence;
        if (p.bossSequence>0 && !p.reducedMotion) {
          this.flash(0xffc977,0.26);
          this.sparks(255,158,0xe3aeea,15);
          this.tweens.add({targets:this.enemy.container,scaleX:1.16,scaleY:1.16,duration:190,yoyo:true,repeat:2,ease:'Stepped'});
        }
      }
      if(p.phase==='attack'&&p.attackSequence!==this.lastAttackSequence){
        this.lastAttackSequence=p.attackSequence;
        this.attack(p.attackType,p.model??'astra',p.reducedMotion);
      }
    }
  };
}

export function BattleStage({
  enemy='TASK',model=null,phase='encounter',
  attackSequence=0,bossSequence=0,attackType='',outcome='active',reducedMotion=false,
}:BattleStageProps){
  const node=useRef<HTMLDivElement|null>(null);
  const game=useRef<Phaser.Game|null>(null);
  const presentation:Presentation={model,phase,attackSequence,bossSequence,attackType,outcome,reducedMotion};
  const current=useRef(presentation);
  current.current=presentation;

  useEffect(()=>{
    if(!node.current)return;
    const instance=new Phaser.Game({
      type:Phaser.CANVAS,parent:node.current,
      width:360,height:330,backgroundColor:'#ffefdc',pixelArt:true,
      scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:360,height:330},
      scene:[createScene(enemy,current.current)],
    });
    game.current=instance;
    return ()=>{instance.destroy(true);if(game.current===instance)game.current=null;};
  },[enemy]);

  useEffect(()=>{game.current?.events.emit(PRESENTATION_EVENT,presentation);},[
    phase,model,attackSequence,bossSequence,attackType,outcome,reducedMotion,
  ]);
  return <div ref={node} className="battle-stage pixel-canvas" data-testid="phaser-stage"
    data-phase={phase} data-model={model??'trainer'}
    role="img" aria-label={'Pixel-art battle arena: wild '+enemy+', trainer and AI companion'}/>;
}
