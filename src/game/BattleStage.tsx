import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';

interface StageProps { active?: boolean; enemy?: string; model?: string; effect?: string; reducedMotion?: boolean; }

function createScene(enemy: string): typeof Phaser.Scene {
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
      task.fillStyle(0x2d294b, 1); task.fillRoundedRect(-39, -59, 78, 103, 9);
      task.fillStyle(0xfff7dd, 1); task.fillRoundedRect(-34, -64, 68, 96, 7);
      task.fillStyle(0x666082, 1);
      for (let i = 0; i < 3; i++) {
        task.fillRect(-23, -39 + i * 24, 11, 11);
        task.fillRect(-4, -35 + i * 24, 27, 4);
      }
      task.fillStyle(0x2d294b); task.fillCircle(-17, 17, 4); task.fillCircle(17, 17, 4);
      enemyArt.add(task);
      const hero = this.add.container(95, 324);
      const h = this.add.graphics();
      h.fillStyle(0x32294f); h.fillRoundedRect(-43, -44, 86, 74, 22);
      h.fillStyle(0x78e0d1); h.fillRoundedRect(-37, -49, 74, 69, 20);
      h.fillStyle(0xfaf4de); h.fillRoundedRect(-28, -42, 57, 46, 14);
      h.fillStyle(0x302d4d); h.fillRect(-16, -22, 7, 9); h.fillRect(11, -22, 7, 9);
      h.fillStyle(0xe88ca0); h.fillCircle(-21, -8, 5); h.fillCircle(23, -8, 5);
      h.lineStyle(3, 0x3e3759); h.strokeCircle(1, -9, 7);
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
      scene: [createScene(enemy)],
    });
    instance.registry.set('reducedMotion', reducedMotion);
    game.current = instance;
    return () => { instance.destroy(true); if (game.current === instance) game.current = null; };
  }, [enemy, model, reducedMotion]);
  return <div className={'battle-stage ' + (effect ? 'stage-hit' : '')} ref={node} data-testid="phaser-stage" aria-label="Pokaimon battle battlefield" />;
}