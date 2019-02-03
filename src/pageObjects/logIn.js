const MySitesPage = require('./mySites')
const { By, Key, until} = require('selenium-webdriver');

class LogInPage{
    constructor(driver){
        this.driver = driver
    }

    async logIn(username, password){
        await this.driver.get('https://webflow.com/dashboard/login');
        await this.driver.findElement(By.name('username')).sendKeys(username);
        await this.driver.findElement(By.name('password')).sendKeys(password, Key.RETURN);
        await this.driver.wait(until.titleIs('My Sites - Webflow'), 6000);
        return new MySitesPage(this.driver)
    }



}

module.exports = LogInPage