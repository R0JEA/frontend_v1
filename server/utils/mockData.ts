// Mock dataset — several Python functions paired with realistic pytest/unittest output.
// Used in development when NUXT_BACKEND_URL is unset or set to "mock".

interface MockEntry {
  label: string
  pytest: string
  unittest: string
}

const ENTRIES: MockEntry[] = [
  // ── 1. Simple arithmetic ─────────────────────────────────────────────────
//   {
//     label: 'add / subtract',
//     pytest: `import pytest
// from solution import add, subtract


// def test_add_positive_numbers():
//     assert add(2, 3) == 5


// def test_add_negative_numbers():
//     assert add(-1, -4) == -5


// def test_add_zero():
//     assert add(0, 0) == 0


// def test_add_mixed_sign():
//     assert add(-3, 7) == 4


// def test_subtract_basic():
//     assert subtract(10, 4) == 6


// def test_subtract_negative_result():
//     assert subtract(3, 8) == -5


// def test_subtract_same_values():
//     assert subtract(5, 5) == 0


// @pytest.mark.parametrize("a, b, expected", [
//     (0, 0, 0),
//     (100, 1, 101),
//     (-50, 50, 0),
// ])
// def test_add_parametrized(a, b, expected):
//     assert add(a, b) == expected
// `,
//     unittest: `import unittest
// from solution import add, subtract


// class TestAdd(unittest.TestCase):

//     def test_positive_numbers(self):
//         self.assertEqual(add(2, 3), 5)

//     def test_negative_numbers(self):
//         self.assertEqual(add(-1, -4), -5)

//     def test_zero(self):
//         self.assertEqual(add(0, 0), 0)

//     def test_mixed_sign(self):
//         self.assertEqual(add(-3, 7), 4)


// class TestSubtract(unittest.TestCase):

//     def test_basic(self):
//         self.assertEqual(subtract(10, 4), 6)

//     def test_negative_result(self):
//         self.assertEqual(subtract(3, 8), -5)

//     def test_same_values(self):
//         self.assertEqual(subtract(5, 5), 0)


// if __name__ == '__main__':
//     unittest.main()
// `,
//   },

//   // ── 2. String utilities ───────────────────────────────────────────────────
//   {
//     label: 'string utilities',
//     pytest: `import pytest
// from solution import reverse_string, is_palindrome


// def test_reverse_regular_string():
//     assert reverse_string("hello") == "olleh"


// def test_reverse_single_char():
//     assert reverse_string("a") == "a"


// def test_reverse_empty_string():
//     assert reverse_string("") == ""


// def test_reverse_palindrome_unchanged():
//     assert reverse_string("racecar") == "racecar"


// def test_palindrome_true():
//     assert is_palindrome("racecar") is True


// def test_palindrome_false():
//     assert is_palindrome("hello") is False


// def test_palindrome_single_char():
//     assert is_palindrome("x") is True


// def test_palindrome_empty():
//     assert is_palindrome("") is True


// @pytest.mark.parametrize("word", ["level", "madam", "refer", "civic"])
// def test_palindrome_known_words(word):
//     assert is_palindrome(word) is True
// `,
//     unittest: `import unittest
// from solution import reverse_string, is_palindrome


// class TestReverseString(unittest.TestCase):

//     def test_regular_string(self):
//         self.assertEqual(reverse_string("hello"), "olleh")

//     def test_single_char(self):
//         self.assertEqual(reverse_string("a"), "a")

//     def test_empty_string(self):
//         self.assertEqual(reverse_string(""), "")

//     def test_palindrome_unchanged(self):
//         self.assertEqual(reverse_string("racecar"), "racecar")


// class TestIsPalindrome(unittest.TestCase):

//     def test_palindrome_true(self):
//         self.assertTrue(is_palindrome("racecar"))

//     def test_palindrome_false(self):
//         self.assertFalse(is_palindrome("hello"))

//     def test_single_char(self):
//         self.assertTrue(is_palindrome("x"))

//     def test_empty_string(self):
//         self.assertTrue(is_palindrome(""))

//     def test_known_palindromes(self):
//         for word in ["level", "madam", "refer", "civic"]:
//             with self.subTest(word=word):
//                 self.assertTrue(is_palindrome(word))


// if __name__ == '__main__':
//     unittest.main()
// `,
//   },


// def safe_divide(numerator, denominator):
//     """
//     Safely divide two numbers, returning a float result.

//     Raises:
//         ValueError: If denominator is zero.
//     """
//     if denominator == 0:
//         raise ValueError("Cannot divide by zero")
//     return numerator / denominator

  // ── 3. Safe division with error handling ─────────────────────────────────
  {
    label: 'safe_divide',
    pytest: `import pytest
from solution import safe_divide


def test_divide_positive_numbers():
    assert safe_divide(10, 2) == 5.0


def test_divide_returns_float():
    result = safe_divide(7, 2)
    assert isinstance(result, float)
    assert result == pytest.approx(3.5)


def test_divide_by_one():
    assert safe_divide(42, 1) == 42.0


def test_divide_negative_numerator():
    assert safe_divide(-6, 2) == -3.0


def test_divide_negative_denominator():
    assert safe_divide(6, -2) == -3.0


def test_divide_both_negative():
    assert safe_divide(-6, -2) == 3.0


def test_divide_by_zero_raises():
    with pytest.raises(ValueError, match="Cannot divide by zero"):
        safe_divide(10, 0)


def test_divide_zero_numerator():
    assert safe_divide(0, 5) == 0.0
`,
    unittest: `import unittest
from solution import safe_divide


class TestSafeDivide(unittest.TestCase):

    def test_positive_numbers(self):
        self.assertEqual(safe_divide(10, 2), 5.0)

    def test_returns_float(self):
        result = safe_divide(7, 2)
        self.assertIsInstance(result, float)
        self.assertAlmostEqual(result, 3.5)

    def test_divide_by_one(self):
        self.assertEqual(safe_divide(42, 1), 42.0)

    def test_negative_numerator(self):
        self.assertEqual(safe_divide(-6, 2), -3.0)

    def test_negative_denominator(self):
        self.assertEqual(safe_divide(6, -2), -3.0)

    def test_both_negative(self):
        self.assertEqual(safe_divide(-6, -2), 3.0)

    def test_zero_numerator(self):
        self.assertEqual(safe_divide(0, 5), 0.0)

    def test_divide_by_zero_raises_value_error(self):
        with self.assertRaises(ValueError) as ctx:
            safe_divide(10, 0)
        self.assertIn("zero", str(ctx.exception).lower())


if __name__ == '__main__':
    unittest.main()
`,
  }

//   // ── 4. FizzBuzz ───────────────────────────────────────────────────────────
//   {
//     label: 'fizzbuzz',
//     pytest: `import pytest
// from solution import fizzbuzz


// def test_multiple_of_3_returns_fizz():
//     assert fizzbuzz(3) == "Fizz"
//     assert fizzbuzz(9) == "Fizz"


// def test_multiple_of_5_returns_buzz():
//     assert fizzbuzz(5) == "Buzz"
//     assert fizzbuzz(25) == "Buzz"


// def test_multiple_of_15_returns_fizzbuzz():
//     assert fizzbuzz(15) == "FizzBuzz"
//     assert fizzbuzz(30) == "FizzBuzz"


// def test_non_multiple_returns_string_number():
//     assert fizzbuzz(1) == "1"
//     assert fizzbuzz(7) == "7"
//     assert fizzbuzz(11) == "11"


// @pytest.mark.parametrize("n, expected", [
//     (1, "1"),
//     (2, "2"),
//     (3, "Fizz"),
//     (4, "4"),
//     (5, "Buzz"),
//     (6, "Fizz"),
//     (10, "Buzz"),
//     (15, "FizzBuzz"),
//     (30, "FizzBuzz"),
//     (45, "FizzBuzz"),
// ])
// def test_fizzbuzz_sequence(n, expected):
//     assert fizzbuzz(n) == expected
// `,
//     unittest: `import unittest
// from solution import fizzbuzz


// class TestFizzBuzz(unittest.TestCase):

//     def test_multiple_of_3(self):
//         self.assertEqual(fizzbuzz(3), "Fizz")
//         self.assertEqual(fizzbuzz(9), "Fizz")

//     def test_multiple_of_5(self):
//         self.assertEqual(fizzbuzz(5), "Buzz")
//         self.assertEqual(fizzbuzz(25), "Buzz")

//     def test_multiple_of_15(self):
//         self.assertEqual(fizzbuzz(15), "FizzBuzz")
//         self.assertEqual(fizzbuzz(30), "FizzBuzz")

//     def test_non_multiple_returns_string(self):
//         self.assertEqual(fizzbuzz(1), "1")
//         self.assertEqual(fizzbuzz(7), "7")
//         self.assertEqual(fizzbuzz(11), "11")

//     def test_sequence(self):
//         cases = [
//             (1, "1"), (2, "2"), (3, "Fizz"),
//             (5, "Buzz"), (15, "FizzBuzz"), (45, "FizzBuzz"),
//         ]
//         for n, expected in cases:
//             with self.subTest(n=n):
//                 self.assertEqual(fizzbuzz(n), expected)


// if __name__ == '__main__':
//     unittest.main()
// `,
//   },

//   // ── 5. List utilities ─────────────────────────────────────────────────────
//   {
//     label: 'list utilities',
//     pytest: `import pytest
// from solution import flatten, unique_sorted


// def test_flatten_nested_list():
//     assert flatten([[1, 2], [3, 4]]) == [1, 2, 3, 4]


// def test_flatten_empty_sublists():
//     assert flatten([[], []]) == []


// def test_flatten_single_sublist():
//     assert flatten([[1, 2, 3]]) == [1, 2, 3]


// def test_flatten_empty_outer():
//     assert flatten([]) == []


// def test_flatten_mixed_types():
//     assert flatten([["a", "b"], ["c"]]) == ["a", "b", "c"]


// def test_unique_sorted_removes_duplicates():
//     assert unique_sorted([3, 1, 2, 1, 3]) == [1, 2, 3]


// def test_unique_sorted_already_unique():
//     assert unique_sorted([1, 2, 3]) == [1, 2, 3]


// def test_unique_sorted_empty():
//     assert unique_sorted([]) == []


// def test_unique_sorted_single_element():
//     assert unique_sorted([42]) == [42]
// `,
//     unittest: `import unittest
// from solution import flatten, unique_sorted


// class TestFlatten(unittest.TestCase):

//     def test_nested_list(self):
//         self.assertEqual(flatten([[1, 2], [3, 4]]), [1, 2, 3, 4])

//     def test_empty_sublists(self):
//         self.assertEqual(flatten([[], []]), [])

//     def test_single_sublist(self):
//         self.assertEqual(flatten([[1, 2, 3]]), [1, 2, 3])

//     def test_empty_outer_list(self):
//         self.assertEqual(flatten([]), [])

//     def test_mixed_types(self):
//         self.assertEqual(flatten([["a", "b"], ["c"]]), ["a", "b", "c"])


// class TestUniqueSorted(unittest.TestCase):

//     def test_removes_duplicates(self):
//         self.assertEqual(unique_sorted([3, 1, 2, 1, 3]), [1, 2, 3])

//     def test_already_unique(self):
//         self.assertEqual(unique_sorted([1, 2, 3]), [1, 2, 3])

//     def test_empty_list(self):
//         self.assertEqual(unique_sorted([]), [])

//     def test_single_element(self):
//         self.assertEqual(unique_sorted([42]), [42])


// if __name__ == '__main__':
//     unittest.main()
// `,
//   },
]

export function getRandomMockTests(format: 'pytest' | 'unittest'): string {
  const entry = ENTRIES[Math.floor(Math.random() * ENTRIES.length)]
  return entry[format]
}

export async function simulateLatency(ms = 2400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
