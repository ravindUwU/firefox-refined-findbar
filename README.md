# Refined Find bar for Firefox

`userChrome.css` styles that refine the Firefox find bar by repositioning it, adjusting spacing,
re-styling internal elements.

> **Note** Tested on Firefox 100-108.

<br>

## Features

<table>
<thead>
<tr>
	<th>Variable</th>
	<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td valign="top"><code>$feature-floating</code></td>
<td valign="top">

If `false`, positions the find bar towards the top right-hand corner of the browser window, docked
to the toolbar.

![](./img/feature-floating-false.png)

If `true`, detaches the find bar from the toolbar, and positions it floating above the contents of
web page.

![](./img/feature-floating-true.png)

</td>
</tr>
<tr>
<td valign="top"><code>$feature-floating-alignment</code></td>
<td valign="top">

Vertically positions the floating find bar. Either `top` or `bottom`.

</td>
</tr>
<tr>
<td valign="top"><code>$feature-floating-distance</code></td>
<td valign="top">

Specifies the distance between the floating find bar and the respective window corner.

</td>
</tr>
<tr>
<td valign="top"><code>$feature-buttons</code></td>
<td valign="top">

If `false`, leaves the find bar options as checkboxes.

![](./img/feature-buttons-false.png)

If `true`, styles the find bar options to resemble buttons.

![](./img/feature-buttons-true.png)

</td>
</tr>
<tr>
<td valign="top"><code>$feature-buttons-grouped</code></td>
<td valign="top">

If `true`, groups find bar buttons together.

![](./img/feature-buttons-grouped.png)

</td>
</tr>
</tbody>
</table>

<br>

## Usage

This style is written in [SCSS](https://sass-lang.com/) and therefore must be transpiled to CSS
before being added to `userChrome.css`. There are several ways to go about this,

- **To use an online tool like [SassMeister](https://www.sassmeister.com/)**, copy the contents of
  [`refined-findbar.scss`](./src/refined-findbar.scss) to its SCSS pane, and override variables as
  necessary. The CSS transpilation will appear on the right-hand side; paste it in your
  `userChrome.css` file.

  ![](./img/sassmeister.png)

- **To transpile locally**, [`@use`](https://sass-lang.com/documentation/at-rules/use) or
  [`@import`](https://sass-lang.com/documentation/at-rules/import) the
  [`refined-findbar.scss`](./src/refined-findbar.scss) file after overriding its variables as
  necessary.

  ```scss
  // userChrome.scss

  // Override variables here, e.g.,
  // $feature-floating: true;

  // Include refined find bar.
  @import url('./path/to/refined-findbar.scss');
  ```

  Then use a [Sass transpiler](https://github.com/sass/sass) to get its CSS output,

  ```shell
  $ sass userChrome.scss userChrome.css
  ```
