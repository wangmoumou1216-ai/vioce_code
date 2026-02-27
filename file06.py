from collections import Counter

words = "the quick brown fox jumps over the lazy dog the fox".split()
counter = Counter(words)
print("Word counts:")
for word, count in counter.most_common():
    print(f"  {word}: {count}")
