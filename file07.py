def celsius_to_fahrenheit(c):
    return c * 9 / 5 + 32

def fahrenheit_to_celsius(f):
    return (f - 32) * 5 / 9

for temp in range(0, 110, 10):
    print(f"{temp}°C = {celsius_to_fahrenheit(temp):.1f}°F")
