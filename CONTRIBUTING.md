# Contributing

## Tools

- [Yarn](https://yarnpkg.com/) package manager.

- [VSCode](https://code.visualstudio.com/) text editor. The repo includes a
  [workspace configuration](./.vscode/) that configures VSCode to invoke
  [Prettier](https://prettier.io/) to upon save.

  If you choose to use a different text editor, please ensure that it is
  [EditorConfig](https://editorconfig.org/)-compliant, and run the `pretty:*` tasks before
  committing your changes.

<br>

## [NPM Tasks](./package.json)

<table>
<thead>
<tr>
<th>Task</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td valign="top"><code>build</code></td>
<td valign="top">

Builds [`refined-findbar.scss`](./src/refined-findbar.scss) to a `refined-findbar.css` file in the
`dist` folder.

</td>
</tr>
<tr>
<td valign="top"><code>watch</code></td>
<td valign="top">

Similar to `build`, but monitors the input file for changes.

</td>
</tr>
<tr>
<td valign="top"><code>clean</code></td>
<td valign="top">

Deletes build output (the `dist` folder).

</td>
</tr>
<tr>
<td valign="top"><code>pretty:check</code></td>
<td valign="top">

Runs [Prettier](https://prettier.io/) on the project and outputs any formatting issues.

</td>
</tr>
<tr>
<td valign="top"><code>pretty:write</code></td>
<td valign="top">

Runs [Prettier](https://prettier.io/) on the project and attempts to fix any formatting issues.

</td>
</tr>
</tbody>
</table>
