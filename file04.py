class Stack:
    def __init__(self):
        self._data = []

    def push(self, item):
        self._data.append(item)

    def pop(self):
        return self._data.pop()

    def peek(self):
        return self._data[-1]

    def is_empty(self):
        return len(self._data) == 0

s = Stack()
for i in range(5):
    s.push(i)
while not s.is_empty():
    print(s.pop())
