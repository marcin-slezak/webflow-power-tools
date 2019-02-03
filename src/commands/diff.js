const {Command, flags} = require('@oclif/command')
const { Builder, By, Key, until} = require('selenium-webdriver');
const chromeDriver = require('selenium-webdriver/chrome');
const path = require('path');
const uuidv4 = require('uuid/v4');
const fs   = require('fs');
const unzipper = require('unzipper')
const LogInPage = require('../pageObjects/logIn')
const waitOn = require('wait-on');
const exec = require("child_process").exec
const cli = require('cli-ux').cli
const Listr = require('listr');
require('chromedriver');

async function getDriver(opt = {}) {
  let options = new chromeDriver.Options();
  options.addArguments('start-maximized');
  options.setUserPreferences({ 'download.default_directory': opt.downloadFolder || path.resolve( "./tmp") });
  let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  return driver;
}

class DiffCommand extends Command {
  async run() {
    
    
    const { project1, project2 } = await this.getProjectsNames();
    
    const { username, password } = await this.getUsernameAndPassword();
    
    
    const tempFolder = uuidv4();
    const tempFolderPath = path.resolve(`./tmp/${tempFolder}`)
    let driver = await getDriver({downloadFolder: tempFolderPath});
    
    const zip1Path = path.resolve(`./tmp/${tempFolder}/${project1}.webflow.zip`)
    const zip2Path = path.resolve(`./tmp/${tempFolder}/${project2}.webflow.zip`)
    
    const unziped1 = path.resolve(`./tmp/${tempFolder}/${project1}`)
    const unziped2 = path.resolve(`./tmp/${tempFolder}/${project2}`)
    
    const tasks = new Listr([
      {
        title: 'Create temp folder',
        task: () => {
          return fs.mkdirSync(tempFolderPath);
        }
      },
      {
        title: 'Login',
        task: async ctx => {
          const logIn = new LogInPage(driver)
          ctx.mySitePage = await logIn.logIn(username, password)      
        }
      }, {
          title: 'Export project 1',
          task: async ctx => {
            const designPageProject1 = await ctx.mySitePage.goToProjectDesign(project1)
            await designPageProject1.exportProject()
          }
      },
      {
        title: 'Export project 2',
        task: async ctx => {
          const designPageProject2 = await ctx.mySitePage.goToProjectDesign(project2)
          await designPageProject2.exportProject()
          return await waitOn({
            resources: [zip1Path, zip2Path],
            timeout: 30000
          })
        }
      },
      {
        title: 'Unzip',
        task: async ctx => {
          await fs.createReadStream(zip1Path)
          .pipe(unzipper.Extract({ path: unziped1 }))
          .promise()
          
          await fs.createReadStream(zip2Path)
          .pipe(unzipper.Extract({ path: unziped2 }))
          .promise()
        }
      },
      {
        title: 'Run diff',
        task: async ctx => {
          exec(`meld ${unziped1} ${unziped2}`).unref()
        }
      }
    ])

    try{
      return await tasks.run()
    }catch(err){
      console.error(err);
    }
  }  


  async getUsernameAndPassword() {
    const {flags} = this.parse(DiffCommand)
    let username = flags.username;
    let password = flags.password;
    if (!username) {
      username = await cli.prompt('What is your webflow username?');
    }
    if (!password) {
      password = await cli.prompt('What is your password?');
    }
    return { username, password };
  }

  async getProjectsNames() {
    const {args} = this.parse(DiffCommand)
    let project1 = args.project_1;
    let project2 = args.project_2;
    if (!project1) {
      project1 = await cli.prompt('What is your project_1 short name?');
    }
    if (!project2) {
      project2 = await cli.prompt('What is your project_2 short name?');
    }
    return { project1, project2 };
  }
}  

DiffCommand.description = `Describe the command here
...
Extra documentation goes here
`

DiffCommand.flags = {
  username: flags.string({char: 'u', description: 'webflow username', required: false}),
  password: flags.string({char: 'p', description: 'password', required: false}),
}  

DiffCommand.args = [
  {name: 'project_1', required: false},
  {name: 'project_2', required: false}
]

module.exports = DiffCommand


