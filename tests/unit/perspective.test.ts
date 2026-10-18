import { expect, it } from "vitest";
import {
  FULL_PAGE_CORNERS,
  perspectivePoint,
  validateCorners,
  type PageCorners,
} from "../../lib/files/perspective";
it("maps a rectangular page without distortion", () => {
  expect(perspectivePoint(FULL_PAGE_CORNERS, 0.25, 0.75)).toEqual({
    x: 25,
    y: 75,
  });
});
it("maps all four output corners to the selected perspective corners", () => {
  const points: PageCorners = [
    { x: 10, y: 5 },
    { x: 90, y: 20 },
    { x: 80, y: 95 },
    { x: 15, y: 85 },
  ];
  expect(() => validateCorners(points)).not.toThrow();
  for (const [index, [u, v]] of [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ].entries()) {
    const point = perspectivePoint(points, u, v);
    expect(point.x).toBeCloseTo(points[index].x);
    expect(point.y).toBeCloseTo(points[index].y);
  }
});
it("rejects crossing, collinear and out-of-image page corners", () => {
  expect(() =>
    validateCorners([
      FULL_PAGE_CORNERS[0],
      FULL_PAGE_CORNERS[2],
      FULL_PAGE_CORNERS[1],
      FULL_PAGE_CORNERS[3],
    ]),
  ).toThrow();
  expect(() =>
    validateCorners([
      { x: -1, y: 0 },
      ...FULL_PAGE_CORNERS.slice(1),
    ] as unknown as PageCorners),
  ).toThrow();
});
