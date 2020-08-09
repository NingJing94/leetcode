import { plus, minus } from '..';

describe('Demo', () => {
  test('plus', () => {
    expect(plus(1, 2)).toBe(3);
  });

  test('minus', () => {
    expect(minus(2, 1)).toBe(1);
  });
});
