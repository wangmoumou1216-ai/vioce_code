import math

shapes = {
    "circle_r5": math.pi * 5**2,
    "square_s4": 4**2,
    "triangle_b6_h3": 0.5 * 6 * 3,
}

for shape, area in shapes.items():
    print(f"{shape}: area = {area:.2f}")
