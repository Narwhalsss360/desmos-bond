# desmos-bond

Chrome extension for Desmos calculator.

# Development Installation (Google Chrome)

1. Download this repository and extract. $\uparrow$ (Code) and select `Download ZIP`.
1. Go to `chrome://extensions/`.
3. Enable `Developer mode`.
4. Select `Load unpacked` and select the extracted folder (that has `manifest.json`).

# Features

_Text commands are entered in a **comment**, with its name and argument in parentheses followed be a semicolon. Ex:_
`latex(y=\frac{1}{x});`

## $\LaTeX$

Use the `latex` command with latex math-mode expression as the argument.
Alternatively, press the $+$ button and select latex.

You may also copy an expression as $\LaTeX$, select the `Edit List` option (gear icon), and every expression will have a clipboard icon, which would copy the expression as $\LaTeX$.

### Example

- The FilterPrimes function from https://www.desmos.com/calculator/zemcbstd6p is `F_{ilterPrimes}\left(n\right)=\left(p_{list}\left[p_{list}.y=1\right].x\right)\operatorname{with}p_{list}=\left(n,\ P_{rime}\left(n\right)\right)`.

## Import

Use the `import` command with the hash of the graph as the argument to import.

Alternative import methods:

1. Press the $+$ button and select import. Ex: `import(pwdcndnakz);`
2. Open your saved graphs, press the menu icon, $\vdots$, and select import.

### Managing Imported Expressions

_Since Desmos does not support nested folders, any folder that is imported will be in the global expressions list, and its name will be prepended with the name of the graph imported from. Any global expression from the graph being imported will be placed in a folder with the title of the graph being imported prepended with "Imports:"._

#### Updates

If an imported graph gets updated, you may reimport the graph, and _linked_ expressions will get updated.

#### Linked Expressions

If you don't want an expression to update from an import graph, you may unlink an expressions by selecting `Edit List` (gear icon) and selecting the unlock icon. _If you unlink a folder, the entire folder and its inner expressions will get unlinked._

### Sample Graphs of Imports

- https://www.desmos.com/calculator/3uvrydb8r7 imports https://www.desmos.com/calculator/pjiyws1lhb
- https://www.desmos.com/calculator/wyi4inphkq imports https://www.desmos.com/calculator/a26ee35e98

# 3D

Desmos 3D is currently not supported, though, it _shouldn't_ be too difficult.
