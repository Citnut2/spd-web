import { describe, it, expect, beforeEach } from 'vitest';
import { Actor } from '../Actor';
import { Char, Alignment } from '../Char';
import { Buff, BuffType } from './Buff';
import { FlavourBuff } from './FlavourBuff';
import { CounterBuff } from './CounterBuff';
import { ShieldBuff } from './ShieldBuff';
import { AllyBuff } from './AllyBuff';

class TestBuff extends Buff {
  type = BuffType.NEUTRAL;
}

class TestFlavourBuff extends FlavourBuff {
  type = BuffType.POSITIVE;
}

class TestCounterBuff extends CounterBuff {
  type = BuffType.NEUTRAL;
}

class TestShieldBuff extends ShieldBuff {
  type = BuffType.POSITIVE;
}

class TestAllyBuff extends AllyBuff {
  type = BuffType.POSITIVE;
}

class TestChar extends Char {
  act(): boolean { return false; }
}

function prepareTarget(): TestChar {
  const t = new TestChar();
  t.alignment = Alignment.ENEMY;
  return t;
}

describe('Buff', () => {
  let target: TestChar;

  beforeEach(() => {
    Actor.resetNextID();
    target = prepareTarget();
  });

  it('attaches to a character', () => {
    const buff = Buff.append(target, TestBuff);
    expect(buff.target).toBe(target);
    expect(target.buffs).toContain(buff);
  });

  it('detaches from a character', () => {
    const buff = Buff.append(target, TestBuff);
    buff.detach();
    expect(target.buffs).not.toContain(buff);
  });

  it('affect returns existing buff if already attached', () => {
    Buff.append(target, TestBuff);
    const buff2 = Buff.affect(target, TestBuff);
    expect(target.buffs.length).toBe(1);
    expect(target.buffs[0]).toBe(buff2);
  });

  it('append creates a new buff even if one exists', () => {
    Buff.append(target, TestBuff);
    Buff.append(target, TestBuff);
    expect(target.buffs.length).toBe(2);
  });

  it('detachBuff removes all buffs of a class', () => {
    Buff.append(target, TestBuff);
    Buff.append(target, TestBuff);
    Buff.detachBuff(target, TestBuff);
    expect(target.findAllBuffs(TestBuff).length).toBe(0);
  });

  it('act delegates to diactivate', () => {
    const buff = Buff.append(target, TestBuff);
    buff.act();
    expect(buff.time).toBe(Number.MAX_VALUE);
  });
});

describe('FlavourBuff', () => {
  let target: TestChar;

  beforeEach(() => {
    Actor.resetNextID();
    target = prepareTarget();
  });

  it('detaches on act', () => {
    const buff = Buff.append(target, TestFlavourBuff);
    buff.act();
    expect(target.buffs).not.toContain(buff);
  });

  it('iconTextDisplay shows cooldown', () => {
    const buff = Buff.append(target, TestFlavourBuff);
    buff.spend(5);
    expect(buff.iconTextDisplay()).toBeTruthy();
  });
});

describe('CounterBuff', () => {
  let target: TestChar;

  beforeEach(() => {
    Actor.resetNextID();
    target = prepareTarget();
  });

  it('tracks count', () => {
    const buff = Buff.count(target, TestCounterBuff, 5);
    expect(buff.count()).toBe(5);
    buff.countUp(3);
    expect(buff.count()).toBe(8);
    buff.countDown(2);
    expect(buff.count()).toBe(6);
  });

  it('affect returns same counter buff', () => {
    Buff.count(target, TestCounterBuff, 5);
    const buff2 = Buff.count(target, TestCounterBuff, 3);
    expect(buff2.count()).toBe(8);
  });
});

describe('ShieldBuff', () => {
  let target: TestChar;

  beforeEach(() => {
    Actor.resetNextID();
    target = prepareTarget();
  });

  it('absorbs damage', () => {
    const buff = Buff.append(target, TestShieldBuff);
    buff.setShield(10);
    const remaining = buff.absorbDamage(7);
    expect(remaining).toBe(0);
    expect(buff.shielding()).toBe(3);
  });

  it('returns leftover damage if shield depleted', () => {
    const buff = Buff.append(target, TestShieldBuff);
    buff.setShield(5);
    const remaining = buff.absorbDamage(8);
    expect(remaining).toBe(3);
    expect(buff.shielding()).toBe(0);
  });

  it('processDamage uses shield priority order', () => {
    const buff = Buff.append(target, TestShieldBuff);
    buff.setShield(3);
    const remaining = ShieldBuff.processDamage(target, 10);
    expect(remaining).toBe(7);
  });
});

describe('AllyBuff', () => {
  let target: TestChar;

  beforeEach(() => {
    Actor.resetNextID();
    target = prepareTarget();
    target.alignment = Alignment.ENEMY;
  });

  it('changes alignment to ALLY on attach', () => {
    Buff.append(target, TestAllyBuff);
    expect(target.alignment).toBe(Alignment.ALLY);
  });
});
