import commands from './flows/commands'
import interactive from './flows/interactive'
import colorLog from './utils/colorLog'
//import updateImages from './utils/updateImages'

const main = async () => {
    if (process.argv.length < 3) {
        await interactive()
    } else {
        await commands([...process.argv].splice(2))
    }
}

main().catch(e => {
    console.error(e)
    colorLog(`${e} `, 'error')
})

const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT']
signals.forEach((signal) => process.on(signal, async () => {
    console.log("")
    colorLog("Exiting...")
    process.exit();
}));
