# yFiles React Process Mining Component

[![NPM version](https://img.shields.io/npm/v/@yworks/react-yfiles-process-mining?style=flat)](https://www.npmjs.org/package/@yworks/react-yfiles-process-mining)

![Welcome playground](https://raw.githubusercontent.com/yWorks/react-yfiles-process-mining/main/assets/react-process-mining-hero.png)

Process mining is a technique that involves extracting insights from event logs to understand and improve business
processes. By analyzing event data, process mining techniques reveal the actual flow of processes, identify bottlenecks,
deviations, and opportunities for improvement.

The *yFiles React Process Mining Component* uses the [yFiles](https://www.yworks.com/yfiles-overview) library in order 
to extract interactive process mining diagrams from event-logs and load them into your React applications. This enhances 
the user experience and facilitates an intuitive exploration of complex processes.

## Getting Started

### Prerequisites

To use the Process Mining component, [yFiles for HTML](https://www.yworks.com/products/yfiles-for-html) is required.
You can evaluate yFiles for 60 days free of charge on [my.yworks.com](https://my.yworks.com/signup?product=YFILES_HTML_EVAL).
See [Licensing](https://docs.yworks.com/react-yfiles-process-mining/introduction/licensing) for more information on this topic.

You can learn how to work with the yFiles npm module in our [Developer’s Guide](https://docs.yworks.com/yfileshtml/#/dguide/yfiles_npm_module). A convenient way of getting access to yFiles is to use the [yFiles Dev Suite](https://www.npmjs.com/package/yfiles-dev-suite).


### Project Setup

1. **Installation**

   In addition to yFiles, the Process Mining component requires React to be installed in your project.
   If you want to start your project from scratch, we recommend using vite:
   ```
   npm create vite@latest my-process-mining-app -- --template react-ts
   ```

   Add the yFiles dependency:
   ```
   npm install <yFiles package path>/lib/yfiles-30.0.0+dev.tgz
   ```

   <details>

   <summary>Sample <code>package.json</code> dependencies</summary>
   The resulting package.json dependencies should resemble the following:

   ```json
      "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "@yfiles/yfiles": "./lib/yfiles-30.0.0+dev.tgz"
     }
   ```
   </details>

   Now, the component itself can be installed:
   ```bash
   npm install @yworks/react-yfiles-process-mining
   ```

2. **License**

   Be sure to invoke the `registerLicense` function before using the Process Mining React component.
   When evaluating yFiles, the license JSON file is found in the `lib/` folder of the yFiles for HTML evaluation package.
   For licensed users, the license data is provided separately.

   <details>

   <summary>License registration</summary>

   Import or paste your license data and register the license, e.g. in `App.tsx`:

   ```js
   import yFilesLicense from './license.json'

   registerLicense(yFilesLicense)
   ```
   </details>

3. **Stylesheet**

   Make sure to import the CSS stylesheet as well:

   ```js
   import '@yworks/react-yfiles-process-mining/dist/index.css'
   ```

4. **Usage**

   You are now all set to utilize the Process Mining component with your data!
   See a basic example `App.tsx` below:

   ```tsx
   import {
     ProcessMining,
     registerLicense
   } from '@yworks/react-yfiles-process-mining'

   import '@yworks/react-yfiles-process-mining/dist/index.css'

   import yFilesLicense from './license.json'

   registerLicense(yFilesLicense)

   const eventLog = [
     { caseId: 0, activity: 'Start', timestamp: 8.383561495922297, duration: 0.0006804154279300233 },
     { caseId: 0, activity: 'Step A', timestamp: 8.928697652413142, duration: 0.10316578562597925 },
     { caseId: 0, activity: 'Step B', timestamp: 9.576999594529966, duration: 0.041202953341980784 },
     { caseId: 0, activity: 'End', timestamp: 10.163338704362792, duration: 0.2746326125522593 }
   ]

   function App() {
     return <ProcessMining eventLog={eventLog}></ProcessMining>
   }

   export default App
   ```

   > **Note:** By default, the Process Mining component adjusts its size to match the size of its 
   > parent element. Therefore, it is necessary to set the dimensions of the containing element or apply styling 
   > directly to the Process Mining component. This can be achieved by defining a CSS class or 
   > applying inline styles.

## Live Playground

[![Live Playground](https://raw.githubusercontent.com/yWorks/react-yfiles-process-mining/main/assets/welcome-playground.png)](https://docs.yworks.com/react-yfiles-process-mining/introduction/welcome)

Try the yFiles React Process Mining component directly in your browser with our [playground](https://docs.yworks.com/react-yfiles-process-mining/introduction/welcome).


## Licensing

All owners of a valid software license for [yFiles for HTML](https://www.yworks.com/products/yfiles-for-html)
are allowed to use these sources as the basis for their own [yFiles for HTML](https://www.yworks.com/products/yfiles-for-html)
powered applications.

Use of such programs is governed by the rights and conditions as set out in the
[yFiles for HTML license agreement](https://www.yworks.com/products/yfiles-for-html/sla).

You can evaluate yFiles for 60 days free of charge on [my.yworks.com](https://my.yworks.com/signup?product=YFILES_HTML_EVAL).

For more information, see the `LICENSE` file.


## Learn More

Explore the possibilities of visualizing process mining diagrams with the yFiles Process Mining Component. For further 
information about [yFiles for HTML](https://www.yworks.com/yfiles-overview) and our company, please visit [yWorks.com](https://www.yworks.com).

If you are exploring a different use case and require another React component,
please take a look at the available [React components](https://www.yworks.com/yfiles-react-components) powered by yFiles!

For support or feedback, please reach out to [our support team](https://www.yworks.com/products/yfiles/support) or open an issue on GitHub. Happy diagramming!

