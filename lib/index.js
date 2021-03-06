#!/usr/bin/env node

const path = require('path')
const program = require('commander')
const chalk = require('chalk')
const logger = require('./logger')
const fs = require('./utils/fileHelpers')
const {
  createReactFunctionalComponent,
  createReactFunctionalComponentWithProps,
  createReactFunctionalComponentWithCssModules,
  createReactFunctionalComponentWithPropsWithCssModules,
  createIndex,
  createTest,
  createReactComponentStories,
} = require('./data/componentData')
const formatPrettier = require('./utils/format')
const stringHelper = require('./utils/stringHelper')
const {
  getComponentName,
  getComponentParentFolder,
} = require('./utils/componentsHelpers.js')
const removeOptionsFromArgs = require('./utils/removeOptionsFromArgs')
const createMultiIndex = require('./utils/createMultiIndex')
const logComponentTree = require('./utils/logComponentTree')
const validateArguments = require('./utils/validateArguments')
const getDefaultConfig = require('./utils/getDefaultConfig')

// Root directory
const ROOT_DIR = process.cwd()

// Grab provided args
let [, , ...args] = process.argv

// Get the default config
const defaultConfig = getDefaultConfig()
const config =
  defaultConfig && defaultConfig.config ? defaultConfig.config : null

// Set command line interface options for cli
program
  .version('0.1.0')
  .option('--nocss', 'No css file')
  .option('--test', 'Add test file')
  .option(
    '--cssmodules',
    'Creates css/less/scss file with .module extensions. Example component.module.css'
  )
  .option(
    '--createindex',
    'Creates index.js file for multple component imports'
  )
  .option('-j, --jsx', 'Creates the component file with .jsx extension')
  .option('-l, --less', 'Adds .less file to component')
  .option('-s, --scss', 'Adds .scss file to component')
  .option('-p, --proptypes', 'Adds prop-types to component')
  .option('-u, --uppercase', 'Component files start on uppercase letter')
  .option('-d, --default', 'Uses a default configuration if available')
  .option('-sb, --stories', 'Add Story file to component')
  .parse(process.argv)

// Remove Node process args options
args = removeOptionsFromArgs(args)

/**
 * Creates files for component
 *
 * @param {String} componentName - Component name
 * @param {String} componentPath - File system path to component
 * @param {String|null} cssFileExt - css file extension (css, less, sass or null)
 */
