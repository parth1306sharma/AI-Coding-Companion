export const LANGUAGES = {
  cpp: {
    name: "C++",
    extension: "cpp",
    template: `#include <bits/stdc++.h>
using namespace std;

int main() {

    return 0;
}
`,
  },

  c: {
    name: "C",
    extension: "c",
    template: `#include <stdio.h>

int main() {

    return 0;
}
`,
  },

  java: {
    name: "Java",
    extension: "java",
    template: `public class Main {
    public static void main(String[] args) {

    }
}
`,
  },

  python: {
    name: "Python",
    extension: "py",
    template: `def solve():
    pass

solve()
`,
  },

  javascript: {
    name: "JavaScript",
    extension: "js",
    template: `function solve() {

}

solve();
`,
  },
};