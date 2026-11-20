import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';

interface StageProps { active?: boolean; enemy?: string; model?: string; effect?: string; reducedMotion?: boolean; }

function createScene(enemy: string, model: string): typeof Phaser.Scene {
  return class BattleScene extends Phaser.Scene {
    constructor() { super('battle'); }
    create() {
      const g = this.add.graphics();
      // Original geometric pixel-inspired scene; no franchise imagery.
      g.fillGradientStyle(0x25284f, 0x25284f, 0x6d4c78, 0x6d4c78, 1);
      g.fillRect(0, 0, 360, 480);
      g.fillStyle(0xe7ac80, 1);
      g.fillRect(0, 310, 360, 170);
      g.fillStyle(0xf4c996, 1);
      g.fillEllipse(266, 218, 168, 32);
      g.fillEllipse(95, 383, 174, 33);
      g.fillStyle(0x5c3a6e, 0.18);
      for (let i = 0; i < 25; i++) g.fillRect((i * 77 + 23) % 360, (i * 31 + 71) % 275, 4, 4);
      g.fillStyle(0xe2a155, 1);
      g.fillEllipse(265, 222, 125, 20);
      g.fillEllipse(92, 388, 136, 20);
      const enemyArt = this.add.container(266, 160);
      const task = this.add.graphics();
      if (enemy === 'BUG') {
        task.fillStyle(0x28273d); task.fillEllipse(0,0,91,86);
        task.fillStyle(0xdc7e9a); task.fillEllipse(0,0,80,76);
        task.fillStyle(0x4c2d59); task.fillRect(-27,-12,13,17);task.fillRect(14,-12,13,17);
        task.lineStyle(5,0x332844);task.lineBetween(-35,-39,-49,-57);task.lineBetween(35,-39,49,-57);
        task.lineBetween(-35,9,-57,23);task.lineBetween(35,9,57,23);
      } else if (enemy === 'RESEARCH REQUEST') {
        task.fillStyle(0x332b4c); task.fillRoundedRect(-43,-58,86,101,10);
        task.fillStyle(0xf5e0b6); task.fillRoundedRect(-38,-53,76,90,7);
        task.fillStyle(0xffb97c); task.fillRect(-28,-33,56,9);
        task.fillStyle(0x524b64);task.fillRect(-25,-8,20,6);task.fillRect(8,-8,20,6);
        task.fillStyle(0x524b64);task.fillRect(-7,18,14,7);
      } else if (enemy === 'MATH PROBLEM') {
        task.fillStyle(0x322842);task.fillTriangle(0,-69,-56,37,56,37);
        task.fillStyle(0xbda7ff);task.fillTriangle(0,-57,-45,31,45,31);
        task.fillStyle(0x332842);task.fillCircle(-12,3,5);task.fillCircle(14,3,5);
        task.fillRect(-16,21,32,5);
      } else if (enemy === 'HALLUCINATION') {
        task.fillStyle(0x2c2a4a);task.fillEllipse(0,-4,102,105);
        task.fillStyle(0xd9d5ff);task.fillEllipse(0,-7,91,95);
        task.fillStyle(0x70678c);task.fillCircle(-17,-14,6);task.fillCircle(17,-14,6);
        task.fillStyle(0xec8eaa);task.fillRect(-10,9,20,6);
        task.fillStyle(0xbfa9f1);task.fillCircle(38,-55,15);task.fillCircle(52,-70,7);
      } else {
        task.fillStyle(0x2d294b, 1); task.fillRoundedRect(-39, -59, 78, 103, 9);
        task.fillStyle(0xfff7dd, 1); task.fillRoundedRect(-34, -64, 68, 96, 7);
        task.fillStyle(0x666082, 1);
        for (let i = 0; i < 3; i++) {task.fillRect(-23, -39 + i * 24, 11, 11);task.fillRect(-4, -35 + i * 24, 27, 4);}
        task.fillStyle(0x2d294b); task.fillCircle(-17, 17, 4); task.fillCircle(17, 17, 4);
      }
      enemyArt.add(task);
      const hero = this.add.container(95, 324);
      const h = this.add.graphics();
      if (model === 'grok') {
        // Original angular signal-bot sprite; not an official vendor mascot.
        h.fillStyle(0x27253f); h.fillRoundedRect(-42,-49,84,85,13);
        h.fillStyle(0xaf9cf4); h.fillRoundedRect(-35,-45,70,73,12);
        h.fillStyle(0x27253f); h.fillRect(-27,-68,12,25); h.fillRect(14,-68,12,25);
        h.fillStyle(0x9df3d9); h.fillRect(-28,-18,56,21);
        h.fillStyle(0x27253f); h.fillRect(-17,-14,10,9); h.fillRect(10,-14,10,9);
        h.fillStyle(0xffd18a); h.fillRect(-9,14,18,5);
      } else if (model === 'fable') {
        // Original warm-orange library sprite with round ears.
        h.fillStyle(0x4b3248); h.fillEllipse(-29,-42,30,50); h.fillEllipse(30,-42,30,50);
        h.fillStyle(0xf4ae82); h.fillEllipse(-29,-42,20,37); h.fillEllipse(30,-42,20,37);
        h.fillStyle(0x42354b); h.fillRoundedRect(-44,-47,88,83,23);
        h.fillStyle(0xf5b183); h.fillRoundedRect(-39,-46,78,76,22);
        h.fillStyle(0xffe5bd); h.fillEllipse(0,-14,60,44);
        h.fillStyle(0x37304a); h.fillRect(-18,-23,8,10); h.fillRect(11,-23,8,10);
        h.fillStyle(0xd57c86); h.fillCircle(-23,-9,6); h.fillCircle(23,-9,6);
        h.lineStyle(3,0x42354b); h.lineBetween(-6,-7,0,-3); h.lineBetween(0,-3,7,-7);
      } else {
        // Original mint reasoning sprite with a geometric mind spark.
        h.fillStyle(0x32294f); h.fillRoundedRect(-43,-44,86,74,22);
        h.fillStyle(0x78e0d1); h.fillRoundedRect(-37,-49,74,69,20);
        h.fillStyle(0xfaf4de); h.fillRoundedRect(-28,-42,57,46,14);
        h.fillStyle(0x302d4d); h.fillRect(-16,-22,7,9); h.fillRect(11,-22,7,9);
        h.fillStyle(0xe88ca0); h.fillCircle(-21,-8,5); h.fillCircle(23,-8,5);
        h.lineStyle(3,0x3e3759); h.strokeCircle(1,-9,7);
        h.fillStyle(0xfce49e); h.fillRect(-4,-60,8,8);
      }
      hero.add(h);
      // Character variants will use separate drawn sprites in Phase 2.
      if (!this.game.registry.get('reducedMotion')) {
        this.tweens.add({ targets: enemyArt, y: 154, duration: 850, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: hero, y: 319, duration: 1050, yoyo: true, repeat: -1 });
      }
      this.game.registry.set('sceneReady', true);
      this.game.canvas.setAttribute('aria-label', 'Pixel art arena with a friendly AI creature facing ' + enemy);
    }
  };
}

export function BattleStage({ enemy = 'TASK', model = 'astra', effect = '', reducedMotion = false }: StageProps) {
  const node = useRef<HTMLDivElement | null>(null);
  const game = useRef<Phaser.Game | null>(null);
  useEffect(() => {
    if (!node.current) return;
    const instance = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: node.current,
      width: 360,
      height: 480,
      backgroundColor: '#25284f',
      pixelArt: true,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 360, height: 480 },
      scene: [createScene(enemy, model)],
    });
    instance.registry.set('reducedMotion', reducedMotion);
    game.current = instance;
    return () => { instance.destroy(true); if (game.current === instance) game.current = null; };
  }, [enemy, model, reducedMotion]);
  return <div className={'battle-stage ' + (effect ? 'stage-hit' : '')} ref={node} data-testid="phaser-stage" aria-label="Pokaimon battle battlefield" />;
}