function createFiles(componentName, componentPath, cssFileExt) {
  const { jsx, test, uppercase, proptypes, stories, cssmodules } = program

  return new Promise(resolve => {
    // File extension
    const ext = 'js'
    const jsxExt = 'jsx'
    const indexFile = `index.${ext}`
    let name = componentName
    const isJsxFile = jsx || (config && config.includes('jsx')) || false
    const componentFileName = `${name}.${isJsxFile ? jsxExt : ext}`
    // file names to create
    const files = [indexFile, componentFileName]
    // Prettier options property
    const prettierParser = 'babel'
    // Prettier parser options
    const prettierOptions = { semi: false }

    // Add test
    if (test && !(config && config.includes('test'))) {
      if (config && config.includes('spec')) {
        files.push(`${name}.spec.${ext}`)
      } else {
        files.push(`${name}.test.${ext}`)
      }
    }

    // Add Storie for storbook
    if (stories || (config && config.includes('stories'))) {
      files.push(`${name}.stories.${ext}`)
    }

    // Add css | less | sass file if desired
    if (cssFileExt) {
      const isCssModules =
        cssmodules || (config && config.includes('cssmodules'))
      files.push(`${name}.${isCssModules ? 'module.' : ''}${cssFileExt}`)
    }

    if (uppercase || (config && config.includes('uppercase'))) {
      name = stringHelper.capitalizeFirstLetter(name)

      for (let i = 0; i < files.length; i += 1) {
        if (i !== 0) {
          files.splice(i, 1, stringHelper.capitalizeFirstLetter(files[i]))
        }
      }
    }

    // Create component folder
    fs.createDirectorys(componentPath)
      .then(() => {
        // Create index.js
        const promises = []

        for (let i = 0; i < files.length; i += 1) {
          const file = files[i]
          const filePath = path.join(componentPath, file)
          let data = ''

          if (file === indexFile) {
            data = createIndex(
              name,
              uppercase || (config && config.includes('uppercase'))
            )
            promises.push(
              fs.writeFileAsync(
                filePath,
                formatPrettier(data, prettierParser, prettierOptions)
              )
            )
          } else if (
            file === `${name}.${ext}` ||
            file === `${name}.${jsxExt}`
          ) {
            if (proptypes || (config && config.includes('proptypes'))) {
              if (cssmodules || (config && config.includes('cssmodules'))) {
                data = createReactFunctionalComponentWithPropsWithCssModules(
                  name
                )
              } else {
                data = createReactFunctionalComponentWithProps(name)
              }
            } else if (
              cssmodules ||
              (config && config.includes('cssmodules'))
            ) {
              data = createReactFunctionalComponentWithCssModules(name)
            } else {
              data = createReactFunctionalComponent(name)
            }

            promises.push(
              fs.writeFileAsync(
                filePath,
                formatPrettier(data, prettierParser, prettierOptions)
              )
            )
          } else if (
            file.indexOf(`.spec.${ext}`) > -1 ||
            file.indexOf(`.test.${ext}`) > -1
          ) {
            data = createTest(
              name,
              uppercase || (config && config.includes('uppercase')),
              false
            )

            if (test && !(config && config.includes('test'))) {
              promises.push(
                fs.writeFileAsync(
                  filePath,
                  formatPrettier(data, prettierParser, prettierOptions)
                )
              )
            }
          }

          if (
            (file.indexOf(`.stories.${ext}`) ||
              file.indexOf(`.stories.${ext}`)) > -1
          ) {
            data = createReactComponentStories(
              name,
              uppercase || (config && config.includes('uppercase')),
              false
            )
            promises.push(
              fs.writeFileAsync(
                filePath,
                formatPrettier(data, prettierParser, prettierOptions)
              )
            )
          } else if (
            file.indexOf('.css') > -1 ||
            file.indexOf('.less') > -1 ||
            file.indexOf('.scss') > -1
          ) {
            promises.push(fs.writeFileAsync(filePath, ''))
          }
        }

        Promise.all(promises).then(() => resolve(files))
      })
      .catch(e => {
        logger.error(e)
        process.exit()
      })
  })
}

/**
 * Initializes create react component
 */
function initialize() {
  // Start timer
  /* eslint-disable no-console */
  console.time('✨  Finished in')
  const promises = []
  // Set component name, path and full path
  const componentPath = path.join(ROOT_DIR, args[0])
  const folderPath = getComponentParentFolder(componentPath)

  if (program.createindex === true) {
    createMultiIndex(componentPath)
    return
  }

  const isValidArgs = validateArguments(args, program)

  if (!isValidArgs) {
    return
  }

  fs.existsSyncAsync(componentPath)
    .then(() => {
      logger.animateStart('Creating components files...')

      let cssFileExt = 'css'

      if (program.less || (config && config.includes('less'))) {
        cssFileExt = 'less'
      }

      if (program.scss || (config && config.includes('scss'))) {
        cssFileExt = 'scss'
      }

      if (program.nocss || (config && config.includes('nocss'))) {
        cssFileExt = null
      }

      for (let i = 0; i < args.length; i += 1) {
        const name = getComponentName(args[i])
        promises.push(createFiles(name, folderPath + name, cssFileExt))
      }

      return Promise.all(promises)
    })
    .then(filesArrData => {
      logger.log(chalk.cyan('Created new React components at: '))
      // Logs component file tree
      logComponentTree(filesArrData, folderPath)
      logger.log()
      // Stop animating in console
      logger.animateStop()
      // Stop timer
      console.timeEnd('✨  Finished in')
      // Log output to console
      logger.done('Success!')
    })
    .catch(error => {
      if (error.message === 'false') {
        logger.error(`Folder already exists at ..${componentPath}`)
        return
      }

      logger.error(error)
    })
}

// Start script
initialize()
