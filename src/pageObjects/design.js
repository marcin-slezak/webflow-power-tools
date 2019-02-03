const { By, until} = require('selenium-webdriver');

const timeout = 60 *1000

class DesignPage{
    constructor(driver){
        this.driver = driver
    }
    
    async exportProject(){
        await this.driver.wait(until.elementIsNotVisible(this.driver.findElement(By.id('preloader'))), timeout);
        await this.driver.findElement(By.className('bem-TopBar_Body_ExportButton')).click()
        await this.driver.wait(until.elementLocated(By.xpath("//*[text() = 'Prepare ZIP']")), timeout);
        await this.driver.findElement(By.xpath("//*[text() = 'Prepare ZIP']")).click()
        await this.driver.wait(until.elementLocated(By.xpath("//*[text() = 'Download ZIP']")), timeout);
        await this.driver.findElement(By.xpath("//*[text() = 'Download ZIP']")).click()      
    }
}

module.exports = DesignPage