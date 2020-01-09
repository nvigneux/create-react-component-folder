const stringHelper = require('../utils/stringHelper')

/**
 * Creates React stateless functional component
 *
 * @param {String} componentName - Component name
 * @returns {String}
 */
function createReactFunctionalComponent(componentName) {
  const name = stringHelper.componentNameWithoutSpecialCharacter(componentName)

  return `import React from 'react';

const ${name} = () => {
  return (
    <div>
      ${name}
    </div>
  );
}

export default ${name};
  `
}
/**
 * Creates React stateless functional component with css modules
 *
 * @param {String} componentName - Component name
 * @returns {String}
 */
function createReactFunctionalComponentWithCssModules(componentName) {
  const name = stringHelper.componentNameWithoutSpecialCharacter(componentName)

  return `import React from 'react';

  // Utils & misc

import style from './${name}.module.css';

const ${name} = () => {
  return (
    <div>
      ${name}
    </div>
  );
}

export default ${name};
  `
}

/**
 * Creates React stateless functional component with prop types
 *
 * @param {String} componentName - Component name
 * @returns {String}
 */
function createReactFunctionalComponentWithProps(componentName) {
  const name = stringHelper.componentNameWithoutSpecialCharacter(componentName)

  return `import React from 'react';
import PropTypes from 'prop-types';

const ${name} = () => {
  return (
    <div>
      ${name}
    </div>
  );
}

${name}.propTypes = {

};

export default ${name};
  `
}
/**
 * Creates React stateless functional component with prop types & css modules
 *
 * @param {String} componentName - Component name
 * @returns {String}
 */
function createReactFunctionalComponentWithPropsWithCssModules(componentName) {
  const name = stringHelper.componentNameWithoutSpecialCharacter(componentName)

  return `import React from 'react';
import PropTypes from 'prop-types';

// Utils & misc

import style from './${name}.module.css';

const ${name} = () => {
  return (
    <div>
      ${name}
    </div>
  );
}

${name}.propTypes = {

};

export default ${name};
  `
}

/**
 * Creates default index file
 *
 * @param {String} componentName - Component name
 * @param {Boolean} upperCase - If true then capitalize first letter
 * @returns {String}
 */
function createIndex(componentName, upperCase) {
  return `export { default } from './${
    upperCase === true
      ? stringHelper.componentNameWithoutSpecialCharacter(componentName)
      : componentName
  }';`
}

/**
 * Creates index file includes all folder
 *
 * @param {Array} folders - folders array
 * @returns {String}
 */
function createIndexForFolders(folders) {
  return `${folders
    .map(folderName => `import ${folderName} from './${folderName}' \n`)
    .join('')}export {
    ${folders
      .map((folderName, index) => {
        if (index === folders.length - 1) return folderName

        return `${folderName}, \n`
      })
      .join('')}
}`
}

/**
 * Creates default test file for component
 *
 * @param {String} componentName - Component name
 * @param {Boolean} upperCase - If true then capitalize first letter
 * @param {Boolean} isTypeScript - Boolean check for Typescript
 * @returns {String}
 */
function createTest(componentName, upperCase, isTypeScript) {
  const componentNameUpperCase = stringHelper.componentNameWithoutSpecialCharacter(
    componentName
  )

  return `import ${isTypeScript ? '* as' : ''} React from 'react';
import { shallow } from 'enzyme';
import ${componentNameUpperCase} from './${
    upperCase === true ? componentNameUpperCase : componentName
  }';

describe('<${componentNameUpperCase} />', () => {
  test('renders', () => {
    const wrapper = shallow(<${componentNameUpperCase} />);
    expect(wrapper).toMatchSnapshot();
  });
});
  `
}
/**
 * Creates Stories for React component
 *
 * @param {String} componentName - Component name
 * @param {Boolean} upperCase - If true then capitalize first letter
 * @param {Boolean} isTypeScript - Boolean check for Typescript
 * @returns {String}
 */
function createReactComponentStories(componentName, upperCase, isTypeScript) {
  const componentNameUpperCase = stringHelper.capitalizeFirstLetter(
    componentName
  )
  const componentNameWithoutSpecialCharacter = stringHelper.componentNameWithoutSpecialCharacter(
    componentName
  )
  return `import ${isTypeScript ? '* as' : ''} React from 'react';
import { storiesOf } from '@storybook/react'
import ${componentNameWithoutSpecialCharacter} from './${componentName}';
storiesOf('${componentNameUpperCase}', module).add('${componentNameUpperCase}', () => (
    <div>
      <${componentNameWithoutSpecialCharacter}  />
    </div>

))`
}

module.exports = {
  createReactFunctionalComponent,
  createReactFunctionalComponentWithProps,
  createReactFunctionalComponentWithCssModules,
  createReactFunctionalComponentWithPropsWithCssModules,
  createIndex,
  createIndexForFolders,
  createTest,
  createReactComponentStories,
}
