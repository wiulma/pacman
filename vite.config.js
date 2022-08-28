import path from "path"

const htmlImport = {
  name: "htmlImport",
  /**
   * Checks to ensure that a html file is being imported.
   * If it is then it alters the code being passed as being a string being exported by default.
   * @param {string} code The file as a string.
   * @param {string} id The absolute path.
   * @returns {{code: string}}
   */
  transform(code, id) {
    if (/^.*\.html$/g.test(id)) {
      code = `export default \`${code}\``
    }
    return { code }
  },
}

export default {
  root: path.join(__dirname, "src"),
  build: {
    outDir: path.join(__dirname, "dist"),
  },
  server: {
    host: true,
  },
}
