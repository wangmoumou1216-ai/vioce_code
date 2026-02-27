import random

numbers = [random.randint(1, 100) for _ in range(20)]
print("Original:", numbers)
print("Sorted:  ", sorted(numbers))
print("Max:", max(numbers), "Min:", min(numbers))
