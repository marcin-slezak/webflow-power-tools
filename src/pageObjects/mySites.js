
const DesignPage = require('./design')

class MySitesPage{
    constructor(driver){
        this.driver = driver
    }

    async goToProjectDesign(projectSortName){
        await this.driver.get(`https://webflow.com/design/${projectSortName}`)
        return new DesignPage(this.driver)
    }
}

module.exports = MySitesPage